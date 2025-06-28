// Listen for the user clicking the extension's icon
chrome.action.onClicked.addListener(async (tab) => {
  // First, get all windows to count them and their tabs
  const windows = await chrome.windows.getAll({ populate: true });
  const windowCount = windows.length;
  let tabCount = 0;
  windows.forEach(window => {
    if (window.tabs) {
      tabCount += window.tabs.length;
    }
  });

  // Prepare the summary data
  const summaryData = {
    windowCount: windowCount,
    tabCount: tabCount,
    activeTabTitle: tab.title || 'N/A'
  };

  // Inject the CSS file into the active tab
  await chrome.scripting.insertCSS({
    target: { tabId: tab.id },
    files: ["modal.css"],
  });

  // Inject the content script into the active tab
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content.js"],
  });
  
  // Send a message to the content script with the summary data
  chrome.tabs.sendMessage(tab.id, {
    type: "SHOW_MODAL",
    data: summaryData
  });
});

// Listen for a message from the content script to close the windows
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "closeAllTabs") {
    chrome.windows.getAll({}, (windows) => {
      windows.forEach((window) => {
        chrome.windows.remove(window.id);
      });
    });
  }
});