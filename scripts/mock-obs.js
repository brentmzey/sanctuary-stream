#!/usr/bin/env node
/**
 * Mock OBS WebSocket Server
 * For testing Bridge service without running OBS Studio
 * 
 * Usage: node scripts/mock-obs.js
 */

const WebSocket = require('ws');

const PORT = process.env.OBS_PORT || 4455;
const PASSWORD = process.env.OBS_PASS || 'test123';

const wss = new WebSocket.Server({ port: PORT });

console.log(`\n🎥 Mock OBS WebSocket Server`);
console.log(`${'='.repeat(50)}`);
console.log(`Port: ${PORT}`);
console.log(`Password: ${PASSWORD}`);
console.log(`URL: ws://127.0.0.1:${PORT}`);
console.log(`${'='.repeat(50)}\n`);

let isStreaming = false;

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
      const msg = JSON.parse(data.toString());
      
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

function handleRequest(ws, msg) {
  const { requestType, requestId } = msg.d;
  
  console.log(`📡 Request: ${requestType}`);

  let responseData = {};
  let success = true;

  switch (requestType) {
    case 'GetVersion':
      responseData = {
        obsVersion: '29.1.0',
        obsWebSocketVersion: '5.0.0',
        rpcVersion: 1,
        availableRequests: [],
        supportedImageFormats: ['png', 'jpg'],
        platform: 'mock',
        platformDescription: 'Mock OBS Server'
      };
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
      responseData = {
        outputActive: isStreaming,
        outputReconnecting: false,
        outputTimecode: '00:00:00.000',
        outputDuration: 0,
        outputCongestion: 0,
        outputBytes: 0,
        outputSkippedFrames: 0,
        outputTotalFrames: 0
      };
      break;

    case 'GetOutputStatus':
      responseData = {
        outputActive: isStreaming,
        outputReconnecting: false,
        outputTimecode: '00:00:00.000',
        outputDuration: 0,
        outputCongestion: 0,
        outputBytes: 0,
        outputSkippedFrames: 0,
        outputTotalFrames: 0
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
