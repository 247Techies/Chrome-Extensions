// File: content.js
// A content script that runs on every page and handles the text expansion logic.

// A variable to store the shortcuts and their expansions.
let snippets = {};

// Load snippets from local storage when the page loads.
chrome.storage.local.get('snippets', (result) => {
    if (result.snippets) {
        snippets = result.snippets;
    }
});

// Listen for changes in storage and update the snippets object.
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.snippets) {
        snippets = changes.snippets.newValue || {};
    }
});

// Add an input event listener to the entire document.
document.addEventListener('input', (e) => {
    const activeElement = document.activeElement;

    // Check if the user is typing in a contenteditable element or an input/textarea.
    if (activeElement && (activeElement.isContentEditable || activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        let currentText = '';
        if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
            currentText = activeElement.value;
        } else if (activeElement.isContentEditable) {
            currentText = activeElement.innerText;
        }

        // Check for a matching shortcut
        for (const shortcut in snippets) {
            if (currentText.endsWith(shortcut)) {
                const expansion = snippets[shortcut];
                
                // Replace the shortcut with the expansion.
                const newText = currentText.slice(0, currentText.length - shortcut.length) + expansion;
                
                if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
                    activeElement.value = newText;
                } else if (activeElement.isContentEditable) {
                    activeElement.innerText = newText;
                }
                
                // You can add more complex cursor positioning here if needed.
                // For now, it will be at the end of the expanded text.
            }
        }
    }
});
