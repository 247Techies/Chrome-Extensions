// A safety check to ensure this script's listeners are only attached once.
if (!window.quickPasteListenerAttached) {
    window.quickPasteListenerAttached = true;
  
    let pollingIntervalId = null;
    let lastClipboardContent = '';
  
    function setNativeValue(element, value) {
      const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
      const prototype = Object.getPrototypeOf(element);
      const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
  
      if (valueSetter && valueSetter !== prototypeValueSetter) {
        prototypeValueSetter.call(element, value);
      } else {
        valueSetter.call(element, value);
      }
      
      element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
      element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    }
  
    const performPasteAndEnter = (text) => {
      let targetElement = document.activeElement;
      if (!targetElement || !['INPUT', 'TEXTAREA'].includes(targetElement.tagName) || targetElement.disabled || targetElement.type === 'hidden') {
          targetElement = document.querySelector('input:not([type="hidden"]):not([disabled]), textarea:not([disabled])');
      }
      
      if (targetElement) {
        console.log('[Quick Paste] Found target element:', targetElement);
        targetElement.focus();
  
        console.log('[Quick Paste] Setting value via native setter.');
        setNativeValue(targetElement, text);
  
        // A tiny delay can sometimes help the framework process the input event before the keydown event.
        setTimeout(() => {
          console.log('[Quick Paste] Simulating Enter key press.');
          targetElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));
        }, 50); // 50ms delay
  
      } else {
        console.log('[Quick Paste] No available input field found on the page.');
      }
    };
  
    const checkClipboard = async () => {
      if (!document.hasFocus()) return;
      try {
        const clipboardText = await navigator.clipboard.readText();
        
        if (clipboardText && clipboardText !== lastClipboardContent) {
          // --- THE DEFINITIVE FIX IS HERE ---
          // Stop polling IMMEDIATELY to prevent any race conditions.
          console.log('[Quick Paste] New content detected. Stopping polling BEFORE pasting.');
          stopPolling(); 
          // ------------------------------------
  
          lastClipboardContent = clipboardText;
          performPasteAndEnter(clipboardText);
        }
      } catch (err) {
        // This error block will now likely never be hit for TypeErrors,
        // but we leave it for actual permission issues.
        console.error('[Quick Paste] Error reading clipboard, likely a permission issue.', err.name);
        stopPolling();
      }
    };
  
    const startPolling = () => {
      if (pollingIntervalId) return;
      console.log('[Quick Paste] Starting clipboard polling.');
      navigator.clipboard.readText().then(text => { lastClipboardContent = text; });
      pollingIntervalId = setInterval(checkClipboard, 500); 
    };
  
    const stopPolling = () => {
      if (!pollingIntervalId) return; // Already stopped
      console.log('[Quick Paste] Stopping clipboard polling.');
      clearInterval(pollingIntervalId);
      pollingIntervalId = null;
    };
  
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.command === "start") {
        startPolling();
        sendResponse({ status: "started" });
      } else if (request.command === "stop") {
        stopPolling();
        sendResponse({ status: "stopped" });
      }
    });
  }