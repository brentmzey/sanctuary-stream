import { Result, fromThrowable, fromPromise, AsyncResult } from './result'

/**
 * Encapsulates a synchronous side-effecting computation.
 * Use this to wrap Impure functions so they explicitly state their intent.
 */
export class IO<T> {
    constructor(private readonly effect: () => T) { }

    /**
     * Wrap a pure, non-effectful value in an IO.
     */
    static pure<A>(value: A): IO<A> {
        return new IO(() => value)
    }

    /**
     * Maps the result of an IO effect.
     */
    map<U>(mapper: (value: T) => U): IO<U> {
        return new IO(() => mapper(this.effect()))
    }

    /**
     * Chains IO effects together.
     */
    flatMap<U>(mapper: (value: T) => IO<U>): IO<U> {
        return new IO(() => mapper(this.effect()).unsafeRunSync())
    }

    /**
     * Executes the side effect un-safely.
     * Throws an error if the underlying effect throws.
     * Scala-like naming matching the raw ability.
     */
    unsafeRunSync(): T {
        return this.effect()
    }

    /**
     * Executes the side effect safely, returning a Result.
     */
    attempt<E = Error>(onError: (e: unknown) => E = (e) => (e instanceof Error ? e : new Error(String(e))) as E): Result<T, E> {
        return fromThrowable(() => this.effect(), onError)
    }
}

/**
 * Encapsulates an asynchronous side-effecting computation (i.e. returning a Promise).
 */
export class AsyncIO<T> {
    constructor(private readonly effect: () => Promise<T>) { }

    /**
     * Wrap a pure value in an AsyncIO.
     */
    static pure<A>(value: A): AsyncIO<A> {
        return new AsyncIO(() => Promise.resolve(value))
    }

    map<U>(mapper: (value: T) => U): AsyncIO<U> {
        return new AsyncIO(async () => mapper(await this.effect()))
    }

    flatMap<U>(mapper: (value: T) => AsyncIO<U>): AsyncIO<U> {
        return new AsyncIO(async () => mapper(await this.effect()).unsafeRunAsync())
    }

    /**
     * Executes the async side effect un-safely.
     * Rejects if the underlying effect rejects.
     */
    async unsafeRunAsync(): Promise<T> {
        return this.effect()
    }

    /**
     * Executes the async side effect safely, returning an AsyncResult.
     */
    attempt<E = Error>(onError: (e: unknown) => E = (e) => (e instanceof Error ? e : new Error(String(e))) as E): AsyncResult<T, E> {
        return fromPromise(() => this.effect(), onError)
    }
}
