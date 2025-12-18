document.addEventListener('DOMContentLoaded', loadSnippets);

const snippetForm = document.getElementById('snippet-form');
const snippetList = document.getElementById('snippet-list');
const noSnippetsMessage = document.getElementById('no-snippets-message');
const snippetCount = document.getElementById('snippet-count');
const settingsBtn = document.getElementById('settings-btn');

// --- NEW: Elements for toast notifications ---
const messageBox = document.getElementById('message-box');
const messageText = document.getElementById('message-text');
const messageIcon = document.getElementById('message-icon');
const messageActionBtn = document.getElementById('message-action-btn');

const icons = {
    success: `<svg class="w-5 h-5 text-green-700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>`,
    error: `<svg class="w-5 h-5 text-red-700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>`,
    delete: `<svg class="w-5 h-5 text-red-700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd" /></svg>`
};

let messageTimeout;
let undoTimeout;
let lastDeletedSnippet = null;

// --- NEW: Full-featured showMessage function ---
function showMessage(text, type = 'success', action = null) {
    clearTimeout(messageTimeout);
    clearTimeout(undoTimeout);

    messageIcon.innerHTML = icons[type] || icons.success;
    messageText.textContent = text;
    
    messageText.className = 'text-sm font-medium';
    switch (type) {
        case 'success': messageText.classList.add('text-green-700'); break;
        case 'error':
        case 'delete': messageText.classList.add('text-red-700'); break;
        default: messageText.classList.add('text-slate-700');
    }
    
    if (action && action.text && action.callback) {
        messageActionBtn.textContent = action.text;
        messageActionBtn.onclick = () => {
            action.callback();
            hideMessage();
        };
        messageActionBtn.classList.remove('hidden');
    } else {
        messageActionBtn.classList.add('hidden');
    }

    messageBox.classList.remove('hidden', 'fade-out-down');
    messageBox.classList.add('fade-in-up');

    messageTimeout = setTimeout(hideMessage, 4000);
}

function hideMessage() {
    messageBox.classList.remove('fade-in-up');
    messageBox.classList.add('fade-out-down');
}

async function loadSnippets() {
    try {
        const result = await chrome.storage.local.get('snippets');
        renderSnippets(result.snippets || {});
    } catch (error) {
        showMessage('Could not load snippets.', 'error');
    }
}

function renderSnippets(snippets) {
    // This function remains the same
    snippetList.innerHTML = '';
    const shortcuts = Object.keys(snippets).sort();

    if (shortcuts.length === 0) {
        noSnippetsMessage.classList.remove('hidden');
        snippetCount.classList.add('hidden');
    } else {
        noSnippetsMessage.classList.add('hidden');
        snippetCount.textContent = shortcuts.length;
        snippetCount.classList.remove('hidden');

        shortcuts.forEach(shortcut => {
            const expansion = snippets[shortcut];
            const li = document.createElement('li');
            li.className = 'bg-white p-3 rounded-xl shadow-sm flex items-center justify-between space-x-2';
            li.innerHTML = `<div class="flex-1 min-w-0"><span class="font-mono text-sm font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg inline-block">${shortcut}</span><p class="mt-1 text-sm text-slate-600 truncate" title="${expansion}">${expansion}</p></div><div class="flex flex-shrink-0 space-x-2"><button data-shortcut="${shortcut}" title="Edit Snippet" class="edit-btn text-slate-500 bg-slate-100 border border-slate-300 hover:bg-indigo-100 hover:text-indigo-700 transition-all p-2 rounded-full"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg></button><button data-shortcut="${shortcut}" title="Delete Snippet" class="delete-btn text-slate-500 bg-slate-100 border border-slate-300 hover:bg-red-100 hover:text-red-700 transition-all p-2 rounded-full"><svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg></button></div>`;
            snippetList.appendChild(li);
        });
    }
}

// UPDATE: Form submission now uses showMessage
snippetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const shortcutInput = document.getElementById('shortcut');
    const expansionInput = document.getElementById('expansion');
    const shortcut = shortcutInput.value.trim();
    const expansion = expansionInput.value.trim();

    if (shortcut && expansion) {
        const result = await chrome.storage.local.get('snippets');
        const snippets = result.snippets || {};
        
        if (snippets[shortcut]) {
            showMessage(`Shortcut "${shortcut}" already exists.`, 'error');
            return;
        }

        snippets[shortcut] = expansion;
        await chrome.storage.local.set({ snippets: snippets });
        
        showMessage('Snippet saved successfully!', 'success');
        snippetForm.reset();
        shortcutInput.focus();
        loadSnippets();
    }
});

// UPDATE: Click listener now handles Undo logic
snippetList.addEventListener('click', async (e) => {
    const editButton = e.target.closest('.edit-btn');
    if (editButton) {
        chrome.runtime.openOptionsPage();
        return;
    }

    const deleteButton = e.target.closest('.delete-btn');
    if (deleteButton) {
        const shortcutToDelete = deleteButton.getAttribute('data-shortcut');
        const result = await chrome.storage.local.get('snippets');
        const snippets = result.snippets || {};

        // Temporarily store the deleted snippet
        lastDeletedSnippet = { shortcut: shortcutToDelete, expansion: snippets[shortcutToDelete] };

        // Remove from UI immediately
        delete snippets[shortcutToDelete];
        renderSnippets(snippets);

        // Show Undo toast
        showMessage(`Snippet deleted.`, 'delete', {
            text: 'Undo',
            callback: () => {
                clearTimeout(undoTimeout);
                snippets[lastDeletedSnippet.shortcut] = lastDeletedSnippet.expansion;
                renderSnippets(snippets); // Restore UI
                lastDeletedSnippet = null;
            }
        });

        // Set a timeout to permanently delete if not undone
        undoTimeout = setTimeout(async () => {
            if (lastDeletedSnippet) {
                const finalResult = await chrome.storage.local.get('snippets');
                const finalSnippets = finalResult.snippets || {};
                delete finalSnippets[lastDeletedSnippet.shortcut];
                await chrome.storage.local.set({ snippets: finalSnippets });
                lastDeletedSnippet = null;
            }
        }, 4000);
    }
});

settingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
});