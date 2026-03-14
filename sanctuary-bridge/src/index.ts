import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import PocketBase from 'pocketbase';
import { EventSource } from 'eventsource';
import OBSWebSocket from 'obs-websocket-js';
import { logger } from './logger';

// Load advanced user configuration (if exists)
let advancedConfig: Record<string, string> = {};
try {
  // Check multiple locations for config.json
  const possiblePaths = [
    path.join(process.cwd(), 'config.json'),
    path.join(path.dirname(process.execPath), 'config.json'),
    // Also check directory of the script if running via node/tsx
    path.join(__dirname, '..', 'config.json')
  ];

  let configPath = '';
  for (const p of possiblePaths) {
    if (fs.existsSync(p) && !fs.statSync(p).isDirectory()) {
      configPath = p;
      break;
    }
  }

  if (configPath) {
    advancedConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    logger.info(`🔧 Loaded advanced configuration from ${configPath}`);
  }
} catch (e) {
  logger.warn('Failed to parse config.json, falling back to ENV variables');
}

// Helper to get config from either JSON file or ENV (JSON takes precedence for super users)
const getConfig = (key: string, defaultValue: string = ''): string => {
  return advancedConfig[key] || process.env[key] || defaultValue;
};

// Polyfill EventSource for Node.js (required by PocketBase SDK for realtime)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (typeof (global as any).EventSource === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).EventSource = EventSource;
}

import { CommandRecord } from './types';
import { uploadFile } from './google-drive';
import { fromPromise } from '@shared/result';
import { AsyncIO } from '@shared/io';
import { throttle } from '@shared/performance';

// Constants for performance tuning
const MAX_RECONNECT_ATTEMPTS = 5;
const STATUS_UPDATE_THROTTLE_MS = 2000; // 2 seconds (avoid spam)

class SanctuaryBridge {
  private pb: PocketBase;
  private obs: OBSWebSocket;
  private streamId: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = MAX_RECONNECT_ATTEMPTS;
  private heartbeatInterval?: NodeJS.Timeout;

  // Throttled status update to avoid overwhelming PocketBase
  private throttledStatusUpdate: (status: string) => void;

  constructor() {
    const pbUrl = getConfig('PB_URL', 'http://127.0.0.1:8090');
    this.pb = new PocketBase(pbUrl);
    this.obs = new OBSWebSocket();
    this.streamId = getConfig('STREAM_ID');

    if (!this.streamId) {
      throw new Error('STREAM_ID configuration is required (via ENV or config.json)');
    }

    // Create throttled version of updateStreamStatus
    this.throttledStatusUpdate = throttle(
      /* v8 ignore next 4 */
      (status: string) => { 
        this.updateStreamStatus(status).catch(err => 
          logger.error('Throttled status update failed:', err)
        );
      },
      STATUS_UPDATE_THROTTLE_MS
    );
  }

  async start() {
    logger.info('🚀 Starting Sanctuary Bridge...');
    const authResult = await fromPromise(
      () => this.authenticatePocketBase(),
      (e: unknown) => (e instanceof Error ? e : new Error(String(e)))
    );

    if (authResult._tag === 'failure') {
      logger.error('Failed to start bridge during authentication:', authResult.error);
      process.exit(1);
      return;
    }

    // Now that we're authenticated, we can update status
    this.throttledStatusUpdate('starting');

    const obsResult = await fromPromise(
      () => this.connectOBS(),
      (e: unknown) => (e instanceof Error ? e : new Error(String(e)))
    );

    // We don't exit if OBS fails, as it has its own retry logic
    if (obsResult._tag === 'failure') {
      logger.warn('Initial OBS connection failed, will retry...');
    }

    this.subscribeToCommands();
    this.startHeartbeat();
    logger.info('🚀 Sanctuary Bridge started successfully');
  }

  private async authenticatePocketBase() {
    const email = getConfig('BRIDGE_EMAIL', 'bridge@local.dev');
    const password = getConfig('BRIDGE_PASS', 'bridge123456');
    logger.info(`Attempting PocketBase auth for ${email} at ${this.pb.baseUrl}...`);
    return this.pb.collection('users').authWithPassword(email, password);
  }

