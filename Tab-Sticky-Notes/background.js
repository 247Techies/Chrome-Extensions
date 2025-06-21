// Create the context menu item when the extension is installed.
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "add-sticky-note",
      title: "Add/Show Sticky Note",
      contexts: ["page"]
    });
  });
  
  // Listen for a click on the context menu item.
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "add-sticky-note") {
      // Send a message to the content script in the active tab.
      chrome.tabs.sendMessage(tab.id, { action: "toggle_note" });
    }
  });