/**
 * Unit tests for shared/io.ts
 *
 * IO<T> and AsyncIO<T> make side effects explicit and composable — you
 * know exactly when you're doing something impure because you have to
 * call unsafeRunSync / unsafeRunAsync. That deliberateness is the whole
 * point. These tests prove the algebra holds.
 */
import { describe, it, expect, vi } from 'vitest';
import { IO, AsyncIO } from './io';
import { isSuccess, isFailure } from './result';

// ===========================================================================
// IO<T> — synchronous side effects
// ===========================================================================

describe('IO<T>', () => {
    // -------------------------------------------------------------------------
    // pure
    // -------------------------------------------------------------------------

    describe('IO.pure()', () => {
        it('wraps a plain value — runs without side effects', () => {
            const io = IO.pure(42);
            expect(io.unsafeRunSync()).toBe(42);
        });

        it('wraps an object by reference', () => {
            const obj = { stream: 'live' };
            expect(IO.pure(obj).unsafeRunSync()).toBe(obj);
        });
    });

    // -------------------------------------------------------------------------
    // map
    // -------------------------------------------------------------------------

    describe('IO.map()', () => {
        it('transforms the result when run', () => {
            const io = IO.pure(5).map((n) => n * 3);
            expect(io.unsafeRunSync()).toBe(15);
        });

        it('does not run the effect until unsafeRunSync() is called', () => {
            let ran = false;
            const io = new IO(() => { ran = true; return 1; }).map((n) => n + 1);
            expect(ran).toBe(false);
            io.unsafeRunSync();
            expect(ran).toBe(true);
        });

        it('chains multiple maps correctly', () => {
            const io = IO.pure('hello')
                .map((s) => s.toUpperCase())
                .map((s) => s + '!');
            expect(io.unsafeRunSync()).toBe('HELLO!');
        });
    });

    // -------------------------------------------------------------------------
    // flatMap
    // -------------------------------------------------------------------------

    describe('IO.flatMap()', () => {
        it('sequences two IOs', () => {
            const io = IO.pure(3).flatMap((n) => IO.pure(n + 1));
            expect(io.unsafeRunSync()).toBe(4);
        });

        it('runs inner IO only when outer runs', () => {
            let innerRan = false;
            const io = IO.pure(1).flatMap(() => new IO(() => { innerRan = true; return 2; }));
            expect(innerRan).toBe(false);
            io.unsafeRunSync();
            expect(innerRan).toBe(true);
        });
    });

    // -------------------------------------------------------------------------
    // unsafeRunSync
    // -------------------------------------------------------------------------

    describe('IO.unsafeRunSync()', () => {
        it('propagates errors thrown by the effect', () => {
            const io = new IO(() => { throw new Error('boom'); });
            expect(() => io.unsafeRunSync()).toThrow('boom');
        });
    });

    // -------------------------------------------------------------------------
    // attempt
    // -------------------------------------------------------------------------

    describe('IO.attempt()', () => {
        it('returns Success when the effect succeeds', () => {
            const result = IO.pure('safe').attempt();
            expect(isSuccess(result) && result.value).toBe('safe');
        });

        it('returns Failure when the effect throws', () => {
            const io = new IO(() => { throw new Error('failure'); });
            const result = io.attempt();
            expect(isFailure(result) && result.error.message).toBe('failure');
        });

        it('uses the custom error mapper when provided', () => {
            const io = new IO<number>(() => { throw 'string-error'; });
            const result = io.attempt((e) => `mapped: ${e}` as unknown as Error);
            expect(isFailure(result) && result.error).toBe('mapped: string-error');
        });

        it('does not throw — always returns Result', () => {
            const io = new IO(() => { throw new RangeError('out of range'); });
            expect(() => io.attempt()).not.toThrow();
        });
    });
});

// ===========================================================================
// AsyncIO<T> — asynchronous side effects
// ===========================================================================

