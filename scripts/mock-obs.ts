#!/usr/bin/env tsx
/**
 * Mock OBS WebSocket Server
 * For testing Bridge service without running OBS Studio
 * 
 * Usage: npm run mock:obs
 */

import { WebSocket, WebSocketServer } from 'ws';

const PORT = parseInt(process.env.OBS_PORT || '4455', 10);
const PASSWORD = process.env.OBS_PASS || 'test123';

const wss = new WebSocketServer({ port: PORT });

console.log(`
🎥 Mock OBS WebSocket Server`);
console.log(`${'='.repeat(50)}`);
console.log(`Port: ${PORT}`);
console.log(`Password: ${PASSWORD}`);
console.log(`URL: ws://127.0.0.1:${PORT}`);
console.log(`${'='.repeat(50)}
`);

let isStreaming = false;

interface ObsRequest {
  op: number;
  d: {
    requestType: string;
    requestId: string;
    [key: string]: any;
  };
}

wss.on('connection', (ws) => {
  console.log('✅ Client connected');

  // Send Hello message (obs-websocket v5 protocol)
  ws.send(JSON.stringify({
    op: 0, // Hello
    d: {
      obsWebSocketVersion: '5.0.0',
      rpcVersion: 1,
      authentication: {
        challenge: 'mock-challenge',
        salt: 'mock-salt'
      }
    }
  }));

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString()) as ObsRequest;
      
      switch (msg.op) {
        case 1: // Identify
          console.log('📝 Client identified');
          ws.send(JSON.stringify({
            op: 2, // Identified
            d: {
              negotiatedRpcVersion: 1
            }
          }));
          break;

        case 6: // Request
          handleRequest(ws, msg);
          break;

        default:
          console.log('⚠️  Unknown opcode:', msg.op);
      }
    } catch (error) {
      console.error('❌ Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('🔌 Client disconnected');
  });
});

function handleRequest(ws: WebSocket, msg: ObsRequest) {
  const { requestType, requestId } = msg.d;
  
  console.log(`📡 Request: ${requestType}`);

  let responseData: Record<string, any> = {};
  let success = true;

  switch (requestType) {
    case 'GetVersion':
      responseData = {
        obsVersion: '30.0.0',
        obsWebSocketVersion: '5.0.0',
        rpcVersion: 1,
        availableRequests: [],
        supportedImageFormats: ['png', 'jpg'],
        platform: 'mock',
        platformDescription: 'Mock OBS Server'
      };
      break;

    case 'GetSceneList':
      responseData = {
        currentProgramSceneName: 'Wide Shot',
        currentPreviewSceneName: 'Pulpit Zoom',
        scenes: [
          { sceneName: 'Wide Shot', sceneIndex: 0 },
          { sceneName: 'Pulpit Zoom', sceneIndex: 1 },
          { sceneName: 'Liturgy Overlay', sceneIndex: 2 },
          { sceneName: 'Worship Band', sceneIndex: 3 }
        ]
      };
      break;

    case 'SetCurrentProgramScene':
      console.log(`🎬 Switching to scene: ${msg.d.sceneName}`);
      break;

    case 'GetInputList':
      responseData = {
        inputs: [
          { inputName: 'Desktop Audio', inputKind: 'wasapi_output_capture' },
          { inputName: 'Mic/Aux', inputKind: 'wasapi_input_capture' },
          { inputName: 'Pulpit Mic', inputKind: 'wasapi_input_capture' }
        ]
      };
      break;

    case 'GetInputMuted':
      responseData = { inputMuted: false };
      break;

    case 'SetInputMuted':
      console.log(`🔇 Input ${msg.d.inputName} muted: ${msg.d.inputMuted}`);
      break;

    case 'GetInputVolume':
      responseData = { inputVolumeMul: 0.82, inputVolumeDb: -3.0 };
      break;

    case 'SetInputVolume':
      console.log(`🔊 Input ${msg.d.inputName} volume: ${msg.d.inputVolumeMul}`);
      break;

    case 'StartStream':
      if (isStreaming) {
        success = false;
        console.log('⚠️  Stream already active');
      } else {
        isStreaming = true;
        console.log('🔴 Stream STARTED');
      }
      break;

    case 'StopStream':
      if (!isStreaming) {
        success = false;
        console.log('⚠️  Stream already stopped');
      } else {
        isStreaming = false;
        console.log('⚪ Stream STOPPED');
      }
      break;

    case 'GetStreamStatus':
    case 'GetOutputStatus':
      responseData = {
        outputActive: isStreaming,
        outputReconnecting: false,
        outputTimecode: '00:00:00.000',
        outputDuration: 0,
        outputCongestion: 0,
        outputBytes: isStreaming ? Math.floor(Date.now() / 1000) * 5000 : 0, // Mock bytes increasing
        outputSkippedFrames: 0,
        outputTotalFrames: 0
      };
      break;

    case 'GetStats':
      // Mock fluctuating stats
      const randomVariance = (Math.random() * 2) - 1; // +/- 1
      responseData = {
        cpuUsage: isStreaming ? 2.5 + randomVariance : 0.1,
        memoryUsage: 128.5,
        availableDiskSpace: 500000,
        activeFps: isStreaming ? 60 + (randomVariance * 0.5) : 0,
        averageFrameTime: 16.6,
        renderSkippedFrames: 0,
        outputSkippedFrames: isStreaming && Math.random() > 0.9 ? 1 : 0, // 10% chance of a dropped frame
      };
      break;

    default:
      console.log(`⚠️  Unknown request: ${requestType}`);
      success = false;
  }

  // Send response
  ws.send(JSON.stringify({
    op: 7, // RequestResponse
    d: {
      requestType,
      requestId,
      requestStatus: {
        result: success,
        code: success ? 100 : 600,
        comment: success ? 'Success' : 'Failed'
      },
      responseData
    }
  }));
}

console.log('✅ Mock OBS server is running');
console.log('   Press Ctrl+C to stop\n');

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down mock OBS server...');
  wss.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
