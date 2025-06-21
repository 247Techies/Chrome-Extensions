// This function updates the extension icon to show if it's active or inactive.
async function updateIcon(tabId, isActive) {
    const path = isActive 
      ? { "16": "icons/icon-on-16.png", "48": "icons/icon-on-48.png", "128": "icons/icon-on-128.png" } 
      : { "16": "icons/icon-off-16.png", "48": "icons/icon-off-48.png", "128": "icons/icon-off-128.png" };
    const title = isActive ? "Deactivate Quick Paste (Click to turn off)" : "Activate Quick Paste (Click to turn on)";
    
    await chrome.action.setIcon({ tabId: tabId, path: path });
    await chrome.action.setTitle({ tabId: tabId, title: title });
  }
  
  // Listen for when the user clicks the extension icon.
  chrome.action.onClicked.addListener(async (tab) => {
    // Get the current state for this tab from session storage.
    const prevState = await chrome.storage.session.get([`${tab.id}`]);
    const isActive = prevState[`${tab.id}`] ?? false;
  
    // Toggle the state.
    const nextState = !isActive;
    await chrome.storage.session.set({ [`${tab.id}`]: nextState });
    await updateIcon(tab.id, nextState);
    
    if (nextState) {
      // If activating, inject the content script and send a "start" message.
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      // It can take a moment for the script to be ready, so we wait briefly.
      setTimeout(() => {
          chrome.tabs.sendMessage(tab.id, { command: "start" });
      }, 100);
    } else {
      // If deactivating, just send a "stop" message. No reload needed!
      chrome.tabs.sendMessage(tab.id, { command: "stop" });
    }
  });
  
  // Clean up storage when a tab is closed.
  chrome.tabs.onRemoved.addListener((tabId) => {
    chrome.storage.session.remove([`${tabId}`]);
  });
  
  // When a page reloads or navigates, check if it was active and re-apply state.
  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
      const state = await chrome.storage.session.get([`${tabId}`]);
      const isActive = state[`${tabId}`] ?? false;
      updateIcon(tabId, isActive);
      // If it's supposed to be active, reinject and start it.
      if (isActive) {
          await chrome.scripting.executeScript({
              target: { tabId: tabId },
              files: ['content.js']
          });
          setTimeout(() => {
              chrome.tabs.sendMessage(tabId, { command: "start" });
          }, 100);
      }
    }
  });