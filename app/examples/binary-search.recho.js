/**
 * @title Binary Search
 * @author Bairui Su
 * @github pearmini
 * @created 2025-12-08
 * @label Algorithm
 * @pull_request 200
 */

/**
 * ============================================================================
 * =                              Binary Search                               =
 * ============================================================================
 *
 * Binary search is a classic divide-and-conquer algorithm that efficiently
 * searches for a target value in a sorted array. Instead of checking each
 * element sequentially (linear search), binary search repeatedly divides the
 * search space in half by comparing the target with the middle element.
 *
 * This example demonstrates the `echo.key()` function, which allows you to
 * track variables across iterations. Each iteration shows how the search
 * interval [lo, hi] narrows down, the middle index being examined, and the
 * value at that position.
 *
 * Time Complexity: O(log n) - Each step eliminates half the remaining elements
 * Space Complexity: O(1) - Only uses a constant amount of extra space
 */

function binarySearch(target, arr) {
  let lo = 0; // Lower bound of search interval
  let hi = arr.length - 1; // Upper bound of search interval
  let iteration = 0; // Track the number of iterations

  while (lo <= hi) {
    iteration++;
    const mid = (lo + hi) >>> 1; // Calculate middle index (using unsigned right shift)
    const midValue = arr[mid]; // Value at the middle position

    // Track search progress across iterations
    echo.key("iteration")(iteration);
    echo.key("lo (left)")(lo);
    echo.key("hi (right)")(hi);
    echo.key("mid (center)")(mid);
    echo.key("arr[mid]")(midValue);

    // Compare and narrow the search interval
    if (midValue < target) {
      lo = mid + 1; // Target is in the right half
    } else if (midValue > target) {
      hi = mid - 1; // Target is in the left half
    } else {
      return mid; // Found the target!
    }
  }

  return -1; // Target not found
}

// Example 1: Searching for a value that exists in the array
// Classic example: searching for 19 in a sorted array of numbers
// Watch how the search space [lo, hi] narrows with each iteration

const sortedNumbers = [2, 5, 8, 11, 17, 19, 23, 29, 31, 37];
//➜ +----------------+----+----+----+
//➜ |    {iteration} |  1 |  2 |  3 |
//➜ |----------------|----|----|----|
//➜ |    {lo (left)} |  0 |  5 |  5 |
//➜ |----------------|----|----|----|
//➜ |   {hi (right)} |  9 |  9 |  6 |
//➜ |----------------|----|----|----|
//➜ | {mid (center)} |  4 |  7 |  5 |
//➜ |----------------|----|----|----|
//➜ |     {arr[mid]} | 17 | 29 | 19 |
//➜ +----------------+----+----+----+
binarySearch(19, sortedNumbers);

// Example 2: Searching for a value that doesn't exist
// Searching for 20, which falls between 19 and 23
// The algorithm narrows down until lo > hi, then returns -1

//➜ +----------------+----+----+----+----+
//➜ |    {iteration} |  1 |  2 |  3 |  4 |
//➜ |----------------|----|----|----|----|
//➜ |    {lo (left)} |  0 |  5 |  5 |  6 |
//➜ |----------------|----|----|----|----|
//➜ |   {hi (right)} |  9 |  9 |  6 |  6 |
//➜ |----------------|----|----|----|----|
//➜ | {mid (center)} |  4 |  7 |  5 |  6 |
//➜ |----------------|----|----|----|----|
//➜ |     {arr[mid]} | 17 | 29 | 19 | 23 |
//➜ +----------------+----+----+----+----+
binarySearch(20, sortedNumbers);

// Example 3: Searching in a larger array
// Demonstrates the efficiency: in a 16-element array, binary search requires
// at most 4 comparisons (log₂(16) = 4), while linear search needs up to 16

const largerArray = [3, 7, 11, 15, 19, 23, 27, 31, 35, 39, 43, 47, 51, 55, 59, 63];
//➜ +----------------+----+----+----+----+
//➜ |    {iteration} |  1 |  2 |  3 |  4 |
//➜ |----------------|----|----|----|----|
//➜ |    {lo (left)} |  0 |  8 |  8 | 10 |
//➜ |----------------|----|----|----|----|
//➜ |   {hi (right)} | 15 | 15 | 10 | 10 |
//➜ |----------------|----|----|----|----|
//➜ | {mid (center)} |  7 | 11 |  9 | 10 |
//➜ |----------------|----|----|----|----|
//➜ |     {arr[mid]} | 31 | 47 | 39 | 43 |
//➜ +----------------+----+----+----+----+
binarySearch(43, largerArray);
