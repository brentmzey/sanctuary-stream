export type Some<T> = {
    readonly _tag: 'some'
    readonly value: T
}

export type None = {
    readonly _tag: 'none'
}

export type Option<T> = Some<T> | None

const noneValue: None = { _tag: 'none' }

export const some = <T>(value: T): Option<T> => ({ _tag: 'some', value })

export const none = <T = never>(): Option<T> => noneValue

export const isSome = <T>(option: Option<T>): option is Some<T> => option._tag === 'some'

export const isNone = <T>(option: Option<T>): option is None => option._tag === 'none'

export const fromNullable = <T>(value: T | null | undefined): Option<T> =>
    value === null || value === undefined ? none() : some(value)

export const map = <T, U>(option: Option<T>, mapper: (value: T) => U): Option<U> =>
    (isSome(option) ? some(mapper(option.value)) : none())

export const flatMap = <T, U>(option: Option<T>, mapper: (value: T) => Option<U>): Option<U> =>
    (isSome(option) ? mapper(option.value) : none())

export const fromPredicate = <T>(value: T, predicate: (value: T) => boolean): Option<T> =>
    (predicate(value) ? some(value) : none())

export const fromNonEmptyString = (value?: string | null): Option<string> =>
    flatMap(fromNullable(value), (text) => {
        const trimmed = text.trim()
        return trimmed.length > 0 ? some(trimmed) : none()
    })

export const getOrElse = <T>(option: Option<T>, orElse: () => T): T =>
    (isSome(option) ? option.value : orElse())

export const match = <T, R>(option: Option<T>, onSome: (value: T) => R, onNone: () => R): R =>
    (isSome(option) ? onSome(option.value) : onNone())