  private async connectOBS() {
    const obsUrl = getConfig('OBS_URL', 'ws://127.0.0.1:4455');
    const obsPassword = getConfig('OBS_PASS', '');

    await this.obs.connect(obsUrl, obsPassword);
    logger.info('✅ Connected to OBS WebSocket');
    this.reconnectAttempts = 0;
    this.setupOBSHandlers();
  }

  private setupOBSHandlers() {
    this.obs.on('Identified', () => {
      logger.info('OBS connection identified');
    });

    this.obs.on('ConnectionClosed', async () => {
      logger.warn('OBS connection closed, attempting reconnect...');
      await this.handleOBSReconnect();
    });

    this.obs.on('StreamStateChanged', async (data) => {
      logger.info('Stream state changed:', data);
      await this.updateStreamStatus(data.outputActive ? 'live' : 'idle');
    });

    this.obs.on('RecordStateChanged', async (data) => {
      logger.info('Record state changed:', data);
      await this.updateStreamStatus(data.outputActive ? 'recording' : 'idle');

      // Auto-upload when recording stops
      if (!data.outputActive && data.outputPath) {
        const outputPath = data.outputPath;
        logger.info(`Recording finished: ${outputPath}`);
        // Run in background so we don't block the event loop
        uploadFile(outputPath).then(async (fileId) => {
          logger.info(`✅ Upload complete! File ID: ${fileId}`);
          try {
            await this.pb.collection('recordings').create({
              title: path.basename(outputPath),
              file_id: fileId,
              stream_id: this.streamId,
              size: fs.existsSync(outputPath) ? fs.statSync(outputPath).size : 0
            });
            logger.info('✅ Recording record created in PocketBase');
          } catch (pbErr) {
            logger.error(`Failed to create recording record: ${pbErr}`);
          }
        }).catch(err => {
          logger.error('Background upload failed:', err);
        });
      }    });
  }

