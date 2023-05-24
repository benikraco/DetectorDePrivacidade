// Function to render the list of third-party URLs
const renderContent = (data) => {
  const content = document.getElementById('third-party-urls');
  content.innerHTML = '';

  data.forEach((url) => {
    const listItem = document.createElement('li');
    listItem.textContent = url;
    content.appendChild(listItem);
  });
};

// Function to render the list of Cookies
const renderCookies = (data) => {
  document.getElementById('first-party-cookie-count').innerText = `First-party Cookies: ${data.firstPartyCookies}`;
  document.getElementById('third-party-cookie-count').innerText = `Third-party Cookies: ${data.thirdPartyCookies}`;
  document.getElementById('session-cookie-count').innerText = `Session Cookies: ${data.sessionCookies}`;
  document.getElementById('persistent-cookie-count').innerText = `Persistent Cookies: ${data.persistentCookies}`;

  // Update the total cookie count
  const totalCookies = data.firstPartyCookies + data.thirdPartyCookies;
  document.getElementById('cookie-count').innerText = `Total Cookies: ${totalCookies}`;
};

// Function to render local storage data
const renderLocalStorageData = (data) => {
  document.getElementById('local-storage-count').innerText = `Local Storage Data: ${data}`;
};

// Event listener for the Clear Log button
document.getElementById('clear-logs').addEventListener('click', () => {
  browser.runtime.sendMessage({method: 'clearLogs'});
  document.getElementById('third-party-urls').innerHTML = '';
  document.getElementById('first-party-cookie-count').innerText = 'First-party Cookies: 0';
  document.getElementById('third-party-cookie-count').innerText = 'Third-party Cookies: 0';
  document.getElementById('session-cookie-count').innerText = 'Session Cookies: 0';
  document.getElementById('persistent-cookie-count').innerText = 'Persistent Cookies: 0';
  document.getElementById('cookie-count').innerText = 'Total Cookies: 0';
  document.getElementById('local-storage-count').innerText = 'Local Storage Data: 0';
});

// On page load, get the list of third-party URLs and Cookies
document.addEventListener('DOMContentLoaded', function() {
  browser.tabs.query({active: true, currentWindow: true}).then((tabs) => {
    const currentTab = tabs[0];
    document.getElementById('website').innerText = `Website: ${new URL(currentTab.url).hostname}`;

    browser.runtime.sendMessage({method: 'getThirdPartyUrls'})
      .then((response) => {
        renderContent(response.data);
      });

    browser.runtime.sendMessage({method: 'getCookies'})
      .then((response) => {
        renderCookies(response.data);
      });

    browser.tabs.sendMessage(currentTab.id, {method: 'getLocalStorage'}).then(response => {
      renderLocalStorageData(response.data);
    });
  });
});


