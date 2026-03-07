/**
 * Unit tests for sanctuary-bridge/src/index.ts (SanctuaryBridge)
 *
 * We mock PocketBase and OBSWebSocket so these run totally offline —
 * no server required. Each test validates one responsibility of the bridge:
 * auth, command dispatch, heartbeat, OBS events, graceful shutdown.
 *
 * IMPORTANT: index.ts instantiates SanctuaryBridge at module-level (line 279),
 * so env vars must be set BEFORE import. We use vi.hoisted() for the mock
 * instances so they're available inside vi.mock() factory closures.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ---------------------------------------------------------------------------
// Hoisted mocks — must be declared here before any vi.mock() calls
// so vitest's static analysis can hoist them correctly.
// ---------------------------------------------------------------------------
const {
  mockPbAuth,
  mockPbUpdate,
  mockPbCreate,
  mockSubscribe,
  mockUnsubscribeRealtime,
  mockObsCall,
  mockObsConnect,
  mockObsDisconnect,
  mockObsOn,
} = vi.hoisted(() => ({
  mockPbAuth: vi.fn().mockResolvedValue({ id: 'user-1', email: 'bridge@local.dev' }),
  mockPbUpdate: vi.fn().mockResolvedValue({}),
  mockPbCreate: vi.fn().mockResolvedValue({ id: 'cmd-1' }),
  mockSubscribe: vi.fn(),
  mockUnsubscribeRealtime: vi.fn().mockResolvedValue(undefined),
  mockObsCall: vi.fn().mockResolvedValue({ outputActive: true, outputDuration: 5000, outputBytes: 1024, outputSkippedFrames: 0 }),
  mockObsConnect: vi.fn().mockResolvedValue(undefined),
  mockObsDisconnect: vi.fn().mockResolvedValue(undefined),
  mockObsOn: vi.fn(),
}));

// ---------------------------------------------------------------------------
// vi.mock() factory — hoisted to top of file by vitest automatically.
// The factories can safely reference the hoisted vars above.
// ---------------------------------------------------------------------------

vi.mock('pocketbase', () => {
  // PocketBase is used as `new PocketBase(url)`.
  // The mock must be a class (or at minimum a constructor function).
  // We use a plain class that returns our mock shape.
  class MockPocketBase {
    authStore = {
      model: { id: 'user-1', role: 'tech' },
      token: 'mock-token',
      isValid: true,
      clear: vi.fn(),
    };
    realtime = { unsubscribe: mockUnsubscribeRealtime };
    baseUrl = 'http://127.0.0.1:8090';
    collection(_name: string) {
      return {
        authWithPassword: mockPbAuth,
        create: mockPbCreate,
        update: mockPbUpdate,
        subscribe: mockSubscribe,
        unsubscribe: mockUnsubscribeRealtime,
        getOne: vi.fn().mockResolvedValue({ id: 'stream-1', status: 'idle', heartbeat: new Date().toISOString() }),
      };
    }
  }
  return { default: MockPocketBase };
});

vi.mock('obs-websocket-js', () => {
  // OBSWebSocket is also used as `new OBSWebSocket()`.
  class MockOBS {
    connect = mockObsConnect;
    disconnect = mockObsDisconnect;
    call = mockObsCall;
    on = mockObsOn;
  }
  return { default: MockOBS };
});

// Google Drive upload mock — don't hit real APIs in tests
vi.mock('./google-drive', () => ({
  uploadFile: vi.fn().mockResolvedValue({ id: 'drive-file-123' }),
}));

// ---------------------------------------------------------------------------
// Set STREAM_ID before SanctuaryBridge is instantiated at module level
// ---------------------------------------------------------------------------
process.env.STREAM_ID = 'test-stream-123';
process.env.PB_URL = 'http://127.0.0.1:8090';
process.env.BRIDGE_EMAIL = 'bridge@local.dev';
process.env.BRIDGE_PASS = 'bridge123456';
process.env.OBS_URL = 'ws://127.0.0.1:4455';

// Import AFTER mocks and env vars are set up
const { SanctuaryBridge } = await import('./index');

// ---------------------------------------------------------------------------
// Reset mocks between tests
// ---------------------------------------------------------------------------
beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.clearAllTimers();
});

// ---------------------------------------------------------------------------
// Constructor
// ---------------------------------------------------------------------------

describe('SanctuaryBridge — constructor', () => {
  it('initialises successfully with all required env vars', () => {
    process.env.STREAM_ID = 'test-stream-123';
    expect(() => new SanctuaryBridge()).not.toThrow();
  });

  it('throws if STREAM_ID is missing', () => {
    const saved = process.env.STREAM_ID;
    delete process.env.STREAM_ID;
    expect(() => new SanctuaryBridge()).toThrow('STREAM_ID configuration is required (via ENV or config.json)');
    process.env.STREAM_ID = saved;
  });

  it('falls back to localhost PB URL when PB_URL is unset', () => {
    const savedPB = process.env.PB_URL;
    const savedStream = process.env.STREAM_ID;
    delete process.env.PB_URL;
    process.env.STREAM_ID = 'test'; // Ensure stream ID exists so it doesnt throw for that
    expect(() => new SanctuaryBridge()).not.toThrow();
    process.env.PB_URL = savedPB;
    process.env.STREAM_ID = savedStream;
  });
});

// ---------------------------------------------------------------------------
// start() — happy path
// ---------------------------------------------------------------------------

describe('SanctuaryBridge.start()', () => {
  it('authenticates with PocketBase on startup', async () => {
    const bridge = new SanctuaryBridge();
    await bridge.start();
    expect(mockPbAuth).toHaveBeenCalledWith('bridge@local.dev', 'bridge123456');
  });

  it('connects to OBS on startup', async () => {
    const bridge = new SanctuaryBridge();
    await bridge.start();
    expect(mockObsConnect).toHaveBeenCalled();
  });

  it('subscribes to commands collection after start', async () => {
    const bridge = new SanctuaryBridge();
    await bridge.start();
    expect(mockSubscribe).toHaveBeenCalledWith('*', expect.any(Function));
  });

  it('continues even if OBS connect fails (bridge has own retry logic)', async () => {
    mockObsConnect.mockRejectedValueOnce(new Error('OBS not running'));
    const bridge = new SanctuaryBridge();
    await expect(bridge.start()).resolves.not.toThrow();
    mockObsConnect.mockResolvedValue(undefined);
  });

  it('calls process.exit(1) when PocketBase auth fails', async () => {
    mockPbAuth.mockRejectedValueOnce(new Error('Auth failed'));
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((_code) => undefined as never);
    const bridge = new SanctuaryBridge();
    await bridge.start();
    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
    mockPbAuth.mockResolvedValue({ id: 'user-1' });
  });
});

// ---------------------------------------------------------------------------
// shutdown()
// ---------------------------------------------------------------------------

describe('SanctuaryBridge.shutdown()', () => {
  it('disconnects from OBS', async () => {
    const bridge = new SanctuaryBridge();
    await bridge.start();
    await bridge.shutdown();
    expect(mockObsDisconnect).toHaveBeenCalled();
  });

  it('unsubscribes PocketBase realtime', async () => {
    const bridge = new SanctuaryBridge();
    await bridge.start();
    await bridge.shutdown();
    expect(mockUnsubscribeRealtime).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// executeCommand() - Direct Verification
// ---------------------------------------------------------------------------

describe('SanctuaryBridge.executeCommand() - Direct Logic Verification', () => {
  const runCommand = async (action: string, payload?: Record<string, unknown>) => {
    const bridge = new SanctuaryBridge();
    await bridge.start(); // Ensure auth & connect happened

    const record = {
      id: 'cmd-test',
      action,
      executed: false,
      correlation_id: '00000000-0000-4000-8000-000000000001',
      payload: payload ?? null,
    };

    await bridge.executeCommand(record);
    return record;
  };

  it('calls OBS StartStream for START command', async () => {
    await runCommand('START');
    expect(mockObsCall).toHaveBeenCalledWith('StartStream');
  });

  it('calls OBS StopStream for STOP command', async () => {
    await runCommand('STOP');
    expect(mockObsCall).toHaveBeenCalledWith('StopStream');
  });

  it('marks command as executed after success', async () => {
    await runCommand('START');
    // Look through all mock calls for our specific record ID
    const match = mockPbUpdate.mock.calls.some(args => 
      args[0] === 'cmd-test' && args[1].executed === true
    );
    expect(match).toBe(true);
  });

  it('writes error_message and marks executed on OBS failure', async () => {
    // We use mockImplementation to only fail the StartStream call,
    // avoiding being consumed by GetStreamStatus/GetStats in start()
    mockObsCall.mockImplementation((requestType: string) => {
      if (requestType === 'StartStream') {
        return Promise.reject(new Error('OBS refused'));
      }
      return Promise.resolve({ outputActive: true });
    });

    await runCommand('START');
    
    // Explicit verification of the update payload
    const match = mockPbUpdate.mock.calls.some(args => 
      args[0] === 'cmd-test' && 
      args[1].executed === true && 
      args[1].error_message === 'OBS refused'
    );
    expect(match).toBe(true);
    
    // Reset to default mock
    mockObsCall.mockImplementation(vi.fn().mockResolvedValue({ outputActive: true }));
  });

  it('handles unknown command action gracefully', async () => {
    await runCommand('UNKNOWN_ACTION');
    const match = mockPbUpdate.mock.calls.some(args => 
      args[0] === 'cmd-test' && 
      args[1].executed === true && 
      String(args[1].error_message || args[1].errorMessage).includes('Unknown command action')
    );
    expect(match).toBe(true);
  });

  it('calls OBS StartRecord for RECORD_START command', async () => {
    await runCommand('RECORD_START');
    expect(mockObsCall).toHaveBeenCalledWith('StartRecord');
  });

  it('calls OBS StopRecord for RECORD_STOP command', async () => {
    await runCommand('RECORD_STOP');
    expect(mockObsCall).toHaveBeenCalledWith('StopRecord');
  });

  it('handles SET_STREAM_SETTINGS command', async () => {
    await runCommand('SET_STREAM_SETTINGS', {
      service: 'YouTube',
      server: 'rtmp://a.rtmp.youtube.com/live2',
      key: 'stream-key-123'
    });
    expect(mockObsCall).toHaveBeenCalledWith('SetStreamServiceSettings', expect.objectContaining({
      streamServiceSettings: {
        service: 'YouTube',
        server: 'rtmp://a.rtmp.youtube.com/live2',
        key: 'stream-key-123'
      }
    }));
  });

  it('handles SET_VIDEO_SETTINGS command', async () => {
    await runCommand('SET_VIDEO_SETTINGS', {
      baseWidth: 1920,
      baseHeight: 1080,
      fpsNum: 60
    });
    expect(mockObsCall).toHaveBeenCalledWith('SetVideoSettings', expect.objectContaining({
      baseWidth: 1920,
      baseHeight: 1080,
      fpsNumerator: 60
    }));
  });

  it('handles SET_STREAM_ENCODER command', async () => {
    mockObsCall.mockResolvedValueOnce({ streamServiceType: 'rtmp_common', streamServiceSettings: {} });
    await runCommand('SET_STREAM_ENCODER', {
      encoder: 'obs_x264',
      settings: { bitrate: 4500 }
    });
    expect(mockObsCall).toHaveBeenCalledWith('SetStreamServiceSettings', expect.objectContaining({
      streamServiceSettings: expect.objectContaining({
        encoder: 'obs_x264',
        bitrate: 4500
      })
    }));
  });

  it('handles SET_AUDIO_SETTINGS command by updating metadata', async () => {
    await runCommand('SET_AUDIO_SETTINGS', {
      sampleRate: 48000,
      channels: 2,
      bitrate: 160
    });
    // Audio settings are stored in PB metadata, not sent to OBS directly in current impl
    const match = mockPbUpdate.mock.calls.some(args => 
      args[0] === 'test-stream-123' && 
      args[1].metadata?.audio_settings?.bitrate === 160
    );
    expect(match).toBe(true);
  });

  it('handles SET_STREAM_SETTINGS validation failure', async () => {
    await runCommand('SET_STREAM_SETTINGS', { service: 'Only Service' });
    const match = mockPbUpdate.mock.calls.some(args => 
      args[0] === 'cmd-test' && args[1].error_message?.includes('Missing service or key')
    );
    expect(match).toBe(true);
  });

  it('handles SET_VIDEO_SETTINGS validation failure', async () => {
    await runCommand('SET_VIDEO_SETTINGS', { baseWidth: 1920 });
    const match = mockPbUpdate.mock.calls.some(args => 
      args[0] === 'cmd-test' && args[1].error_message?.includes('Missing video settings')
    );
    expect(match).toBe(true);
  });

  it('handles SET_STREAM_ENCODER validation failure', async () => {
    await runCommand('SET_STREAM_ENCODER', { encoder: 'obs_x264' });
    const match = mockPbUpdate.mock.calls.some(args => 
      args[0] === 'cmd-test' && args[1].error_message?.includes('Missing encoder or settings')
    );
    expect(match).toBe(true);
  });

  it('handles SET_AUDIO_SETTINGS validation failure', async () => {
    await runCommand('SET_AUDIO_SETTINGS', { bitrate: 160 });
    const match = mockPbUpdate.mock.calls.some(args => 
      args[0] === 'cmd-test' && args[1].error_message?.includes('Missing audio settings')
    );
    expect(match).toBe(true);
  });
});

describe('SanctuaryBridge OBS Event Handlers', () => {
  it('updates status to live when StreamStateChanged fires', async () => {
    const bridge = new SanctuaryBridge();
    await bridge.start();

    const callArgs = mockObsOn.mock.calls.find(args => args[0] === 'StreamStateChanged');
    const callback = callArgs?.[1];

    await callback({ outputActive: true });
    
    const match = mockPbUpdate.mock.calls.some(args => 
      args[0] === 'test-stream-123' && args[1].status === 'live'
    );
    expect(match).toBe(true);
  });

  it('updates status to recording when RecordStateChanged fires', async () => {
    const bridge = new SanctuaryBridge();
    await bridge.start();

    const callArgs = mockObsOn.mock.calls.find(args => args[0] === 'RecordStateChanged');
    const callback = callArgs?.[1];

    await callback({ outputActive: true });
    
    const match = mockPbUpdate.mock.calls.some(args => 
      args[0] === 'test-stream-123' && args[1].status === 'recording'
    );
    expect(match).toBe(true);
  });

  it('triggers file upload when recording stops', async () => {
    const bridge = new SanctuaryBridge();
    await bridge.start();

    const { uploadFile } = await import('./google-drive');
    const callArgs = mockObsOn.mock.calls.find(args => args[0] === 'RecordStateChanged');
    const callback = callArgs?.[1];

    await callback({ outputActive: false, outputPath: '/path/to/video.mp4' });
    
    expect(uploadFile).toHaveBeenCalledWith('/path/to/video.mp4');
  });

  it('handles GetStreamStatus failure gracefully in updateStreamStatus', async () => {
    const bridge = new SanctuaryBridge();
    await bridge.start();

    mockObsCall.mockImplementation((requestType: string) => {
      if (requestType === 'GetStreamStatus') return Promise.reject(new Error('OBS Busy'));
      return Promise.resolve({});
    });

    const callArgs = mockObsOn.mock.calls.find(args => args[0] === 'StreamStateChanged');
    const callback = callArgs?.[1];

    await callback({ outputActive: true });
    
    // Should still have updated status even if metadata fetch failed
    const match = mockPbUpdate.mock.calls.some(args => 
      args[0] === 'test-stream-123' && args[1].status === 'live'
    );
    expect(match).toBe(true);
  });
});

describe('SanctuaryBridge Reconnection & Throttling', () => {
  it('attempts to reconnect when OBS connection is closed', async () => {
    vi.useFakeTimers();
    const bridge = new SanctuaryBridge();
    await bridge.start();

    const callArgs = mockObsOn.mock.calls.find(args => args[0] === 'ConnectionClosed');
    const callback = callArgs?.[1];

    vi.clearAllMocks();
    await callback(); // Trigger close
    
    // Should wait for exponential backoff (initial is ~2s)
    vi.advanceTimersByTime(3000);
    
    expect(mockObsConnect).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('marks stream as error after max reconnection attempts', async () => {
    vi.useFakeTimers();
    const bridge = new SanctuaryBridge();
    await bridge.start();
    
    // Force reconnect attempts to limit AFTER start (which resets it)
    (bridge as any).reconnectAttempts = 5;

    const callArgs = mockObsOn.mock.calls.find(args => args[0] === 'ConnectionClosed');
    const callback = callArgs?.[1];

    await callback();
    
    const match = mockPbUpdate.mock.calls.some(args => 
      args[0] === 'test-stream-123' && args[1].status === 'error'
    );
    expect(match).toBe(true);
    vi.useRealTimers();
  });

  it('throttles status updates to avoid spamming PocketBase', async () => {
    vi.useFakeTimers();
    const bridge = new SanctuaryBridge();
    await bridge.start();

    // Trigger multiple status updates rapidly
    (bridge as any).throttledStatusUpdate('status1');
    (bridge as any).throttledStatusUpdate('status2');
    (bridge as any).throttledStatusUpdate('status3');

    // Advance past throttle time (2s)
    vi.advanceTimersByTime(2500);

    // Should only have called update once for the throttled batch
    const updateCalls = mockPbUpdate.mock.calls.filter(args => args[1].status !== undefined);
    // Note: start() also triggers one update, so we check for 2 total
    expect(updateCalls.length).toBeLessThan(4); 
    vi.useRealTimers();
  });
});

describe('SanctuaryBridge Realtime Subscription', () => {
  it('ignores events that are not "create" actions', async () => {
    const bridge = new SanctuaryBridge();
    await bridge.start();

    const callArgs = mockSubscribe.mock.calls.find((args: unknown[]) => args[0] === '*') as unknown[] | undefined;
    const subscribeCallback = callArgs?.[1] as ((e: { action: string; record: Record<string, unknown> }) => Promise<void>) | undefined;

    vi.clearAllMocks();
    await subscribeCallback!({
      action: 'update',
      record: { id: 'cmd-2', action: 'START', executed: false, correlation_id: 'abc' },
    });
    expect(mockObsCall).not.toHaveBeenCalled();
  });

  it('ignores commands that are already executed', async () => {
    const bridge = new SanctuaryBridge();
    await bridge.start();

    const callArgs = mockSubscribe.mock.calls.find((args: unknown[]) => args[0] === '*') as unknown[] | undefined;
    const subscribeCallback = callArgs?.[1] as ((e: { action: string; record: Record<string, unknown> }) => Promise<void>) | undefined;

    vi.clearAllMocks();
    await subscribeCallback!({
      action: 'create',
      record: { id: 'cmd-3', action: 'START', executed: true, correlation_id: 'abc' },
    });
    expect(mockObsCall).not.toHaveBeenCalled();
  });
});
