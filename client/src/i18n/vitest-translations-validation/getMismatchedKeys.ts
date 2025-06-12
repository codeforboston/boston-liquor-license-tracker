// This file contains a utility function to compare two objects and find mismatched keys.
export default function getMismatchedKeys(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  objectA: Record<string, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  objectB: Record<string, any>
) {
  const keysA = new Set(Object.keys(objectA));
  const keysB = new Set(Object.keys(objectB));

  const missingInB = [...keysA].filter((key) => !keysB.has(key));
  const missingInA = [...keysB].filter((key) => !keysA.has(key));

  return {
    missingInA, // keys in B but not in A
    missingInB, // keys in A but not in B
  };
}
