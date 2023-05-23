let tabs = {};
let thirdPartyUrls = new Set();  // Create a new Set to store the third-party URLs

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

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.method === 'getThirdPartyUrls') {
        sendResponse({data: Array.from(thirdPartyUrls)});
    } else if (request.method === 'clearThirdPartyUrls') {
        thirdPartyUrls.clear();
    } else {
        sendResponse({data: null});
    }
});


