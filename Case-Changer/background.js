// Function to execute the content script
function executeContentScript(tab) {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js']
  });
}

// 1. Listen for a click on the extension's icon
chrome.action.onClicked.addListener((tab) => {
  executeContentScript(tab);
});

// 2. Add a context menu item on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "capitalize-text",
    title: "Capitalize This Text",
    contexts: ["editable"] // Only show for editable fields like text boxes
  });
});

// Listen for a click on the context menu item
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "capitalize-text") {
    executeContentScript(tab);
  }
});