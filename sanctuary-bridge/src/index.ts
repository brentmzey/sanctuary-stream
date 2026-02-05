import 'dotenv/config';
import PocketBase from 'pocketbase';
import OBSWebSocket from 'obs-websocket-js';
import { logger } from './logger';
import { CommandRecord } from './types';

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
    try {
      // Authenticate with PocketBase
      await this.authenticatePocketBase();
      
      // Connect to OBS
      await this.connectOBS();
      
      // Subscribe to command changes
      this.subscribeToCommands();
      
      // Start heartbeat
      this.startHeartbeat();
      
      logger.info('🚀 Sanctuary Bridge started successfully');
    } catch (error) {
      logger.error('Failed to start bridge:', error);
      process.exit(1);
    }
  }

  private async authenticatePocketBase() {
    const email = process.env.BRIDGE_EMAIL || 'bridge@local.dev';
    const password = process.env.BRIDGE_PASS || 'bridge123456';

    try {
      await this.pb.collection('users').authWithPassword(email, password);
      logger.info('✅ Authenticated with PocketBase');
    } catch (error) {
      logger.error('Failed to authenticate with PocketBase:', error);
      throw error;
    }
  }

  private async connectOBS() {
    const obsUrl = process.env.OBS_URL || 'ws://127.0.0.1:4455';
    const obsPassword = process.env.OBS_PASS || '';

    try {
      await this.obs.connect(obsUrl, obsPassword);
      logger.info('✅ Connected to OBS WebSocket');
      this.reconnectAttempts = 0;

      // Setup OBS event handlers
      this.setupOBSHandlers();
    } catch (error) {
      logger.error('Failed to connect to OBS:', error);
      await this.handleOBSReconnect();
    }
  }

  private setupOBSHandlers() {
    this.obs.on('Identified', () => {
      logger.info('OBS connection identified');
    });

    this.obs.on('ConnectionClosed', async () => {
      logger.warn('OBS connection closed, attempting reconnect...');
      await this.handleOBSReconnect();
    });

    this.obs.on('StreamStateChanged', async (data: { outputActive?: boolean }) => {
      logger.info('Stream state changed:', data);
      await this.updateStreamStatus(data.outputActive ? 'live' : 'idle');
    });

    this.obs.on('RecordStateChanged', async (data: { outputActive?: boolean }) => {
      logger.info('Record state changed:', data);
      if (data.outputActive) {
        await this.updateStreamStatus('recording');
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

    try {
      switch (command.action) {
        case 'START':
          await this.obs.call('StartStream');
          await this.updateStreamStatus('live');
          break;
        
        case 'STOP':
          await this.obs.call('StopStream');
          await this.updateStreamStatus('idle');
          break;
        
        case 'RECORD_START':
          await this.obs.call('StartRecord');
          await this.updateStreamStatus('recording');
          break;
        
        case 'RECORD_STOP':
          await this.obs.call('StopRecord');
          await this.updateStreamStatus('idle');
          break;
        
        default:
          throw new Error(`Unknown command action: ${command.action}`);
      }

      // Mark command as executed
      await this.pb.collection('commands').update(command.id, {
        executed: true
      });

      logger.info(`✅ Command executed: ${command.action}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to execute command ${command.action}:`, error);
      
      // Update command with error
      await this.pb.collection('commands').update(command.id, {
        executed: true,
        error_message: message
      });

      await this.updateStreamStatus('error');
    }
  }

  private async updateStreamStatus(status: string, metadata?: Record<string, unknown>) {
    try {
      const update: Record<string, unknown> = {
        status,
        heartbeat: new Date().toISOString()
      };

      if (metadata) {
        update.metadata = metadata;
      }

      // Get current stream info from OBS if available
      try {
        const streamStatus = await this.obs.call('GetStreamStatus');
        update.metadata = {
          ...(update.metadata || {}),
          outputActive: streamStatus.outputActive,
          outputDuration: streamStatus.outputDuration,
          outputBytes: streamStatus.outputBytes
        };
      } catch (obsError) {
        // OBS might not be available, continue anyway
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
