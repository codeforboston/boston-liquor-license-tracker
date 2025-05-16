import { expect, test } from 'vitest';
import { sum } from './example';

test('adds 1 + 1 to equal 2', () => {
  expect(sum(1, 1)).toBe(2);
})
