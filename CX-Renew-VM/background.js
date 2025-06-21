// Listen for when the user clicks the extension's browser action icon
chrome.action.onClicked.addListener((tab) => {
    // Inject the content.js script into the currently active tab
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
  });