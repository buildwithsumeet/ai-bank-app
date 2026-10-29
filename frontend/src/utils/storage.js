/**
 * Universal Storage Helper (Browser localStorage with Node.js test environment fallback)
 */
export const getStorageItem = (key) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    if (typeof localStorage !== 'undefined' && localStorage && typeof localStorage.getItem === 'function') {
      return localStorage.getItem(key);
    }
  } catch (e) {
    // Ignore in non-browser env
  }
  return null;
};

export const setStorageItem = (key, value) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    } else if (typeof localStorage !== 'undefined' && localStorage && typeof localStorage.setItem === 'function') {
      localStorage.setItem(key, value);
    }
  } catch (e) {
    // Ignore in non-browser env
  }
};

export const removeStorageItem = (key) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    } else if (typeof localStorage !== 'undefined' && localStorage && typeof localStorage.removeItem === 'function') {
      localStorage.removeItem(key);
    }
  } catch (e) {
    // Ignore in non-browser env
  }
};
