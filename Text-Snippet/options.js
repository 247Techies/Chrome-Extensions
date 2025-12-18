document.addEventListener('DOMContentLoaded', () => {
    loadSnippets();
    // Add event listener for the search input
    document.getElementById('search-input').addEventListener('input', filterAndRenderSnippets);
});

// --- Get all required elements from the DOM ---
const snippetForm = document.getElementById('snippet-form');
const snippetList = document.getElementById('snippet-list');
const noSnippetsMessage = document.getElementById('no-snippets-message');
const snippetCount = document.getElementById('snippet-count');
const shortcutInput = document.getElementById('shortcut');
const expansionInput = document.getElementById('expansion');
const formContainer = document.getElementById('form-container');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const searchInput = document.getElementById('search-input');

// --- Elements for toast notifications ---
const messageBox = document.getElementById('message-box');
const messageText = document.getElementById('message-text');
const messageIcon = document.getElementById('message-icon');
const messageActionBtn = document.getElementById('message-action-btn');

// --- Icons and state variables ---
let allSnippets = {}; // Cache for the full list of snippets
let messageTimeout, undoTimeout, lastDeletedSnippet, editingShortcut = null;

const icons = {
    success: `<svg class="w-5 h-5 text-green-700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>`,
    error: `<svg class="w-5 h-5 text-red-700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>`,
    delete: `<svg class="w-5 h-5 text-red-700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd" /></svg>`
};
const addIcon = `<svg class="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" /></svg><span>Add Snippet</span>`;
const updateIcon = `<svg class="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg><span>Update Snippet</span>`;


// --- Reusable Functions ---

function showMessage(text, type = 'success', action = null) { /* ... (same as before) ... */ }
function hideMessage() { /* ... (same as before) ... */ }
function setAddMode() { /* ... (same as before) ... */ }
function setEditMode(shortcut, expansion) { /* ... (same as before) ... */ }

// CHANGE: This function now just handles the rendering part
function renderSnippets(snippets) {
    snippetList.innerHTML = ''; 
    const shortcuts = Object.keys(snippets).sort();

    if (shortcuts.length === 0) {
        noSnippetsMessage.classList.remove('hidden');
        snippetList.classList.add('hidden');
        snippetCount.classList.add('hidden');
        // If searching yields no results, update the message
        if (searchInput.value) {
            noSnippetsMessage.querySelector('p.font-semibold').textContent = 'No snippets found';
            noSnippetsMessage.querySelector('p.text-xs').textContent = 'Try a different search term.';
        } else {
            noSnippetsMessage.querySelector('p.font-semibold').textContent = 'No snippets yet';
            noSnippetsMessage.querySelector('p.text-xs').textContent = 'Use the form above to create your first one!';
        }
    } else {
        noSnippetsMessage.classList.add('hidden');
        snippetList.classList.remove('hidden');
        snippetCount.textContent = shortcuts.length;
        snippetCount.classList.remove('hidden');

        shortcuts.forEach(shortcut => {
            const expansion = snippets[shortcut];
            const li = document.createElement('li');
            li.className = 'bg-white p-3 rounded-xl shadow-sm flex items-center justify-between space-x-2';
            li.innerHTML = `<div class="flex-1 min-w-0"><span class="font-mono text-sm font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg inline-block">${shortcut}</span><p class="mt-1 text-sm text-slate-600 truncate" title="${expansion}">${expansion}</p></div><div class="flex flex-shrink-0 space-x-2"><button data-shortcut="${shortcut}" data-expansion="${expansion}" title="Edit Snippet" class="edit-btn text-slate-500 bg-slate-100 border border-slate-300 hover:bg-indigo-100 hover:text-indigo-700 transition-all p-2 rounded-full"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg></button><button data-shortcut="${shortcut}" title="Delete Snippet" class="delete-btn text-slate-500 bg-slate-100 border border-slate-300 hover:bg-red-100 hover:text-red-700 transition-all p-2 rounded-full"><svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg></button></div>`;
            snippetList.appendChild(li);
        });
    }
}

// NEW: Function to filter snippets based on search input
function filterAndRenderSnippets() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (!searchTerm) {
        renderSnippets(allSnippets);
        return;
    }

    const filteredSnippets = {};
    for (const shortcut in allSnippets) {
        const expansion = allSnippets[shortcut];
        if (shortcut.toLowerCase().includes(searchTerm) || expansion.toLowerCase().includes(searchTerm)) {
            filteredSnippets[shortcut] = allSnippets[shortcut];
        }
    }
    renderSnippets(filteredSnippets);
}

