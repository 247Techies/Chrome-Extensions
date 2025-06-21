// --- Globals ---
let noteElement = null;
const NOTE_ID = 'my-extension-sticky-note-container';

// --- Functions ---

/**
 * Creates and displays the sticky note on the page.
 * @param {string} initialText - The text to load into the note initially.
 */
function createNote(initialText = '') {
  // If note already exists, do nothing.
  if (document.getElementById(NOTE_ID)) {
    return;
  }

  noteElement = document.createElement('div');
  noteElement.id = NOTE_ID;
  noteElement.innerHTML = `
    <div class="sticky-note-header">
      <span>My Sticky Note</span>
      <button id="sticky-note-close-btn">×</button>
    </div>
    <textarea id="sticky-note-textarea" placeholder="Your notes here..."></textarea>
    <div id="sticky-note-status"></div>
  `;

  document.body.appendChild(noteElement);
  const textarea = document.getElementById('sticky-note-textarea');
  textarea.value = initialText;

  // Add event listeners
  document.getElementById('sticky-note-close-btn').addEventListener('click', closeNote);
  textarea.addEventListener('input', handleInput);
}

/**
 * Closes the note and removes it from the DOM.
 */
function closeNote() {
  if (noteElement) {
    noteElement.remove();
    noteElement = null; // Reset the global variable
  }
}

/**
 * Saves the note content automatically after a delay.
 */
let saveTimeout;
function handleInput(event) {
  const statusDiv = document.getElementById('sticky-note-status');
  statusDiv.textContent = 'Saving...';

  // Debounce saving to avoid too many writes
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    const noteText = event.target.value;
    const url = window.location.href;
    chrome.storage.local.set({ [url]: noteText }, () => {
      statusDiv.textContent = 'Saved!';
      setTimeout(() => { statusDiv.textContent = ''; }, 2000);
    });
  }, 500); // Save after 500ms of inactivity
}


/**
 * Loads a note from storage for the current URL if one exists.
 */
function loadNote() {
    const url = window.location.href;
    chrome.storage.local.get([url], (result) => {
        if (result[url]) {
            createNote(result[url]);
        }
    });
}

// --- Event Listeners ---

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggle_note") {
    if (document.getElementById(NOTE_ID)) {
      closeNote();
    } else {
      // Create a new note or load existing content
      const url = window.location.href;
      chrome.storage.local.get([url], (result) => {
          createNote(result[url] || '');
      });
    }
  }
});

// Automatically load the note when the page loads
loadNote();