/**
 * Unit tests for shared/result.ts
 *
 * Result<T,E> is our railway-oriented-programming primitive — every async
 * operation that can fail returns one of these instead of throwing. These
 * tests make sure the rails never cross unexpectedly.
 */
import { describe, it, expect } from 'vitest';
import {
    success,
    failure,
    isSuccess,
    isFailure,
    map,
    mapError,
    flatMap,
    fold,
    match,
    getOrElse,
    fromThrowable,
    fromPromise,
    fromResult,
    asyncFlatMap,
    asyncMap,
} from './result';

// ---------------------------------------------------------------------------
// Constructors & guards
// ---------------------------------------------------------------------------

describe('success()', () => {
    it('creates a Success tagged value', () => {
        const r = success(42);
        expect(r._tag).toBe('success');
        expect(isSuccess(r) && r.value).toBe(42);
    });
});

describe('failure()', () => {
    it('creates a Failure tagged value', () => {
        const r = failure(new Error('oops'));
        expect(r._tag).toBe('failure');
        expect(isFailure(r) && r.error.message).toBe('oops');
    });
});

describe('isSuccess() / isFailure()', () => {
    it('isSuccess returns true for success, false for failure', () => {
        expect(isSuccess(success(1))).toBe(true);
        expect(isSuccess(failure('e'))).toBe(false);
    });

    it('isFailure returns true for failure, false for success', () => {
        expect(isFailure(failure('e'))).toBe(true);
        expect(isFailure(success(1))).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// map
// ---------------------------------------------------------------------------

describe('map()', () => {
    it('transforms the value inside Success', () => {
        const r = map(success(5), (n) => n * 2);
        expect(isSuccess(r) && r.value).toBe(10);
    });

    it('is a no-op on Failure — mapper never called', () => {
        let called = false;
        const r = map(failure<string>('err'), (n: number) => { called = true; return n * 2; });
        expect(isFailure(r)).toBe(true);
        expect(called).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// mapError
// ---------------------------------------------------------------------------

describe('mapError()', () => {
    it('transforms the error inside Failure', () => {
        const r = mapError(failure('raw'), (e) => new Error(e));
        expect(isFailure(r) && r.error.message).toBe('raw');
    });

    it('is a no-op on Success', () => {
        let called = false;
        const r = mapError(success(1), (e) => { called = true; return e; });
        expect(isSuccess(r)).toBe(true);
        expect(called).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// flatMap
// ---------------------------------------------------------------------------

describe('flatMap()', () => {
    it('chains Success → Success', () => {
        const r = flatMap(success(3), (n) => success(n + 1));
        expect(isSuccess(r) && r.value).toBe(4);
    });

    it('chains Success → Failure (short-circuits the happy path)', () => {
        const r = flatMap(success(3), () => failure(new Error('downstream fail')));
        expect(isFailure(r) && r.error.message).toBe('downstream fail');
    });

    it('short-circuits on Failure — mapper never called', () => {
        let called = false;
        const r = flatMap(failure<string>('initial'), (n: number) => { called = true; return success(n + 1); });
        expect(isFailure(r)).toBe(true);
        expect(called).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// fold / match (same function, two names)
// ---------------------------------------------------------------------------

describe('fold() / match()', () => {
    it('calls onSuccess with value on Success', () => {
        const msg = fold(success(42), (n) => `got ${n}`, () => 'failed');
        expect(msg).toBe('got 42');
    });

    it('calls onFailure with error on Failure', () => {
        const msg = fold(failure(new Error('boom')), () => 'ok', (e) => `failed: ${e.message}`);
        expect(msg).toBe('failed: boom');
    });

    it('match is an alias for fold', () => {
        const r = success('hello');
        expect(match(r, (v) => v.length, () => 0)).toBe(5);
    });
});

// ---------------------------------------------------------------------------
// getOrElse
// ---------------------------------------------------------------------------

describe('getOrElse()', () => {
    it('returns value on Success', () => {
        expect(getOrElse(success('found'), () => 'default')).toBe('found');
    });

    it('returns fallback on Failure', () => {
        expect(getOrElse(failure<string>('err'), () => 'default')).toBe('default');
    });

    it('does not call fallback when Success', () => {
        let called = false;
        getOrElse(success(1), () => { called = true; return 0; });
        expect(called).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// fromThrowable — wraps a synchronous throw-able
// ---------------------------------------------------------------------------

describe('fromThrowable()', () => {
    it('returns Success when factory succeeds', () => {
        const r = fromThrowable(() => JSON.parse('{"ok":true}'), (e) => new Error(String(e)));
        expect(isSuccess(r) && r.value).toEqual({ ok: true });
    });

    it('returns Failure when factory throws', () => {
        const r = fromThrowable(() => JSON.parse('bad json'), (e) => new Error(String(e)));
        expect(isFailure(r)).toBe(true);
    });

    it('applies the error mapper', () => {
        const r = fromThrowable(
            () => { throw new TypeError('type error'); },
            (e) => `mapped: ${(e as Error).message}`
        );
        expect(isFailure(r) && r.error).toBe('mapped: type error');
    });
});

// ---------------------------------------------------------------------------
// fromPromise — wraps an async throw-able
// ---------------------------------------------------------------------------

describe('fromPromise()', () => {
    it('returns Success when promise resolves', async () => {
        const r = await fromPromise(
            () => Promise.resolve(99),
            (e) => new Error(String(e))
        );
        expect(isSuccess(r) && r.value).toBe(99);
    });

    it('returns Failure when promise rejects', async () => {
        const r = await fromPromise(
            () => Promise.reject(new Error('network down')),
            (e) => e as Error
        );
        expect(isFailure(r) && r.error.message).toBe('network down');
    });
});

// ---------------------------------------------------------------------------
// fromResult — lifts a sync Result into a Promise<Result>
// ---------------------------------------------------------------------------

describe('fromResult()', () => {
    it('wraps Success in a resolved promise', async () => {
        const r = await fromResult(success('lifted'));
        expect(isSuccess(r) && r.value).toBe('lifted');
    });

    it('wraps Failure in a resolved promise', async () => {
        const r = await fromResult(failure('err'));
        expect(isFailure(r) && r.error).toBe('err');
    });
});

// ---------------------------------------------------------------------------
// asyncFlatMap
// ---------------------------------------------------------------------------

describe('asyncFlatMap()', () => {
    it('chains AsyncResult success → success', async () => {
        const initial = fromResult(success(10));
        const result = await asyncFlatMap(initial, (n) => fromResult(success(n + 5)));
        expect(isSuccess(result) && result.value).toBe(15);
    });

    it('short-circuits on initial failure', async () => {
        const initial = fromResult(failure<string>('initial fail'));
        let mapperCalled = false;
        const result = await asyncFlatMap(initial, (n: number) => { mapperCalled = true; return fromResult(success(n)); });
        expect(isFailure(result)).toBe(true);
        expect(mapperCalled).toBe(false);
    });

    it('propagates mapper failure', async () => {
        const initial = fromResult(success(5));
        const result = await asyncFlatMap(initial, () => fromResult(failure('mapper failed')));
        expect(isFailure(result) && result.error).toBe('mapper failed');
    });
});

// ---------------------------------------------------------------------------
// asyncMap
// ---------------------------------------------------------------------------

describe('asyncMap()', () => {
    it('transforms AsyncResult success value', async () => {
        const initial = fromResult(success('hello'));
        const result = await asyncMap(initial, (s: string) => s.toUpperCase());
        expect(isSuccess(result) && result.value).toBe('HELLO');
    });

    it('is a no-op on AsyncResult failure', async () => {
        const initial = fromResult(failure<string>('fail'));
        let called = false;
        const result = await asyncMap(initial, (s: string) => { called = true; return s.toUpperCase(); });
        expect(isFailure(result)).toBe(true);
        expect(called).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// Realistic composition patterns
// ---------------------------------------------------------------------------

describe('Result composition (real-world patterns)', () => {
    it('parse URL → validate → build client (all sync)', () => {
        const parseUrl = (raw: string) =>
            fromThrowable(
                () => { const u = new URL(raw); return u.href; },
                (e) => new Error(`Invalid URL: ${e}`)
            );

        const requireHttps = (url: string) =>
            url.startsWith('https')
                ? success(url)
                : failure(new Error('Must use HTTPS'));

        const buildClient = (url: string) => flatMap(requireHttps(url), (u) => success({ url: u }));

        // Happy path
        const ok = flatMap(parseUrl('https://myapp.pockethost.io'), buildClient);
        expect(isSuccess(ok) && ok.value.url).toBe('https://myapp.pockethost.io/');

        // Sad path — bad URL
        const badUrl = flatMap(parseUrl('not-a-url'), buildClient);
        expect(isFailure(badUrl)).toBe(true);

        // Sad path — HTTP not HTTPS
        const httpUrl = flatMap(parseUrl('http://myapp.pockethost.io'), buildClient);
        expect(isFailure(httpUrl) && httpUrl.error.message).toContain('HTTPS');
    });
});
