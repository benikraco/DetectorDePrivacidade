let tabs = {};
let thirdPartyUrls = new Set();  // Create a new Set to store the third-party URLs
let cookiesCount = 0;

// Listener for any change in tab URL
browser.tabs.onUpdated.addListener((id, changeInfo, tab) => {
    tabs[id] = tab;
});

browser.webRequest.onBeforeRequest.addListener(
    (details) => {
        console.log('Received web request:', details);

        // Check if the tab exists and its URL is set
        if (tabs[details.tabId] && tabs[details.tabId].url) {
            let requestHost = new URL(details.url).host;
            let tabHost = new URL(tabs[details.tabId].url).host;

            if (requestHost !== tabHost) {
                console.log('Third-party request detected:', details.url);
                thirdPartyUrls.add(details.url);  // Add the detected third-party URL to the Set
            }
        }
    },
    { urls: ['<all_urls>'] },
    ['blocking']
);

browser.webRequest.onHeadersReceived.addListener(
    (details) => {
        // Inspect the headers in the HTTP response
        for (let header of details.responseHeaders) {
            if (header.name.toLowerCase() === 'set-cookie') {
                // Count each 'Set-Cookie' header
                cookiesCount++;
            }
        }
    },
    { urls: ['<all_urls>'] },
    ['responseHeaders']
);

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.method === 'getThirdPartyUrls') {
        sendResponse({data: Array.from(thirdPartyUrls)});
    } else if (request.method === 'getCookiesCount') {
        sendResponse({data: cookiesCount});
    } else {
        sendResponse({data: null});
    }
});


