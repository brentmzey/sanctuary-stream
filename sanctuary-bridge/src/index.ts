import 'dotenv/config';
import PocketBase from 'pocketbase';
import OBSWebSocket from 'obs-websocket-js';
import { logger } from './logger';
import { CommandRecord } from './types';
import { uploadFile } from './google-drive';

// Functional programming faculties
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

const ok = <T>(value: T): Result<T, any> => ({ ok: true, value });
const fail = <E>(error: E): Result<any, E> => ({ ok: false, error });

const wrapAsync = async <T>(promise: Promise<T>): Promise<Result<T>> => {
  try {
    const value = await promise;
    return ok(value);
  } catch (error) {
    return fail(error instanceof Error ? error : new Error(String(error)));
  }
};

class SanctuaryBridge {
  private pb: PocketBase;
  private obs: OBSWebSocket;
  private streamId: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private heartbeatInterval?: NodeJS.Timeout;

  constructor() {
    const pbUrl = process.env.PB_URL || 'http://127.0.0.1:8090';
    this.pb = new PocketBase(pbUrl);
    this.obs = new OBSWebSocket();
    this.streamId = process.env.STREAM_ID || '';

    if (!this.streamId) {
      throw new Error('STREAM_ID environment variable is required');
    }
  }

  async start() {
    const authResult = await wrapAsync(this.authenticatePocketBase());
    if (!authResult.ok) {
        logger.error('Failed to start bridge during authentication:', authResult.error);
        process.exit(1);
    }

    const obsResult = await wrapAsync(this.connectOBS());
    // We don't exit if OBS fails, as it has its own retry logic
    if (!obsResult.ok) {
        logger.warn('Initial OBS connection failed, will retry...');
    }
      
    this.subscribeToCommands();
    this.startHeartbeat();
    logger.info('🚀 Sanctuary Bridge started successfully');
  }

  private async authenticatePocketBase() {
    const email = process.env.BRIDGE_EMAIL || 'bridge@local.dev';
    const password = process.env.BRIDGE_PASS || 'bridge123456';
    return this.pb.collection('users').authWithPassword(email, password);
  }

  private async connectOBS() {
    const obsUrl = process.env.OBS_URL || 'ws://127.0.0.1:4455';
    const obsPassword = process.env.OBS_PASS || '';

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
        logger.info(`Recording finished: ${data.outputPath}`);
        // Run in background so we don't block the event loop
        uploadFile(data.outputPath).catch(err => {
            logger.error('Background upload failed:', err);
        });
      }
    });
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
      if (e.action === 'create' && !e.record.executed) {
        await this.executeCommand(e.record);
      }
    });

    logger.info('✅ Subscribed to command changes');
  }

  private async executeCommand(command: CommandRecord) {
    logger.info(`Executing command: ${command.action} (${command.correlation_id})`);

    const actionMap: Record<string, () => Promise<any>> = {
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
          // specific mapping for common services if needed, or pass through
          // OBS "rtmp_common" settings usually require 'service', 'server', 'key'
          return this.obs.call('SetStreamServiceSettings', {
            streamServiceType: 'rtmp_common',
            streamServiceSettings: {
              service: service, // e.g. 'YouTube - RTMPS' or 'Twitch'
              server: server || 'auto',
              key: key
            }
          });
        }
    };

    const action = actionMap[command.action];
    if (!action) {
        const error = `Unknown command action: ${command.action}`;
        logger.error(error);
        await this.pb.collection('commands').update(command.id, { executed: true, error_message: error });
        return;
    }

    const result = await wrapAsync(action());

    if (result.ok) {
        const nextStatus = command.action.includes('START') ? 
            (command.action.startsWith('RECORD') ? 'recording' : 'live') : 'idle';
        
        await this.updateStreamStatus(nextStatus);
        await this.pb.collection('commands').update(command.id, { executed: true });
        logger.info(`✅ Command executed: ${command.action}`);
    } else {
        const message = result.error.message;
        logger.error(`Failed to execute command ${command.action}:`, result.error);
        await this.pb.collection('commands').update(command.id, { executed: true, error_message: message });
        await this.updateStreamStatus('error');
    }
  }

  private async updateStreamStatus(status: string) {
    try {
      const update: any = {
        status,
        heartbeat: new Date().toISOString()
      };

      // Safely fetch OBS stats using functional wrapper
      const obsStatusResult = await wrapAsync(this.obs.call('GetStreamStatus'));
      const obsStatsResult = await wrapAsync(this.obs.call('GetStats'));

      if (obsStatusResult.ok) {
          const s = obsStatusResult.value;
          update.metadata = {
              outputActive: s.outputActive,
              outputDuration: s.outputDuration,
              outputBytes: s.outputBytes,
              quality: {
                  dropped_frames: s.outputSkippedFrames,
              }
          };

          if (obsStatsResult.ok) {
              const stats = obsStatsResult.value;
              update.metadata.quality = {
                  ...update.metadata.quality,
                  fps: stats.activeFps,
                  cpu_usage: stats.cpuUsage
              };
          }
      }

      await this.pb.collection('streams').update(this.streamId, update);
    } catch (error) {
      logger.error('Failed to update stream status:', error);
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(async () => {
      try {
        await this.pb.collection('streams').update(this.streamId, {
          heartbeat: new Date().toISOString()
        });
      } catch (error) {
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

process.on('SIGINT', async () => {
  await bridge.shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await bridge.shutdown();
  process.exit(0);
});

bridge.start().catch((error) => {
  logger.error('Fatal error:', error);
  process.exit(1);
});

export { SanctuaryBridge };
