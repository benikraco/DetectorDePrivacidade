let thirdPartyUrls = new Set();
let cookieDetails = [];
let firstPartyCookies = 0;
let thirdPartyCookies = 0;
let sessionCookies = 0;
let persistentCookies = 0;

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

// Function to update the counts for cookies
const calculateCookieCounts = () => {
  firstPartyCookies = cookieDetails.filter(cookie => cookie.firstParty).length;
  thirdPartyCookies = cookieDetails.filter(cookie => !cookie.firstParty).length;
  sessionCookies = cookieDetails.filter(cookie => cookie.session).length;
  persistentCookies = cookieDetails.filter(cookie => !cookie.session).length;
}

// Listener for Cookie changes
browser.cookies.onChanged.addListener((changeInfo) => {
  const cookie = changeInfo.cookie;

  // Get the current tab's domain
  browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
    const currentDomain = new URL(tabs[0].url).hostname;

    // Check if the cookie was removed
    if (changeInfo.removed) {
      cookieDetails = cookieDetails.filter(item => item.name !== cookie.name && item.domain !== cookie.domain);
    } else {
      // Check if the cookie already exists in the list
      const existingCookieIndex = cookieDetails.findIndex(item => item.name === cookie.name && item.domain === cookie.domain);
      if (existingCookieIndex > -1) {
        // Update existing cookie
        cookieDetails[existingCookieIndex] = {
          name: cookie.name,
          value: cookie.value,
          domain: cookie.domain,
          session: cookie.session,
          firstParty: cookieDetails[existingCookieIndex].firstParty
        };
      } else {
        // Add new cookie
        const firstParty = cookie.domain === currentDomain;
        cookieDetails.push({
          name: cookie.name,
          value: cookie.value,
          domain: cookie.domain,
          session: cookie.session,
          firstParty: firstParty
        });
      }
    }

    // Recalculate counts
    calculateCookieCounts();
  });
});

// Listener for extension messages
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.method === 'getThirdPartyUrls') {
    sendResponse({data: Array.from(thirdPartyUrls)});
  } else if (request.method === 'getCookies') {
    sendResponse({
      data: {
        firstPartyCookies,
        thirdPartyCookies,
        sessionCookies,
        persistentCookies
      }
    });
  }
});
