let thirdPartyUrls = new Set();
let cookieDetails = [];
let firstPartyCookies = 0;
let thirdPartyCookies = 0;
let sessionCookies = 0;
let persistentCookies = 0;

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

const calculateCookieCounts = () => {
  firstPartyCookies = cookieDetails.filter(cookie => cookie.firstParty).length;
  thirdPartyCookies = cookieDetails.filter(cookie => !cookie.firstParty).length;
  sessionCookies = cookieDetails.filter(cookie => cookie.session).length;
  persistentCookies = cookieDetails.filter(cookie => !cookie.session).length;
}

const handleCookies = () => {
  browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
    const currentDomain = new URL(tabs[0].url).hostname;

    cookieDetails = [];
    firstPartyCookies = 0;
    thirdPartyCookies = 0;
    sessionCookies = 0;
    persistentCookies = 0;

    browser.cookies.getAll({ url: tabs[0].url }).then(cookies => {
      cookies.forEach(cookie => {
        const firstParty = cookie.domain.includes(currentDomain);
        const existingCookieIndex = cookieDetails.findIndex(item => item.name === cookie.name && item.domain === cookie.domain);

        if (existingCookieIndex > -1) {
          cookieDetails[existingCookieIndex] = {
            name: cookie.name,
            value: cookie.value,
            domain: cookie.domain,
            session: cookie.session,
            firstParty: firstParty
          };
        } else {
          cookieDetails.push({
            name: cookie.name,
            value: cookie.value,
            domain: cookie.domain,
            session: cookie.session,
            firstParty: firstParty
          });
        }
      });

      calculateCookieCounts();
    });
  });
};

const checkLocalStorage = () => {
  return new Promise((resolve, reject) => {
    browser.tabs.executeScript({
      code: 'Object.keys(localStorage);'
    }, result => {
      if (browser.runtime.lastError) {
        reject(browser.runtime.lastError);
      } else {
        resolve(result[0]);
      }
    });
  });
};

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.method === 'getThirdPartyUrls') {
    sendResponse({data: Array.from(thirdPartyUrls)});
    
  } else if (request.method === 'getCookies') {
    handleCookies();
    sendResponse({
      data: {
        firstPartyCookies,
        thirdPartyCookies,
        sessionCookies,
        persistentCookies,
        firstPartyCookiesDetails: cookieDetails.filter(cookie => cookie.firstParty),
        thirdPartyCookiesDetails: cookieDetails.filter(cookie => !cookie.firstParty),
        cookieDetails
      }
    });

  } else if (request.method === 'checkLocalStorage') {
    checkLocalStorage().then(keys => {
      sendResponse({data: keys});
    });
    return true;

  } else if (request.method === 'clearLogs') {
    thirdPartyUrls = new Set();
    cookieDetails = [];
    firstPartyCookies = 0;
    thirdPartyCookies = 0;
    sessionCookies = 0;
    persistentCookies = 0;
    privacyScore = 10;
  }
});
