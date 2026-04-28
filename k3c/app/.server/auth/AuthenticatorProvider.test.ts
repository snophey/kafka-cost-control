import { describe, expect, it } from 'vitest';
import { generateUserIdFromSub } from './AuthenticatorProvider';
import { z } from 'zod';

describe('generateUserIdFromSub', () => {
  it('creates a deterministic uuidv5 without reserved path characters', () => {
    const sub = 'user/with?special#chars';
    const first = generateUserIdFromSub(sub);
    const second = generateUserIdFromSub(sub);

    expect(first).toBe(second);
    expect(z.string().uuid().parse(first)).toBe(first);
    expect(first).not.toMatch(/[?#/]/);
  });

  it('produces different ids for different subs', () => {
    const first = generateUserIdFromSub('sub-one');
    const second = generateUserIdFromSub('sub-two');

    expect(first).not.toBe(second);
  });
});
