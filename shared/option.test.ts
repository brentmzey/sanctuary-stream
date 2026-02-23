/**
 * Unit tests for shared/option.ts
 *
 * We treat Option like Scala's Option or Java's Optional.ofNullable —
 * the whole point is to kill null-reference surprises at the type-system
 * level. These tests lock that contract in permanently.
 */
import { describe, it, expect } from 'vitest';
import {
    some,
    none,
    isSome,
    isNone,
    fromNullable,
    map,
    flatMap,
    fromPredicate,
    fromNonEmptyString,
    getOrElse,
    match,
    type Option,
} from './option';

// ---------------------------------------------------------------------------
// Constructors
// ---------------------------------------------------------------------------

describe('some()', () => {
    it('wraps a value in a Some', () => {
        const opt = some(42);
        expect(opt._tag).toBe('some');
        expect(isSome(opt) && opt.value).toBe(42);
    });

    it('works with string values', () => {
        const opt = some('hello');
        expect(isSome(opt) && opt.value).toBe('hello');
    });

    it('wraps objects by reference — no deep copy magic', () => {
        const obj = { key: 'value' };
        const opt = some(obj);
        expect(isSome(opt) && opt.value).toBe(obj); // same reference
    });
});

describe('none()', () => {
    it('creates a None', () => {
        const opt = none();
        expect(opt._tag).toBe('none');
        expect(isNone(opt)).toBe(true);
    });

    it('is always the same shape regardless of type param', () => {
        const a = none<number>();
        const b = none<string>();
        expect(a._tag).toBe(b._tag);
    });
});

// ---------------------------------------------------------------------------
// Type guards
// ---------------------------------------------------------------------------

describe('isSome()', () => {
    it('returns true for Some', () => expect(isSome(some(1))).toBe(true));
    it('returns false for None', () => expect(isSome(none())).toBe(false));
});

describe('isNone()', () => {
    it('returns true for None', () => expect(isNone(none())).toBe(true));
    it('returns false for Some', () => expect(isNone(some(1))).toBe(false));
});

// ---------------------------------------------------------------------------
// fromNullable — the Option.ofNullable() equivalent
// ---------------------------------------------------------------------------

describe('fromNullable()', () => {
    it('wraps a real value in Some', () => {
        const opt = fromNullable('sanctuary');
        expect(isSome(opt) && opt.value).toBe('sanctuary');
    });

    it('returns None for null', () => {
        expect(isNone(fromNullable(null))).toBe(true);
    });

    it('returns None for undefined', () => {
        expect(isNone(fromNullable(undefined))).toBe(true);
    });

    it('keeps 0 as a valid Some (falsy-but-real)', () => {
        expect(isSome(fromNullable(0))).toBe(true);
    });

    it('keeps empty string as a valid Some (caller decides if useful)', () => {
        expect(isSome(fromNullable(''))).toBe(true);
    });

    it('keeps false as a valid Some', () => {
        expect(isSome(fromNullable(false))).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// map
// ---------------------------------------------------------------------------

describe('map()', () => {
    it('transforms the inner value of a Some', () => {
        const opt = map(some(3), (n) => n * 10);
        expect(isSome(opt) && opt.value).toBe(30);
    });

    it('is a no-op on None — mapper never called', () => {
        let called = false;
        const opt = map(none<number>(), (n) => { called = true; return n * 10; });
        expect(isNone(opt)).toBe(true);
        expect(called).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// flatMap
// ---------------------------------------------------------------------------

describe('flatMap()', () => {
    it('chains Some → Some', () => {
        const opt = flatMap(some('hello'), (s) => some(s.length));
        expect(isSome(opt) && opt.value).toBe(5);
    });

    it('chains Some → None when mapper returns None', () => {
        const opt = flatMap(some(''), (s) => fromNonEmptyString(s));
        expect(isNone(opt)).toBe(true);
    });

    it('short-circuits on None — mapper never called', () => {
        let called = false;
        const opt = flatMap(none<string>(), (s) => { called = true; return some(s); });
        expect(isNone(opt)).toBe(true);
        expect(called).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// fromPredicate
// ---------------------------------------------------------------------------

describe('fromPredicate()', () => {
    it('returns Some when predicate passes', () => {
        const opt = fromPredicate(10, (n) => n > 5);
        expect(isSome(opt) && opt.value).toBe(10);
    });

    it('returns None when predicate fails', () => {
        const opt = fromPredicate(3, (n) => n > 5);
        expect(isNone(opt)).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// fromNonEmptyString — really useful for form fields
// ---------------------------------------------------------------------------

describe('fromNonEmptyString()', () => {
    it('returns Some for a non-empty string', () => {
        const opt = fromNonEmptyString('Andrew');
        expect(isSome(opt) && opt.value).toBe('Andrew');
    });

    it('trims whitespace before checking', () => {
        const opt = fromNonEmptyString('  hello  ');
        expect(isSome(opt) && opt.value).toBe('hello');
    });

    it('returns None for empty string', () => {
        expect(isNone(fromNonEmptyString(''))).toBe(true);
    });

    it('returns None for whitespace-only string', () => {
        expect(isNone(fromNonEmptyString('   '))).toBe(true);
    });

    it('returns None for null', () => {
        expect(isNone(fromNonEmptyString(null))).toBe(true);
    });

    it('returns None for undefined', () => {
        expect(isNone(fromNonEmptyString(undefined))).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// getOrElse
// ---------------------------------------------------------------------------

describe('getOrElse()', () => {
    it('returns the value when Some', () => {
        expect(getOrElse(some(99), () => 0)).toBe(99);
    });

    it('returns the fallback when None', () => {
        expect(getOrElse(none<number>(), () => 42)).toBe(42);
    });

    it('does not call fallback when Some', () => {
        let called = false;
        getOrElse(some('value'), () => { called = true; return 'fallback'; });
        expect(called).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// match
// ---------------------------------------------------------------------------

describe('match()', () => {
    it('calls onSome with the value', () => {
        const result = match(some(7), (n) => `value=${n}`, () => 'empty');
        expect(result).toBe('value=7');
    });

    it('calls onNone when None', () => {
        const result = match(none<number>(), (n) => `value=${n}`, () => 'empty');
        expect(result).toBe('empty');
    });
});

// ---------------------------------------------------------------------------
// Composition — realistic usage patterns
// ---------------------------------------------------------------------------

describe('Option composition (real-world patterns)', () => {
    it('safe localStorage access pattern', () => {
        // Simulates: fromNullable(localStorage.getItem('key'))
        const stored: string | null = null;
        const url = getOrElse(fromNullable(stored), () => 'http://127.0.0.1:8090');
        expect(url).toBe('http://127.0.0.1:8090');
    });

    it('pipeline: parse → validate → transform', () => {
        const processInput = (raw: string | null): Option<number> =>
            flatMap(
                fromNonEmptyString(raw),
                (s) => fromPredicate(parseInt(s, 10), (n) => !isNaN(n) && n > 0)
            );

        expect(isSome(processInput('42')) && (processInput('42') as { value: number }).value).toBe(42);
        expect(isNone(processInput(''))).toBe(true);
        expect(isNone(processInput('abc'))).toBe(true);
        expect(isNone(processInput(null))).toBe(true);
        expect(isNone(processInput('-5'))).toBe(true);
    });
});