describe('AsyncIO<T>', () => {
    // -------------------------------------------------------------------------
    // pure
    // -------------------------------------------------------------------------

    describe('AsyncIO.pure()', () => {
        it('wraps a plain value in a resolved promise', async () => {
            const value = await AsyncIO.pure(99).unsafeRunAsync();
            expect(value).toBe(99);
        });
    });

    // -------------------------------------------------------------------------
    // map
    // -------------------------------------------------------------------------

    describe('AsyncIO.map()', () => {
        it('transforms the async result', async () => {
            const value = await AsyncIO.pure(10).map((n) => n * 2).unsafeRunAsync();
            expect(value).toBe(20);
        });

        it('chains multiple async maps', async () => {
            const value = await AsyncIO.pure('stream')
                .map((s) => s.length)
                .map((n) => n > 0)
                .unsafeRunAsync();
            expect(value).toBe(true);
        });

        it('does not run until unsafeRunAsync() is called', async () => {
            let ran = false;
            const io = new AsyncIO(async () => { ran = true; return 1; }).map((n) => n + 1);
            expect(ran).toBe(false);
            await io.unsafeRunAsync();
            expect(ran).toBe(true);
        });
    });

    // -------------------------------------------------------------------------
    // flatMap
    // -------------------------------------------------------------------------

    describe('AsyncIO.flatMap()', () => {
        it('sequences two AsyncIOs', async () => {
            const fetch1 = AsyncIO.pure({ id: 'stream-1' });
            const fetch2 = fetch1.flatMap((s) => AsyncIO.pure({ ...s, status: 'live' }));
            const result = await fetch2.unsafeRunAsync();
            expect(result).toEqual({ id: 'stream-1', status: 'live' });
        });

        it('delays inner execution until outer resolves', async () => {
            const calls: string[] = [];
            const outer = new AsyncIO(async () => { calls.push('outer'); return 1; });
            const io = outer.flatMap(() => new AsyncIO(async () => { calls.push('inner'); return 2; }));
            expect(calls).toEqual([]);
            await io.unsafeRunAsync();
            expect(calls).toEqual(['outer', 'inner']);
        });
    });

    // -------------------------------------------------------------------------
    // unsafeRunAsync
    // -------------------------------------------------------------------------

    describe('AsyncIO.unsafeRunAsync()', () => {
        it('rejects when the async effect throws', async () => {
            const io = new AsyncIO(async () => { throw new Error('async boom'); });
            await expect(io.unsafeRunAsync()).rejects.toThrow('async boom');
        });
    });

    // -------------------------------------------------------------------------
    // attempt
    // -------------------------------------------------------------------------

    describe('AsyncIO.attempt()', () => {
        it('returns AsyncResult Success on resolve', async () => {
            const result = await AsyncIO.pure('ok').attempt();
            expect(isSuccess(result) && result.value).toBe('ok');
        });

        it('returns AsyncResult Failure on rejection', async () => {
            const io = new AsyncIO(async () => { throw new Error('network error'); });
            const result = await io.attempt();
            expect(isFailure(result) && result.error.message).toBe('network error');
        });

        it('uses the custom error mapper', async () => {
            const io = new AsyncIO<number>(async () => { throw 'raw string'; });
            const result = await io.attempt((e) => new Error(`wrapped: ${e}`));
            expect(isFailure(result) && result.error.message).toBe('wrapped: raw string');
        });

        it('never rejects — always resolves to a Result', async () => {
            const io = new AsyncIO(async () => { throw new Error('fatal'); });
            const result = await io.attempt();
            expect(isFailure(result)).toBe(true);
            // The key assertion: .attempt() itself did NOT throw
        });
    });

    // -------------------------------------------------------------------------
    // Realistic composition — mirrors real usage in sanctuary-bridge
    // -------------------------------------------------------------------------

    describe('AsyncIO composition (real-world patterns)', () => {
        it('simulates a PocketBase→OBS command pipeline', async () => {
            // Simulate: fetchCommand → executOBS → updateStatus
            const fetchCommand = AsyncIO.pure({ action: 'START', id: 'cmd-1' });

            const executeOBS = (cmd: { action: string; id: string }) =>
                AsyncIO.pure({ ...cmd, executed: true });

            const updateStatus = (result: { executed: boolean }) =>
                AsyncIO.pure({ status: result.executed ? 'live' : 'idle' });

            const pipeline = fetchCommand
                .flatMap(executeOBS)
                .flatMap(updateStatus);

            const final = await pipeline.unsafeRunAsync();
            expect(final.status).toBe('live');
        });

        it('simulates a safe failing network call via attempt()', async () => {
            const failingCall = new AsyncIO<string>(async () => {
                throw new Error('PocketBase unreachable');
            });

            const result = await failingCall.attempt();
            expect(isFailure(result)).toBe(true);
            // No try/catch needed at call site — that's the whole point
        });
    });
});
