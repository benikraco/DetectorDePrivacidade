// Function to send the LocalStorage data to the background script
const sendLocalStorageData = () => {
    const localStorageCount = Object.keys(localStorage).length;
  
    browser.runtime.sendMessage({ method: 'getLocalStorageData', data: localStorageCount });
  };
  
  // Call the function to send the LocalStorage data
  sendLocalStorageData();
  