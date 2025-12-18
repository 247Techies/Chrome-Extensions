// Listen for a click on the browser action icon.
chrome.action.onClicked.addListener(function (tab) {
    // Create a new tab with the options page.
    chrome.tabs.create({ url: 'options.html' });
  });