browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.method === 'getLocalStorage') {
      sendResponse({data: Object.keys(localStorage).length});
    }
  });
  