  private async handleOBSReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('Max OBS reconnection attempts reached');
      await this.updateStreamStatus('error');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    logger.info(`Reconnecting to OBS in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => this.connectOBS(), delay);
  }

  private subscribeToCommands() {
    this.pb.collection('commands').subscribe<CommandRecord>('*', async (e) => {
      logger.info(`Received realtime event: ${e.action} for record ${e.record.id} (executed: ${e.record.executed})`);
      if (e.action === 'create' && !e.record.executed) {
        await this.executeCommand(e.record);
      }
    });
    logger.info('✅ Subscribed to command changes');
  }

  /**
   * Public for testing - executes a command record against OBS
   */
  public async executeCommand(command: CommandRecord) {
    logger.info(`Executing command: ${command.action} (${command.correlation_id})`);

    const actionMap: Record<string, () => Promise<unknown>> = {
      'START': () => this.obs.call('StartStream'),
      'STOP': () => this.obs.call('StopStream'),
      'RECORD_START': () => this.obs.call('StartRecord'),
      'RECORD_STOP': () => this.obs.call('StopRecord'),
      'SET_STREAM_SETTINGS': async () => {
        const service = command.payload?.service as string;
        const server = command.payload?.server as string;
        const key = command.payload?.key as string;

        if (!service || !key) {
          throw new Error('Missing service or key in payload for SET_STREAM_SETTINGS');
        }
        return this.obs.call('SetStreamServiceSettings', {
          streamServiceType: 'rtmp_common',
          streamServiceSettings: {
            service: service,
            server: server || 'auto',
            key: key
          }
        });
      },
      'SET_VIDEO_SETTINGS': async () => {
        const baseWidth = command.payload?.baseWidth as number;
        const baseHeight = command.payload?.baseHeight as number;
        const outputWidth = command.payload?.outputWidth as number;
        const outputHeight = command.payload?.outputHeight as number;
        const fpsNum = command.payload?.fpsNum as number;
        const fpsDen = command.payload?.fpsDen as number;

        if (!baseWidth || !baseHeight || !fpsNum) {
          throw new Error('Missing video settings in payload for SET_VIDEO_SETTINGS');
        }

        logger.info(`Setting video: ${baseWidth}x${baseHeight} @ ${fpsNum}/${fpsDen}fps`);
        return this.obs.call('SetVideoSettings', {
          baseWidth,
          baseHeight,
          outputWidth: outputWidth || baseWidth,
          outputHeight: outputHeight || baseHeight,
          fpsNumerator: fpsNum,
          fpsDenominator: fpsDen || 1,
        });
      },
      'SET_STREAM_ENCODER': async () => {
        const encoder = command.payload?.encoder as string;
        const settings = command.payload?.settings as Record<string, unknown>;

        if (!encoder || !settings) {
          throw new Error('Missing encoder or settings in payload for SET_STREAM_ENCODER');
        }

        logger.info(`Setting encoder: ${encoder} with bitrate ${settings.bitrate}`);
        
        const currentSettings = await this.obs.call('GetStreamServiceSettings');
        
        return this.obs.call('SetStreamServiceSettings', {
          streamServiceType: currentSettings.streamServiceType || 'rtmp_common',
          streamServiceSettings: {
            ...currentSettings.streamServiceSettings,
            encoder: encoder,
            ...settings,
          }
        });
      },
      'SET_AUDIO_SETTINGS': async () => {
        const sampleRate = command.payload?.sampleRate as number;
        const channels = command.payload?.channels as number;
        const bitrate = command.payload?.bitrate as number;

        if (!sampleRate) {
          throw new Error('Missing audio settings in payload for SET_AUDIO_SETTINGS');
        }

        logger.info(`Setting audio: ${sampleRate}Hz, ${channels}ch, ${bitrate}kbps`);
        
        logger.warn('Audio settings update - may require OBS restart or profile reload');
        
        await this.pb.collection('streams').update(this.streamId, {
          metadata: {
            audio_settings: {
              sampleRate,
              channels,
              bitrate,
              updated: new Date().toISOString()
            }
          }
        });

        return { success: true, message: 'Audio settings stored. Apply via OBS settings menu.' };
      },
      'SET_MUTE': async () => {
        const inputName = command.payload?.inputName as string;
        const muted = command.payload?.muted as boolean;

        if (!inputName) {
          throw new Error('Missing inputName in payload for SET_MUTE');
        }

        logger.info(`Setting mute for ${inputName}: ${muted}`);
        return this.obs.call('SetInputMute', { inputName, inputMuted: muted });
      },
      'SET_SCENE': async () => {
        const sceneName = command.payload?.sceneName as string;

        if (!sceneName) {
          throw new Error('Missing sceneName in payload for SET_SCENE');
        }

        logger.info(`Setting scene to: ${sceneName}`);
        return this.obs.call('SetCurrentProgramScene', { sceneName });
      }
    };

    const action = actionMap[command.action];
    if (!action) {
      const errorStr = `Unknown command action: ${command.action}`;
      logger.error(errorStr);
      await this.pb.collection('commands').update(command.id, { executed: true, error_message: errorStr });
      return;
    }

    const result = await fromPromise(
      () => action(),
      (e: unknown) => (e instanceof Error ? e : new Error(String(e)))
    );

    if (result._tag === 'success') {
      const nextStatus = command.action.includes('START') ?
        (command.action.startsWith('RECORD') ? 'recording' : 'live') : 'idle';

      await this.updateStreamStatus(nextStatus);
      await this.pb.collection('commands').update(command.id, { executed: true });
      logger.info(`✅ Command executed: ${command.action}`);
    } else {
      const message = result.error.message;
      logger.error(`Failed to execute command ${command.action}:`, result.error);
      // BUG FIX: Explicitly include error_message in update call
      await this.pb.collection('commands').update(command.id, { 
        executed: true, 
        error_message: String(message) 
      });
      await this.updateStreamStatus('error');
    }
  }

  private async updateStreamStatus(status: string) {
    const updateIo = new AsyncIO(async () => {
      interface QualityMetrics {
        dropped_frames?: number;
        fps?: number;
        cpu_usage?: number;
      }

      interface StreamMetadata {
        outputActive?: boolean;
        outputDuration?: number;
        outputBytes?: number;
        quality?: QualityMetrics;
        scenes?: string[];
        currentScene?: string;
        inputs?: { name: string; muted: boolean; volume: number }[];
      }

      const update: {
        status: string;
        heartbeat: string;
        metadata?: StreamMetadata;
      } = {
        status,
        heartbeat: new Date().toISOString()
      };

      const obsStatusResult = await fromPromise(
        () => this.obs.call('GetStreamStatus'),
        (e: unknown) => (e instanceof Error ? e : new Error(String(e)))
      );

      const obsStatsResult = await fromPromise(
        () => this.obs.call('GetStats'),
        (e: unknown) => (e instanceof Error ? e : new Error(String(e)))
      );

      const sceneListResult = await fromPromise(
        () => this.obs.call('GetSceneList'),
        (e: unknown) => (e instanceof Error ? e : new Error(String(e)))
      );

      const inputListResult = await fromPromise(
        () => this.obs.call('GetInputList'),
        (e: unknown) => (e instanceof Error ? e : new Error(String(e)))
      );

      if (obsStatusResult._tag === 'success') {
        const s = obsStatusResult.value;
        update.metadata = {
          outputActive: s.outputActive,
          outputDuration: s.outputDuration,
          outputBytes: s.outputBytes,
          quality: {
            dropped_frames: s.outputSkippedFrames as number,
          }
        };

        if (obsStatsResult._tag === 'success') {
          const stats = obsStatsResult.value;
          update.metadata.quality = {
            ...update.metadata.quality,
            fps: stats.activeFps as number,
            cpu_usage: stats.cpuUsage as number
          };
        }

        if (sceneListResult._tag === 'success' && sceneListResult.value && sceneListResult.value.scenes && Array.isArray(sceneListResult.value.scenes)) {
          const sceneList = sceneListResult.value;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          update.metadata.scenes = sceneList.scenes.map((s: any) => s.sceneName);
          update.metadata.currentScene = sceneList.currentProgramSceneName;
        }

        if (inputListResult._tag === 'success' && inputListResult.value && inputListResult.value.inputs && Array.isArray(inputListResult.value.inputs)) {
          const inputList = inputListResult.value;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const inputs: any[] = [];
          for (const input of inputList.inputs) {
            const inputKind = input.inputKind as string;
            const inputName = input.inputName as string;
            if (input && ['wasapi_input_capture', 'wasapi_output_capture', 'coreaudio_input_capture', 'coreaudio_output_capture'].includes(inputKind)) {
               const muteStatus = await this.obs.call('GetInputMute', { inputName });
               inputs.push({
                 name: inputName,
                 muted: muteStatus.inputMuted as boolean,
                 volume: 0 // We could also fetch volume if needed
               });
            }
          }
          update.metadata.inputs = inputs;
        }
      }

      await this.pb.collection('streams').update(this.streamId, update);
    });

    const result = await updateIo.attempt();
    /* v8 ignore next 3 */
    if (result._tag === 'failure') {
      logger.error('Failed to update stream status:', result.error);
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(async () => {
      try {
        await this.pb.collection('streams').update(this.streamId, {
          heartbeat: new Date().toISOString()
        });
      } catch (error) {
        /* v8 ignore next 2 */
        logger.error('Heartbeat failed:', error);
      }
    }, 10000); // Every 10 seconds

    logger.info('✅ Heartbeat started (10s interval)');
  }

  async shutdown() {
    logger.info('Shutting down Sanctuary Bridge...');

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    try {
      await this.obs.disconnect();
      await this.pb.realtime.unsubscribe();
      logger.info('✅ Shutdown complete');
    } catch (error) {
      logger.error('Error during shutdown:', error);
    }
  }
}

// Main execution
const bridge = new SanctuaryBridge();

/* v8 ignore start */
process.on('SIGINT', async () => {
  await bridge.shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await bridge.shutdown();
  process.exit(0);
});

if (process.env.NODE_ENV !== 'test') {
  bridge.start();
}
/* v8 ignore stop */

export { SanctuaryBridge };
