let firstPartyCookiesDetails = [];
let thirdPartyCookiesDetails = [];
let cookieDetails = [];
let privacyScore = 10;

const calculatePrivacyScore = () => {
  // Deducting 0.1 point for each third-party cookie, local storage data, and third-party url
  privacyScore = 10;
  privacyScore -= thirdPartyCookiesDetails.length * 0.1;
  privacyScore -= localStorageData.length * 0.1;
  privacyScore -= thirdPartyUrls.length * 0.1;

  if (privacyScore < 0) {
    privacyScore = 0;
  }
  
  privacyScore = Math.round(privacyScore * 100) / 100;
  document.getElementById('privacy-score').textContent = `Privacy Score: ${privacyScore}`;
};


const updateCookies = () => {
  browser.runtime.sendMessage({method: 'getCookies'}, response => {
    document.getElementById('cookie-count').textContent = `Total Cookies: ${response.data.firstPartyCookies + response.data.thirdPartyCookies}`;
    document.getElementById('first-party-cookie-count').textContent = `First-Party Cookies: ${response.data.firstPartyCookies}`;
    document.getElementById('third-party-cookie-count').textContent = `Third-Party Cookies: ${response.data.thirdPartyCookies}`;
    document.getElementById('session-cookie-count').textContent = `Session Cookies: ${response.data.sessionCookies}`;
    document.getElementById('persistent-cookie-count').textContent = `Persistent Cookies: ${response.data.persistentCookies}`;
    firstPartyCookiesDetails = response.data.firstPartyCookiesDetails;
    thirdPartyCookiesDetails = response.data.thirdPartyCookiesDetails;
    cookieDetails = response.data.cookieDetails;
  });
};

const updateLocalStorage = () => {
  browser.runtime.sendMessage({method: 'checkLocalStorage'}, response => {
    document.getElementById('local-storage-count').textContent = `Local Storage Data: ${response.data.length}`;
  });
};

const updateThirdPartyUrls = () => {
  browser.runtime.sendMessage({method: 'getThirdPartyUrls'}, response => {
    const ul = document.getElementById('third-party-urls');
    ul.innerHTML = '';
    response.data.forEach(url => {
      let li = document.createElement('li');
      li.textContent = url;
      ul.appendChild(li);
    });
  });
};

const showCookieDetails = (cookies) => {
  const cookieDetailsElement = document.getElementById('cookie-details').querySelector('tbody');
  cookieDetailsElement.innerHTML = '';

  cookies.forEach(cookie => {
    const row = document.createElement('tr');

    const nameCell = document.createElement('td');
    nameCell.textContent = cookie.name;
    row.appendChild(nameCell);

    const domainCell = document.createElement('td');
    domainCell.textContent = cookie.domain;
    row.appendChild(domainCell);

    cookieDetailsElement.appendChild(row);
  });
};



const clearLogs = () => {
  browser.runtime.sendMessage({method: 'clearLogs'});
  document.getElementById('cookie-count').textContent = 'Total Cookies: 0';
  document.getElementById('first-party-cookie-count').textContent = 'First-Party Cookies: 0';
  document.getElementById('third-party-cookie-count').textContent = 'Third-Party Cookies: 0';
  document.getElementById('session-cookie-count').textContent = 'Session Cookies: 0';
  document.getElementById('persistent-cookie-count').textContent = 'Persistent Cookies: 0';
  document.getElementById('local-storage-count').textContent = 'Local Storage Data: 0';
  document.getElementById('third-party-urls').innerHTML = '';
  document.getElementById('first-party-cookie-details').innerHTML = '';
  document.getElementById('third-party-cookie-details').innerHTML = '';
  document.getElementById('cookie-details').querySelector('tbody').innerHTML = '';
  firstPartyCookiesDetails = [];
  thirdPartyCookiesDetails = [];
  cookieDetails = []; 
};

window.addEventListener('DOMContentLoaded', (event) => {
  browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
    document.getElementById('website').textContent = `Website: ${new URL(tabs[0].url).hostname}`;
  });
  
  document.getElementById('first-party-cookie-count').addEventListener('click', () => {
    const firstPartyCookieDetails = cookieDetails.filter(cookie => cookie.firstParty);
    showCookieDetails(firstPartyCookieDetails);
  });
  
  document.getElementById('third-party-cookie-count').addEventListener('click', () => {
    const thirdPartyCookieDetails = cookieDetails.filter(cookie => !cookie.firstParty);
    showCookieDetails(thirdPartyCookieDetails);
  });

  document.getElementById('clear-logs').addEventListener('click', clearLogs);

  updateCookies();
  updateLocalStorage();
  updateThirdPartyUrls();
});

setInterval(() => {
  updateCookies();
  updateLocalStorage();
  updateThirdPartyUrls();
}, 5000);
