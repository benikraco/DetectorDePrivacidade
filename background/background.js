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

// Function to handle cookies
const handleCookies = () => {
  browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
    const currentDomain = new URL(tabs[0].url).hostname;

    // Reset cookie details and counts
    cookieDetails = [];
    firstPartyCookies = 0;
    thirdPartyCookies = 0;
    sessionCookies = 0;
    persistentCookies = 0;

    // Get all cookies related to the current domain
    browser.cookies.getAll({ url: tabs[0].url }).then(cookies => {
      cookies.forEach(cookie => {
        const firstParty = cookie.domain.includes(currentDomain);
        const existingCookieIndex = cookieDetails.findIndex(item => item.name === cookie.name && item.domain === cookie.domain);

        if (existingCookieIndex > -1) {
          // Update existing cookie
          cookieDetails[existingCookieIndex] = {
            name: cookie.name,
            value: cookie.value,
            domain: cookie.domain,
            session: cookie.session,
            firstParty: firstParty
          };
        } else {
          // Add new cookie
          cookieDetails.push({
            name: cookie.name,
            value: cookie.value,
            domain: cookie.domain,
            session: cookie.session,
            firstParty: firstParty
          });
        }
      });

      // Recalculate counts
      calculateCookieCounts();
    });
  });
};


// Listener for extension messages
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.method === 'getThirdPartyUrls') {
    sendResponse({data: Array.from(thirdPartyUrls)});
  } else if (request.method === 'getCookies') {
    handleCookies(); // Handle cookies before sending response
    sendResponse({
      data: {
        firstPartyCookies,
        thirdPartyCookies,
        sessionCookies,
        persistentCookies
      }
    });
  } else if (request.method === 'clearLogs') {
    thirdPartyUrls = new Set();
    cookieDetails = [];
    firstPartyCookies = 0;
    thirdPartyCookies = 0;
    sessionCookies = 0;
    persistentCookies = 0;
  }
});
