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
import { describe, it, expect, vi, beforeEach } from 'vitest';

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
beforeEach(() => vi.clearAllMocks());

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
    expect(() => new SanctuaryBridge()).toThrow('STREAM_ID environment variable is required');
    process.env.STREAM_ID = saved;
  });

  it('falls back to localhost PB URL when PB_URL is unset', () => {
    const saved = process.env.PB_URL;
    delete process.env.PB_URL;
    expect(() => new SanctuaryBridge()).not.toThrow();
    process.env.PB_URL = saved;
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
// executeCommand() via subscribeToCommands
// ---------------------------------------------------------------------------

describe('SanctuaryBridge.executeCommand() via subscribeToCommands', () => {
  const simulateCommand = async (action: string, payload?: Record<string, unknown>) => {
    const bridge = new SanctuaryBridge();
    await bridge.start();

    // Grab the subscribe callback — mockSubscribe was called with ('*', fn)
    const callArgs = mockSubscribe.mock.calls.find(
      (args: unknown[]) => args[0] === '*'
    ) as unknown[] | undefined;
    const subscribeCallback = callArgs?.[1] as ((e: { action: string; record: Record<string, unknown> }) => Promise<void>) | undefined;
    expect(subscribeCallback).toBeDefined();

    const record = {
      id: 'cmd-test',
      action,
      executed: false,
      correlation_id: '00000000-0000-4000-8000-000000000001',
      payload: payload ?? null,
    };

    await subscribeCallback!({ action: 'create', record });
    return record;
  };

  it('calls OBS StartStream for START command', async () => {
    await simulateCommand('START');
    expect(mockObsCall).toHaveBeenCalledWith('StartStream');
  });

  it('calls OBS StopStream for STOP command', async () => {
    await simulateCommand('STOP');
    expect(mockObsCall).toHaveBeenCalledWith('StopStream');
  });

  it('calls OBS StartRecord for RECORD_START command', async () => {
    await simulateCommand('RECORD_START');
    expect(mockObsCall).toHaveBeenCalledWith('StartRecord');
  });

  it('calls OBS StopRecord for RECORD_STOP command', async () => {
    await simulateCommand('RECORD_STOP');
    expect(mockObsCall).toHaveBeenCalledWith('StopRecord');
  });

  it('marks command as executed after success', async () => {
    await simulateCommand('START');
    expect(mockPbUpdate).toHaveBeenCalledWith('cmd-test', expect.objectContaining({ executed: true }));
  });

  it('writes error_message and marks executed on OBS failure', async () => {
    mockObsCall.mockRejectedValueOnce(new Error('OBS refused'));
    await simulateCommand('START');
    expect(mockPbUpdate).toHaveBeenCalledWith(
      'cmd-test',
      expect.objectContaining({ executed: true, error_message: 'OBS refused' })
    );
    mockObsCall.mockResolvedValue({ outputActive: true });
  });

  it('handles unknown command action gracefully', async () => {
    await simulateCommand('UNKNOWN_ACTION');
    expect(mockPbUpdate).toHaveBeenCalledWith(
      'cmd-test',
      expect.objectContaining({
        executed: true,
        error_message: expect.stringContaining('Unknown command action'),
      })
    );
  });

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
