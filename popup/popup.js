document.addEventListener("DOMContentLoaded", function() {
  browser.runtime.sendMessage({method: "getThirdPartyUrls"})
  .then((response) => {
      renderContent(response.data);
  });

  // Get cookies count
  browser.runtime.sendMessage({method: "getCookiesCount"})
  .then((response) => {
      document.getElementById('cookies-count').textContent = 'Cookies: ' + response.data;
  });
});

const renderContent = (data) => {
  const content = document.getElementById('third-party-urls');

  data.forEach((url) => {
      const listItem = document.createElement('li');
      listItem.textContent = url;
      content.appendChild(listItem);
  });
};

document.getElementById('clear-logs').addEventListener('click', () => {
  browser.runtime.sendMessage({method: 'clearThirdPartyUrls'});
  document.getElementById('third-party-urls').innerHTML = '';
});
