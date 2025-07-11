// Listens for a click on the extension's icon in the toolbar.
chrome.action.onClicked.addListener((tab) => {
  // We need to inject both the CSS and the content script into the active tab.
  chrome.scripting.insertCSS({
    target: { tabId: tab.id },
    files: ["style.css"]
  });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content.js"]
  });
});