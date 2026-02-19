/**
 * Generates an array of random dice results.
 * @param {number} count Number of dice to roll.
 * @returns {number[]} Array of dice values (1-6).
 */
export const generateDiceResults = (count) => {
  return Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1);
};

/**
 * Calculates the total sum of dice results.
 * @param {number[]} results Array of dice values.
 * @returns {number} Sum of values.
 */
export const calculateTotal = (results) => {
  return results.reduce((sum, val) => sum + val, 0);
};

/**
 * Updates the history array with the new result, maintaining the max length.
 * @param {object[]} currentHistory Existing history array.
 * @param {number[]} newResults New dice values.
 * @param {number} total Total sum of new values.
 * @param {number} maxLength Maximum history length.
 * @returns {object[]} New history array.
 */
export const updateHistory = (currentHistory, newResults, total, maxLength) => {
  return [
    { values: newResults, total },
    ...currentHistory,
  ].slice(0, maxLength);
};
