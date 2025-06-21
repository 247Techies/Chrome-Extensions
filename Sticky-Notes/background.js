// Create a context menu item
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "addStickyNote",
    title: "Add/Show Sticky Note",
    contexts: ["page"],
  });
});

// Listener for when the context menu item is clicked
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "addStickyNote") {
    
    // --- START OF THE FIX ---
    
    // We send the message with a callback function.
    // This function will be executed after the message is sent.
    chrome.tabs.sendMessage(tab.id, { action: "toggleNote" }, (response) => {
      // chrome.runtime.lastError will be set if something went wrong.
      // In our case, it's set if the content script isn't on the page.
      if (chrome.runtime.lastError) {
        // This is an expected error on restricted pages, so we can just
        // log a message for debugging or simply ignore it.
        console.log("Sticky Notes: Content script not found, this is expected on chrome:// pages.");
      }
    });

    // --- END OF THE FIX ---
  }
});