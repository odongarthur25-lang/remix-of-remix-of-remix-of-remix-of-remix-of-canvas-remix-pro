// Minimal type surface for bun:test — tests run with `bun test`,
// but the project typecheck uses tsc which has no bun types installed.
declare module "bun:test" {
  export const test: (name: string, fn: () => void | Promise<void>) => void;
  export const describe: (name: string, fn: () => void) => void;
  export const beforeAll: (fn: () => void | Promise<void>) => void;
  export const afterAll: (fn: () => void | Promise<void>) => void;
  export function expect(value: unknown): {
    toBe: (expected: unknown) => void;
    toEqual: (expected: unknown) => void;
    toBeTruthy: () => void;
    toBeFalsy: () => void;
    toBeDefined: () => void;
    toBeNull: () => void;
  };
}
