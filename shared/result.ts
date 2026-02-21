export type Success<T> = {
    readonly _tag: 'success'
    readonly value: T
}

export type Failure<E> = {
    readonly _tag: 'failure'
    readonly error: E
}

export type Result<T, E> = Success<T> | Failure<E>

export type AsyncResult<T, E> = Promise<Result<T, E>>

export const success = <T>(value: T): Success<T> => ({ _tag: 'success', value })

export const failure = <E>(error: E): Failure<E> => ({ _tag: 'failure', error })

export const isSuccess = <T, E>(result: Result<T, E>): result is Success<T> => result._tag === 'success'

export const isFailure = <T, E>(result: Result<T, E>): result is Failure<E> => result._tag === 'failure'

export const map = <T, E, U>(result: Result<T, E>, mapper: (value: T) => U): Result<U, E> =>
    isSuccess(result) ? success(mapper(result.value)) : result

export const mapError = <T, E, F>(result: Result<T, E>, mapper: (error: E) => F): Result<T, F> =>
    isFailure(result) ? failure(mapper(result.error)) : result

export const flatMap = <T, E, U>(result: Result<T, E>, mapper: (value: T) => Result<U, E>): Result<U, E> =>
    isSuccess(result) ? mapper(result.value) : result

export const fold = <T, E, R>(
    result: Result<T, E>,
    onSuccess: (value: T) => R,
    onFailure: (error: E) => R
): R => (isSuccess(result) ? onSuccess(result.value) : onFailure(result.error))

export const match = fold

export const getOrElse = <T, E>(result: Result<T, E>, orElse: () => T): T =>
    (isSuccess(result) ? result.value : orElse())

export const fromThrowable = <T, E>(
    factory: () => T,
    onError: (error: unknown) => E
): Result<T, E> => {
    try {
        return success(factory())
    } catch (error) {
        return failure(onError(error))
    }
}

export const fromPromise = async <T, E>(
    factory: () => Promise<T>,
    onError: (error: unknown) => E
): AsyncResult<T, E> => {
    try {
        const value = await factory()
        return success(value)
    } catch (error) {
        return failure(onError(error))
    }
}

export const fromResult = <T, E>(result: Result<T, E>): AsyncResult<T, E> => Promise.resolve(result)

export const asyncFlatMap = async <T, E, U>(
    input: AsyncResult<T, E>,
    mapper: (value: T) => AsyncResult<U, E>
): AsyncResult<U, E> => {
    const resolved = await input
    return isSuccess(resolved) ? mapper(resolved.value) : (resolved as Failure<E>)
}

export const asyncMap = async <T, E, U>(
    input: AsyncResult<T, E>,
    mapper: (value: T) => U
): AsyncResult<U, E> => asyncFlatMap(input, (value) => fromResult(success(mapper(value))))
