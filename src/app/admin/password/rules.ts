/** Shared password rules, kept outside the "use server" module. */

export const MIN_PASSWORD = 10;

export type PasswordState = { error?: string; sent?: boolean; saved?: boolean };
