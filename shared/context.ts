import { type Option, some, none } from './option';

/**
 * UserContext — Monadic wrapper for authenticated user state.
 * This encapsulates the user ID and role retrieved from the request.
 */
export interface UserContext {
  readonly userId: Option<string>;
  readonly role: 'admin' | 'pastor' | 'tech' | 'public';
  readonly token: Option<string>;
}

export const createPublicContext = (): UserContext => ({
  userId: none<string>(),
  role: 'public',
  token: none<string>()
});

export const createAdminContext = (userId: string, token: string): UserContext => ({
  userId: some(userId),
  role: 'admin',
  token: some(token)
});

export const createUserContext = (userId: string, role: 'pastor' | 'tech', token: string): UserContext => ({
  userId: some(userId),
  role,
  token: some(token)
});

/**
 * Specifically for automated operations that require system elevation.
 */
export const createElevatedContext = (): UserContext => ({
  userId: some('system'),
  role: 'admin',
  token: none<string>()
});

export const isElevated = (ctx?: UserContext): boolean => {
  if (!ctx) return false;
  return ctx.role === 'admin' || ctx.role === 'pastor';
};

export const isAuthenticated = (ctx?: UserContext): boolean => {
  if (!ctx) return false;
  return ctx.role !== 'public' && isSome(ctx.userId);
};

function isSome<T>(opt: Option<T>): boolean {
  return opt._tag === 'some';
}
