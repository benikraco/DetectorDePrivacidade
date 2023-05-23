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
  const content = document.getElementById('cookie-list');
  content.innerHTML = '';

  data.forEach((cookie) => {
    const listItem = document.createElement('li');
    listItem.textContent = `${cookie.name} (Domain: ${cookie.domain}, Session: ${cookie.session ? 'Yes' : 'No'})`;
    content.appendChild(listItem);
  });

  // Update the cookie count
  document.getElementById('cookie-count').innerText = `Total de cookies: ${data.length}`;
};

// Event listener for the Clear Log button
document.getElementById('clear-logs').addEventListener('click', () => {
  document.getElementById('third-party-urls').innerHTML = '';
  document.getElementById('cookie-list').innerHTML = '';
  document.getElementById('cookie-count').innerText = '0 Cookies';
});

// On page load, get the list of third-party URLs and Cookies
document.addEventListener('DOMContentLoaded', function() {
  browser.runtime.sendMessage({method: 'getThirdPartyUrls'})
    .then((response) => {
      renderContent(response.data);
    });

  browser.runtime.sendMessage({method: 'getCookies'})
    .then((response) => {
      renderCookies(response.data);
    });
});
