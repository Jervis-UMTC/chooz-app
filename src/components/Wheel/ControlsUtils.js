/**
 * Parses raw text input into an array of names.
 * Splits by newline, trims whitespace, and filters empty strings.
 * @param {string} text Raw input text.
 * @returns {string[]} Array of valid names.
 */
export const parseImportText = (text) => {
  return text
    .split('\n')
    .map(name => name.trim())
    .filter(name => name.length > 0);
};

/**
 * Saves a new list to the saved lists array and local storage.
 * Handles overwriting existing lists with the same name.
 * @param {object[]} currentSavedLists Array of currently saved lists.
 * @param {string} listName Name of the new list.
 * @param {string[]} names Array of names in the list.
 * @param {string} storageKey Local storage key.
 * @returns {object[]} Updated array of saved lists.
 */
export const saveNewList = (currentSavedLists, listName, names, storageKey) => {
  const newList = { name: listName.trim(), names: [...names], date: Date.now() };
  const updated = [...currentSavedLists.filter(list => list.name !== listName.trim()), newList];
  localStorage.setItem(storageKey, JSON.stringify(updated));
  return updated;
};

/**
 * Deletes a list from the saved lists array and local storage.
 * @param {object[]} currentSavedLists Array of currently saved lists.
 * @param {object} listToDelete List object to delete.
 * @param {string} storageKey Local storage key.
 * @returns {object[]} Updated array of saved lists.
 */
export const deleteListFromStorage = (currentSavedLists, listToDelete, storageKey) => {
  const updated = currentSavedLists.filter(list => list.name !== listToDelete.name);
  localStorage.setItem(storageKey, JSON.stringify(updated));
  return updated;
};
