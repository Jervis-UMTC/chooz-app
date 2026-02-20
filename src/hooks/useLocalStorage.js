import { useState, useEffect } from 'react';

/**
 * Custom hook to manage state synchronized with localStorage.
 * Automatically saves state changes to localStorage and initializes from it.
 *
 * @param {string} key - The unique localStorage key to read/write from.
 * @param {any} initialValue - The default value to use if no value exists in localStorage.
 * @returns {[any, Function]} A tuple containing the current state value and a setter function.
 *
 * @example
 * const [names, setNames] = useLocalStorage('my_names', ['Alice', 'Bob']);
 */
export const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, value]);

  return [value, setValue];
};
