let thirdPartyUrls = new Set();
let cookieDetails = [];

// Listener for third-party requests
browser.webRequest.onBeforeRequest.addListener(
  (details) => {
    const initiator = details.initiator || details.originUrl;
    const target = new URL(details.url);

    if (initiator && (new URL(initiator).origin !== target.origin)) {
      thirdPartyUrls.add(target.origin);
    }
  },
  { urls: ['<all_urls>'] }
);

// Listener for Cookie changes
browser.cookies.onChanged.addListener((changeInfo) => {
  const cookie = changeInfo.cookie;

  // Check if the cookie was removed
  if (changeInfo.removed) {
    cookieDetails = cookieDetails.filter(item => item.name !== cookie.name && item.domain !== cookie.domain);
  } else {
    cookieDetails.push({
      name: cookie.name,
      value: cookie.value,
      domain: cookie.domain,
      session: cookie.session
    });
  }
});

// Listener for extension messages
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.method === 'getThirdPartyUrls') {
    sendResponse({data: Array.from(thirdPartyUrls)});
  } else if (request.method === 'getCookies') {
    sendResponse({data: cookieDetails});
  }
});
