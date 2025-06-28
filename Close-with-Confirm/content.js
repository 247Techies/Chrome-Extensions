(() => {
  // Use an IIFE to not pollute the global scope
  
  // Listen for messages from the background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "SHOW_MODAL") {
      showModal(message.data);
    }
  });

  async function showModal(summary) {
    // Check if modal already exists to prevent duplicates
    if (document.getElementById('safe-close-modal')) {
      return;
    }
      
    // Fetch the modal HTML template from the extension's files
    const modalURL = chrome.runtime.getURL('modal.html');
    const response = await fetch(modalURL);
    const modalHTML = await response.text();

    // Insert the modal HTML into the page's body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Populate the summary details
    const detailsContainer = document.getElementById('sc-summary-details');
    detailsContainer.innerHTML = `
      <ul>
        <li><b>Open Windows:</b> ${summary.windowCount}</li>
        <li><b>Total Tabs:</b> ${summary.tabCount}</li>
        <li><b>Current Tab:</b> ${escapeHTML(summary.activeTabTitle)}</li>
      </ul>
    `;

    // Add event listeners for the buttons
    document.getElementById('sc-confirm-btn').addEventListener('click', handleConfirm);
    document.getElementById('sc-cancel-btn').addEventListener('click', closeModal);
  }

  function handleConfirm() {
    // Send a message to the background script to perform the close action
    chrome.runtime.sendMessage({ action: "closeAllTabs" });
    // We don't need to close the modal here, as the whole tab will close.
  }

  function closeModal() {
    const modal = document.getElementById('safe-close-modal');
    const backdrop = document.getElementById('safe-close-backdrop');
    if (modal) modal.remove();
    if (backdrop) backdrop.remove();
  }

  // Helper to prevent HTML injection from tab titles
  function escapeHTML(str) {
      const p = document.createElement('p');
      p.appendChild(document.createTextNode(str));
      return p.innerHTML;
  }
})();