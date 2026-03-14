import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';

// Hoisted mocks
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

vi.mock('pocketbase', () => {
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
  class MockOBS {
    connect = mockObsConnect;
    disconnect = mockObsDisconnect;
    call = mockObsCall;
    on = mockObsOn;
  }
  return { default: MockOBS };
});

vi.mock('./google-drive', () => ({
  uploadFile: vi.fn().mockResolvedValue('drive-file-123'),
}));

// Mock fs
vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn().mockReturnValue(true),
    statSync: vi.fn().mockReturnValue({ size: 1234 }),
  },
}));

process.env.STREAM_ID = 'test-stream-123';
process.env.PB_URL = 'http://127.0.0.1:8090';
process.env.BRIDGE_EMAIL = 'bridge@local.dev';
process.env.BRIDGE_PASS = 'bridge123456';
process.env.OBS_URL = 'ws://127.0.0.1:4455';

const { SanctuaryBridge } = await import('./index');

describe('SanctuaryBridge Coverage Boost', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles SET_VIDEO_SETTINGS with optional fields', async () => {
    const bridge = new SanctuaryBridge();
    await bridge.start();

    const record = {
      id: 'cmd-video-opt',
      action: 'SET_VIDEO_SETTINGS',
      executed: false,
      correlation_id: 'corr-1',
      payload: {
        baseWidth: 1280,
        baseHeight: 720,
        outputWidth: 1920,
        outputHeight: 1080,
        fpsNum: 30,
        fpsDen: 1
      },
    };

    await bridge.executeCommand(record);
    expect(mockObsCall).toHaveBeenCalledWith('SetVideoSettings', expect.objectContaining({
      baseWidth: 1280,
      baseHeight: 720,
      outputWidth: 1920,
      outputHeight: 1080,
      fpsNumerator: 30,
      fpsDenominator: 1
    }));
  });

  it('handles SET_SCENE command', async () => {
    const bridge = new SanctuaryBridge();
    await bridge.start();

    const record = {
      id: 'cmd-scene',
      action: 'SET_SCENE',
      executed: false,
      correlation_id: 'corr-2',
      payload: { sceneName: 'Main Scene' },
    };

    await bridge.executeCommand(record);
    expect(mockObsCall).toHaveBeenCalledWith('SetCurrentProgramScene', { sceneName: 'Main Scene' });
  });

  it('handles SET_MUTE command', async () => {
    const bridge = new SanctuaryBridge();
    await bridge.start();

    const record = {
      id: 'cmd-mute',
      action: 'SET_MUTE',
      executed: false,
      correlation_id: 'corr-3',
      payload: { inputName: 'Mic', muted: true },
    };

    await bridge.executeCommand(record);
    expect(mockObsCall).toHaveBeenCalledWith('SetInputMute', { inputName: 'Mic', inputMuted: true });
  });

  it('handles SET_MUTE validation failure', async () => {
      const bridge = new SanctuaryBridge();
      await bridge.start();
  
      const record = {
        id: 'cmd-mute-fail',
        action: 'SET_MUTE',
        executed: false,
        correlation_id: 'corr-4',
        payload: { muted: true }, // Missing inputName
      };
  
      await bridge.executeCommand(record);
      const match = mockPbUpdate.mock.calls.some(args => 
        args[0] === 'cmd-mute-fail' && args[1].error_message?.includes('Missing inputName')
      );
      expect(match).toBe(true);
  });

  it('handles SET_SCENE validation failure', async () => {
      const bridge = new SanctuaryBridge();
      await bridge.start();
  
      const record = {
        id: 'cmd-scene-fail',
        action: 'SET_SCENE',
        executed: false,
        correlation_id: 'corr-5',
        payload: {}, // Missing sceneName
      };
  
      await bridge.executeCommand(record);
      const match = mockPbUpdate.mock.calls.some(args => 
        args[0] === 'cmd-scene-fail' && args[1].error_message?.includes('Missing sceneName')
      );
      expect(match).toBe(true);
  });

  it('RecordStateChanged ignore when outputActive is false but no outputPath', async () => {
    const bridge = new SanctuaryBridge();
    await bridge.start();

    const callArgs = mockObsOn.mock.calls.find(args => args[0] === 'RecordStateChanged');
    const callback = callArgs?.[1];

    vi.clearAllMocks();
    await callback({ outputActive: false }); // No outputPath
    
    // Should update status but NOT trigger upload
    expect(mockPbUpdate).toHaveBeenCalledWith('test-stream-123', expect.objectContaining({ status: 'idle' }));
    // Hard to check if uploadFile was NOT called because it's in a promise, 
    // but we can check if fs.existsSync was NOT called.
    expect(fs.existsSync).not.toHaveBeenCalled();
  });

  it('RecordStateChanged handles non-existent file gracefully', async () => {
    const bridge = new SanctuaryBridge();
    await bridge.start();

    const callArgs = mockObsOn.mock.calls.find(args => args[0] === 'RecordStateChanged');
    const callback = callArgs?.[1];

    vi.mocked(fs.existsSync).mockReturnValueOnce(false);

    await callback({ outputActive: false, outputPath: '/ghost/file.mp4' });
    
    // Wait for microtasks
    await Promise.resolve();
    await Promise.resolve();

    expect(mockPbCreate).toHaveBeenCalledWith(expect.objectContaining({
      size: 0
    }));
  });

  it('updateStreamStatus handles sceneList failure', async () => {
    const bridge = new SanctuaryBridge();
    await bridge.start();

    mockObsCall.mockImplementation((requestType: string) => {
      if (requestType === 'GetSceneList') return Promise.reject(new Error('Scene List Error'));
      return Promise.resolve({ outputActive: true, scenes: [], inputs: [] });
    });

    const callArgs = mockObsOn.mock.calls.find(args => args[0] === 'StreamStateChanged');
    const callback = callArgs?.[1];

    await callback({ outputActive: true });
    
    const match = mockPbUpdate.mock.calls.some(args => 
      args[0] === 'test-stream-123' && args[1].status === 'live'
    );
    expect(match).toBe(true);
    // metadata should NOT have scenes
    const updateCall = mockPbUpdate.mock.calls.find(args => args[0] === 'test-stream-123');
    expect(updateCall?.[1].metadata?.scenes).toBeUndefined();
  });

  it('updateStreamStatus handles inputList failure', async () => {
    const bridge = new SanctuaryBridge();
    await bridge.start();

    mockObsCall.mockImplementation((requestType: string) => {
      if (requestType === 'GetInputList') return Promise.reject(new Error('Input List Error'));
      return Promise.resolve({ outputActive: true, scenes: [], inputs: [] });
    });

    const callArgs = mockObsOn.mock.calls.find(args => args[0] === 'StreamStateChanged');
    const callback = callArgs?.[1];

    await callback({ outputActive: true });
    
    const match = mockPbUpdate.mock.calls.some(args => 
      args[0] === 'test-stream-123' && args[1].status === 'live'
    );
    expect(match).toBe(true);
    // metadata should NOT have inputs
    const updateCall = mockPbUpdate.mock.calls.find(args => args[0] === 'test-stream-123');
    expect(updateCall?.[1].metadata?.inputs).toBeUndefined();
  });

  it('updateStreamStatus filters non-audio inputs', async () => {
    const bridge = new SanctuaryBridge();
    await bridge.start();

    mockObsCall.mockImplementation(async (requestType: string) => {
      if (requestType === 'GetInputList') return { 
        inputs: [
          { inputName: 'AudioIn', inputKind: 'wasapi_input_capture' },
          { inputName: 'VideoIn', inputKind: 'ffmpeg_source' }
        ] 
      };
      if (requestType === 'GetInputMute') return { inputMuted: false };
      return { outputActive: true, scenes: [] };
    });

    const callArgs = mockObsOn.mock.calls.find(args => args[0] === 'StreamStateChanged');
    const callback = callArgs?.[1];

    await callback({ outputActive: true });
    
    const updateCall = mockPbUpdate.mock.calls.find(args => args[0] === 'test-stream-123');
    expect(updateCall?.[1].metadata?.inputs).toHaveLength(1);
    expect(updateCall?.[1].metadata?.inputs[0].name).toBe('AudioIn');
  });
});