// UPDATE: loadSnippets now populates the cache and calls the filter function
async function loadSnippets() {
    try {
        const result = await chrome.storage.local.get('snippets');
        allSnippets = result.snippets || {};
        filterAndRenderSnippets(); // Render based on current search term
        setAddMode();
    } catch (error) {
        showMessage('Could not load snippets.', 'error');
    }
}


// --- Event Listeners ---

snippetForm.addEventListener('submit', async (e) => { /* ... (same as before, but ensure it calls loadSnippets() at the end) ... */ });
cancelBtn.addEventListener('click', setAddMode);
snippetList.addEventListener('click', async (e) => { /* ... (same as before, but ensure it calls loadSnippets() at the end) ... */ });


// PASTE THE FULL FUNCTIONS AGAIN TO BE SAFE
// (The logic inside these functions is copied from the previous step,
// but it's important that they call loadSnippets() after any change
// to update the `allSnippets` cache and re-apply the filter.)

function showMessage(text, type = 'success', action = null) {
    clearTimeout(messageTimeout); clearTimeout(undoTimeout);
    messageIcon.innerHTML = icons[type] || icons.success; messageText.textContent = text;
    messageText.className = 'text-sm font-medium';
    switch (type) {
        case 'success': messageText.classList.add('text-green-700'); break;
        case 'error': case 'delete': messageText.classList.add('text-red-700'); break;
        default: messageText.classList.add('text-slate-700');
    }
    if (action && action.text && action.callback) {
        messageActionBtn.textContent = action.text;
        messageActionBtn.onclick = () => { action.callback(); hideMessage(); };
        messageActionBtn.classList.remove('hidden');
    } else { messageActionBtn.classList.add('hidden'); }
    messageBox.classList.remove('hidden', 'fade-out-down'); messageBox.classList.add('fade-in-up');
    messageTimeout = setTimeout(hideMessage, 4000);
}
function hideMessage() { messageBox.classList.remove('fade-in-up'); messageBox.classList.add('fade-out-down'); }
function setAddMode() {
    editingShortcut = null; snippetForm.reset(); shortcutInput.readOnly = false;
    formTitle.textContent = 'Create New Snippet'; submitBtn.innerHTML = addIcon;
    cancelBtn.classList.add('hidden'); formContainer.classList.remove('bg-indigo-50');
    shortcutInput.focus();
}
function setEditMode(shortcut, expansion) {
    editingShortcut = shortcut; shortcutInput.value = shortcut; expansionInput.value = expansion;
    shortcutInput.readOnly = true; formTitle.textContent = `Editing: ${shortcut}`;
    submitBtn.innerHTML = updateIcon; cancelBtn.classList.remove('hidden');
    formContainer.classList.add('bg-indigo-50'); expansionInput.focus();
    formContainer.scrollIntoView({ behavior: 'smooth', block: 'end' });
}
snippetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const shortcut = shortcutInput.value.trim(); const expansion = expansionInput.value.trim();
    if (!shortcut || !expansion) return;
    const result = await chrome.storage.local.get('snippets'); const snippets = result.snippets || {};
    if (editingShortcut) {
        if (shortcut !== editingShortcut) { delete snippets[editingShortcut]; }
        snippets[shortcut] = expansion; showMessage(`Snippet "${shortcut}" updated!`, 'success');
    } else {
        if (snippets[shortcut]) { showMessage(`Shortcut "${shortcut}" already exists.`, 'error'); return; }
        snippets[shortcut] = expansion; showMessage('Snippet saved successfully!', 'success');
    }
    await chrome.storage.local.set({ snippets: snippets }); loadSnippets();
});
snippetList.addEventListener('click', async (e) => {
    const editButton = e.target.closest('.edit-btn');
    if (editButton) { setEditMode(editButton.dataset.shortcut, editButton.dataset.expansion); return; }
    const deleteButton = e.target.closest('.delete-btn');
    if (deleteButton) {
        const shortcutToDelete = deleteButton.dataset.shortcut;
        let result = await chrome.storage.local.get('snippets'); let snippets = result.snippets || {};
        lastDeletedSnippet = { shortcut: shortcutToDelete, expansion: snippets[shortcutToDelete] };
        delete snippets[shortcutToDelete]; await chrome.storage.local.set({ snippets: snippets });
        showMessage(`Snippet deleted.`, 'delete', {
            text: 'Undo',
            callback: async () => {
                clearTimeout(undoTimeout);
                const currentResult = await chrome.storage.local.get('snippets');
                const currentSnippets = currentResult.snippets || {};
                currentSnippets[lastDeletedSnippet.shortcut] = lastDeletedSnippet.expansion;
                await chrome.storage.local.set({ snippets: currentSnippets });
                loadSnippets();
                lastDeletedSnippet = null;
            }
        });
        undoTimeout = setTimeout(() => { lastDeletedSnippet = null; }, 4000);
        loadSnippets();
    }
});