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
  document.getElementById('first-party-cookie-count').innerText = `Cookies de Primeira Parte: ${data.firstPartyCookies}`;
  document.getElementById('third-party-cookie-count').innerText = `Cookies de Terceira Parte: ${data.thirdPartyCookies}`;
  document.getElementById('session-cookie-count').innerText = `Cookies de Sessão: ${data.sessionCookies}`;
  document.getElementById('persistent-cookie-count').innerText = `Cookies Persistentes: ${data.persistentCookies}`;

  // Update the total cookie count
  const totalCookies = data.firstPartyCookies + data.thirdPartyCookies;
  document.getElementById('cookie-count').innerText = `Total de Cookies: ${totalCookies}`;
};

// Function to render local storage data
const renderLocalStorageData = (data) => {
  document.getElementById('local-storage-count').innerText = `Dados em Local Storage: ${data}`;
};

// Event listener for the Clear Log button
document.getElementById('clear-logs').addEventListener('click', () => {
  browser.runtime.sendMessage({method: 'clearLogs'});
  document.getElementById('third-party-urls').innerHTML = '';
  document.getElementById('first-party-cookie-count').innerText = 'Cookies de Primeira Parte: 0';
  document.getElementById('third-party-cookie-count').innerText = 'Cookies de Terceira Parte: 0';
  document.getElementById('session-cookie-count').innerText = 'Cookies de Sessão: 0';
  document.getElementById('persistent-cookie-count').innerText = 'Cookies Persistentes: 0';
  document.getElementById('cookie-count').innerText = 'Total de Cookies: 0';
  document.getElementById('local-storage-count').innerText = 'Dados em Local Storage: 0';
});

// On page load, get the list of third-party URLs and Cookies
document.addEventListener('DOMContentLoaded', function() {
  browser.runtime.sendMessage({method: 'getThirdPartyUrls'})
    .then((response) => {
      renderContent(response.data);
    });

  browser.runtime.sendMessage({method: 'getCookies'})
    .then((response) => {
      console.log('*********************** COOKIE DATA START ***********************');
      console.log('Received cookie data: ', response.data);
      console.log('*********************** COOKIE DATA END *************************');
      renderCookies(response.data);
    });

  browser.tabs.query({active: true, currentWindow: true}).then((tabs) => {
    browser.tabs.sendMessage(tabs[0].id, {method: 'getLocalStorage'}).then(response => {
      renderLocalStorageData(response.data);
    });
  });
});