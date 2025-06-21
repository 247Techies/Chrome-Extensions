// This function will be executed when the user clicks the extension's icon.
function unlockTextareas(tab) {
    // The CSS we want to inject into the page.
    // We use 'both !important' to ensure our style overrides the page's original styles.
    const css = 'textarea { resize: both !important; }';
  
    // Use the Scripting API to inject the CSS into the current tab.
    chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      css: css
    }, () => {
      // Optional: Log a message to the service worker's console to confirm execution.
      // You can view this by going to chrome://extensions, finding your extension,
      // and clicking the "Service Worker" link.
      console.log("Textarea fields unlocked!");
    });
  }
  
  // Add a listener for when the user clicks on the extension's action icon.
  chrome.action.onClicked.addListener(unlockTextareas);