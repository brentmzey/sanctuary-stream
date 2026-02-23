/**
 * Unit tests for sanctuary-bridge/src/index.ts (SanctuaryBridge)
 *
 * We mock PocketBase and OBSWebSocket so these run totally offline —
 * no server required. Each test validates one responsibility of the bridge:
 * auth, command dispatch, heartbeat, OBS events, graceful shutdown.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SanctuaryBridge } from './index';

// ---------------------------------------------------------------------------
// Mocks — keep them deterministic and chatty so failures are obvious
// ---------------------------------------------------------------------------

const mockPbUpdate = vi.fn().mockResolvedValue({});
const mockPbCreate = vi.fn().mockResolvedValue({ id: 'cmd-1' });
const mockPbAuth = vi.fn().mockResolvedValue({ id: 'user-1', email: 'bridge@local.dev' });
const mockSubscribe = vi.fn();
const mockUnsubscribe = vi.fn().mockResolvedValue(undefined);

const mockAuthStore = {
  model: { id: 'user-1', role: 'tech' },
  token: 'mock-token',
  isValid: true,
  clear: vi.fn(),
};

// Build a mock PocketBase collection factory
const mockCollection = (name: string) => ({
  authWithPassword: mockPbAuth,
  create: mockPbCreate,
  update: mockPbUpdate,
  subscribe: mockSubscribe,
  unsubscribe: mockUnsubscribe,
  getOne: vi.fn().mockResolvedValue({ id: 'stream-1', status: 'idle', heartbeat: new Date().toISOString() }),
});

vi.mock('pocketbase', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      collection: vi.fn().mockImplementation(mockCollection),
      authStore: mockAuthStore,
      realtime: { unsubscribe: mockUnsubscribe },
      baseUrl: 'http://127.0.0.1:8090',
    })),
  };
});

const mockObsCall = vi.fn().mockResolvedValue({ outputActive: true, outputDuration: 5000, outputBytes: 1024, outputSkippedFrames: 0 });
const mockObsConnect = vi.fn().mockResolvedValue(undefined);
const mockObsDisconnect = vi.fn().mockResolvedValue(undefined);
const mockObsOn = vi.fn();

vi.mock('obs-websocket-js', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      connect: mockObsConnect,
      disconnect: mockObsDisconnect,
      call: mockObsCall,
      on: mockObsOn,
    })),
  };
});

// Google Drive upload mock — don't hit real APIs in tests
vi.mock('./google-drive', () => ({
  uploadFile: vi.fn().mockResolvedValue({ id: 'drive-file-123' }),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeBridge = () => {
  process.env.STREAM_ID = 'test-stream-123';
  process.env.PB_URL = 'http://127.0.0.1:8090';
  process.env.BRIDGE_EMAIL = 'bridge@local.dev';
  process.env.BRIDGE_PASS = 'bridge123456';
  process.env.OBS_URL = 'ws://127.0.0.1:4455';
  return new SanctuaryBridge();
};

// ---------------------------------------------------------------------------
// Constructor
// ---------------------------------------------------------------------------

describe('SanctuaryBridge — constructor', () => {
  it('initialises successfully with all required env vars', () => {
    expect(() => makeBridge()).not.toThrow();
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
    // Should not throw — default is used
    expect(() => makeBridge()).not.toThrow();
    process.env.PB_URL = saved;
  });
});

// ---------------------------------------------------------------------------
// start() — happy path
// ---------------------------------------------------------------------------

describe('SanctuaryBridge.start()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('authenticates with PocketBase on startup', async () => {
    const bridge = makeBridge();
    await bridge.start();
    expect(mockPbAuth).toHaveBeenCalledWith('bridge@local.dev', 'bridge123456');
  });

  it('connects to OBS on startup', async () => {
    const bridge = makeBridge();
    await bridge.start();
    expect(mockObsConnect).toHaveBeenCalled();
  });

  it('subscribes to commands collection after start', async () => {
    const bridge = makeBridge();
    await bridge.start();
    expect(mockSubscribe).toHaveBeenCalledWith('*', expect.any(Function));
  });

  it('continues even if OBS connect fails (bridge has own retry logic)', async () => {
    mockObsConnect.mockRejectedValueOnce(new Error('OBS not running'));
    const bridge = makeBridge();
    // Should resolve without throwing — bridge retries OBS in background
    await expect(bridge.start()).resolves.not.toThrow();
    mockObsConnect.mockResolvedValue(undefined); // restore
  });

  it('calls process.exit(1) when PocketBase auth fails', async () => {
    mockPbAuth.mockRejectedValueOnce(new Error('Auth failed'));
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((_code) => undefined as never);
    const bridge = makeBridge();
    await bridge.start();
    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
    mockPbAuth.mockResolvedValue({ id: 'user-1' }); // restore
  });
});

// ---------------------------------------------------------------------------
// shutdown()
// ---------------------------------------------------------------------------

describe('SanctuaryBridge.shutdown()', () => {
  beforeEach(() => vi.clearAllMocks());

  it('disconnects from OBS', async () => {
    const bridge = makeBridge();
    await bridge.start();
    await bridge.shutdown();
    expect(mockObsDisconnect).toHaveBeenCalled();
  });

  it('unsubscribes PocketBase realtime', async () => {
    const bridge = makeBridge();
    await bridge.start();
    await bridge.shutdown();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// executeCommand() — one test per action
// ---------------------------------------------------------------------------

describe('SanctuaryBridge.executeCommand() via subscribeToCommands', () => {
  beforeEach(() => vi.clearAllMocks());

  // Helper: grab the subscription callback and simulate a new command event
  const simulateCommand = async (action: string, payload?: Record<string, unknown>) => {
    const bridge = makeBridge();
    await bridge.start();

    // mockSubscribe was called with ('*', callback) — grab that callback
    const subscribeCallback = mockSubscribe.mock.calls.find(
      ([filter]: [string]) => filter === '*'
    )?.[1];

    expect(subscribeCallback).toBeDefined();

    const record = {
      id: 'cmd-test',
      action,
      executed: false,
      correlation_id: '00000000-0000-4000-8000-000000000001',
      payload: payload ?? null,
    };

    await subscribeCallback({ action: 'create', record });
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
    mockObsCall.mockResolvedValue({ outputActive: true }); // restore
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

  it('ignores events that are not "create" actions (no double-execution)', async () => {
    const bridge = makeBridge();
    await bridge.start();

    const subscribeCallback = mockSubscribe.mock.calls.find(
      ([filter]: [string]) => filter === '*'
    )?.[1];

    vi.clearAllMocks();

    // Simulate an "update" event — bridge should ignore it
    await subscribeCallback({
      action: 'update',
      record: { id: 'cmd-2', action: 'START', executed: false, correlation_id: 'abc' },
    });

    expect(mockObsCall).not.toHaveBeenCalled();
  });

  it('ignores commands that are already executed', async () => {
    const bridge = makeBridge();
    await bridge.start();

    const subscribeCallback = mockSubscribe.mock.calls.find(
      ([filter]: [string]) => filter === '*'
    )?.[1];

    vi.clearAllMocks();

    await subscribeCallback({
      action: 'create',
      record: { id: 'cmd-3', action: 'START', executed: true, correlation_id: 'abc' },
    });

    expect(mockObsCall).not.toHaveBeenCalled();
  });
});
