/**
 * Fisher-Yates shuffle algorithm
 * Randomly shuffle an array
 * @param array The array to be shuffled
 * @returns A new shuffled array
 */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Compare if two arrays contain the same elements regardless of order
 * @param arr1 First array
 * @param arr2 Second array
 * @returns true if both arrays contain the same elements, false otherwise
 */
export function areArraysEqualRegardlessOrder<T>(
  arr1: T[],
  arr2: T[],
): boolean {
  if (arr1.length !== arr2.length) return false;

  // For very small arrays, using a simple method may be faster
  if (arr1.length <= 2) {
    return (
      arr1.length === 0 ||
      (arr1.length === 1 && arr1[0] === arr2[0]) ||
      (arr1.length === 2 &&
        ((arr1[0] === arr2[0] && arr1[1] === arr2[1]) ||
          (arr1[0] === arr2[1] && arr1[1] === arr2[0])))
    );
  }

  const countMap = new Map<T, number>();

  // Count the occurrences of each element in arr1
  for (const element of arr1) {
    countMap.set(element, (countMap.get(element) || 0) + 1);
  }

  // Check elements in arr2
  for (const element of arr2) {
    const count = countMap.get(element);
    if (!count) {
      return false;
    }
    if (count === 1) {
      countMap.delete(element);
    } else {
      countMap.set(element, count - 1);
    }
  }

  return countMap.size === 0;
}
