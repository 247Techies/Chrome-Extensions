let snippetsMap = {};

function loadSnippetsIntoMap() {
    try {
        chrome.storage.sync.get({ snippets: [] }, (data) => {
            if (chrome.runtime.lastError) {
                console.error("Error loading snippets:", chrome.runtime.lastError);
                return;
            }
            snippetsMap = {};
            if (data.snippets) {
                data.snippets.forEach(snippet => {
                    snippetsMap[snippet.code + ' '] = snippet.text;
                });
            }
        });
    } catch (e) {
        console.error("Failed to load snippets:", e);
    }
}

loadSnippetsIntoMap();

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && changes.snippets) {
        loadSnippetsIntoMap();
    }
});

document.addEventListener('input', (e) => {
    const target = e.target;
    const isTextInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
    const isContentEditable = target.isContentEditable;

    // --- Case 1: Standard <input> or <textarea> ---
    if (isTextInput) {
        const text = target.value;
        for (const codeWithSpace in snippetsMap) {
            if (text.endsWith(codeWithSpace)) {
                const snippetText = snippetsMap[codeWithSpace];
                target.value = text.slice(0, -codeWithSpace.length) + snippetText;

                // Use setTimeout to ensure the cursor is set after the browser has processed the value change.
                setTimeout(() => {
                    target.focus();
                    const newCursorPosition = target.value.length;
                    target.setSelectionRange(newCursorPosition, newCursorPosition);
                }, 0);

                target.dispatchEvent(new Event('input', { bubbles: true }));
                target.dispatchEvent(new Event('change', { bubbles: true }));
                return;
            }
        }
    }
    // --- Case 2: ContentEditable elements (e.g., Gmail compose, Notion) ---
    else if (isContentEditable) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const textNode = range.startContainer;
        
        // Ensure we are working with a text node
        if (textNode.nodeType !== Node.TEXT_NODE) return;

        const text = textNode.textContent;
        for (const codeWithSpace in snippetsMap) {
            if (text.endsWith(codeWithSpace)) {
                const snippetText = snippetsMap[codeWithSpace];

                // 1. Delete the typed code
                range.setStart(textNode, text.length - codeWithSpace.length);
                range.setEnd(textNode, text.length);
                range.deleteContents();

                // 2. Insert the snippet text
                const newTextNode = document.createTextNode(snippetText);
                range.insertNode(newTextNode);

                // 3. Move the cursor to the end of the inserted text
                range.setStartAfter(newTextNode);
                range.setEndAfter(newTextNode);
                selection.removeAllRanges(); // Clear old selection
                selection.addRange(range);   // Apply new cursor position

                target.dispatchEvent(new Event('input', { bubbles: true }));
                return;
            }
        }
    }
}, true);