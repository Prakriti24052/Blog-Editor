// Debounce utility function
// Delays the execution of a function until after a specified delay
// Useful for auto-save functionality to avoid making too many API calls
export const debounce = (func, delay) => {
  let timeoutId;
  
  return function (...args) {
    // Clear the previous timeout
    clearTimeout(timeoutId);
    
    // Set a new timeout
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};