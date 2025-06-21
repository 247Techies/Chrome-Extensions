// --- No changes to the first few functions ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => { if (request.action === "toggleNote") { handleNoteToggle(); } });
function handleNoteToggle() { const key = getStorageKey(); chrome.storage.local.get(key, (data) => { const noteData = data[key]; if (noteData) { if (document.getElementById("sticky-note")) { document.getElementById("sticky-note").style.zIndex = 99999; } else { createNote(noteData.x, noteData.y, noteData.content); noteData.visible = true; chrome.storage.local.set({ [key]: noteData }); } } else { createNote(); } }); }

function createNote(x, y, content = "") {
  const note = document.createElement("div");
  note.id = "sticky-note";

  if (x && y) { note.style.left = x; note.style.top = y; } 
  else { note.style.right = "20px"; note.style.top = "20px"; }

  // --- Header Creation (Unchanged) ---
  const header = document.createElement("div"); header.id = "sticky-note-header";
  const leftContent = document.createElement("div"); leftContent.id = "header-left-content";
  const logo = document.createElement("img"); logo.id = "sticky-note-logo"; logo.src = chrome.runtime.getURL("images/logo.png");
  const title = document.createElement("span"); title.id = "sticky-note-title"; title.textContent = "My Notes";
  leftContent.appendChild(logo); leftContent.appendChild(title);
  const controls = document.createElement("div"); controls.id = "sticky-note-controls";
  const closeBtn = document.createElement("button"); closeBtn.id = "close-note-btn"; closeBtn.textContent = "–"; closeBtn.title = "Close Note"; closeBtn.onclick = closeNote;
  const deleteBtn = document.createElement("button"); deleteBtn.id = "delete-note-btn"; deleteBtn.textContent = "✖"; deleteBtn.title = "Delete Note Permanently"; deleteBtn.onclick = deleteNote;
  controls.appendChild(closeBtn); controls.appendChild(deleteBtn);
  header.appendChild(leftContent); header.appendChild(controls);

  // --- Text Area (Unchanged) ---
  const textarea = document.createElement("textarea");
  textarea.id = "sticky-note-textarea";
  textarea.placeholder = "Write your note here...";
  textarea.value = content;
  textarea.oninput = saveNote;

  // --- NEW: Footer Creation ---
  const footer = document.createElement("div");
  footer.id = "sticky-note-footer";
  const infoBtn = document.createElement("button");
  infoBtn.id = "info-btn";
  infoBtn.textContent = "i";
  infoBtn.title = "About this extension";
  infoBtn.onclick = showInfoModal;
  footer.appendChild(infoBtn);
  // --- End of Footer Creation ---

  note.appendChild(header);
  note.appendChild(textarea);
  note.appendChild(footer); // Add the footer to the note
  document.body.appendChild(note);
  
  // Create the modal in the DOM if it doesn't exist
  createInfoModal();

  makeDraggable(note, header);
  saveNote();
}

// --- NEW: Functions to create and control the info modal ---

function createInfoModal() {
  // Only create the modal once
  if (document.getElementById("info-modal-overlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "info-modal-overlay";
  overlay.onclick = hideInfoModal; // Hide modal if overlay is clicked

  const contentBox = document.createElement("div");
  contentBox.id = "info-modal-content";
  contentBox.onclick = (e) => e.stopPropagation(); // Prevent clicks inside from closing it

  const closeBtn = document.createElement("button");
  closeBtn.id = "info-modal-close-btn";
  closeBtn.innerHTML = "×"; // "x" symbol
  closeBtn.onclick = hideInfoModal;

  const title = document.createElement("h2");
  title.textContent = "Web Page Sticky Notes";

  const creator = document.createElement("p");
  creator.innerHTML = "Created with ❤️ by <strong>Aiden</strong> aka <i>Arafath. ft. 247-Techies</i>";

  const details = document.createElement("p");
  details.textContent = "This is an internal tool to help our team keep track of notes on any webpage. Your notes are saved locally in your browser for each specific URL.";

  contentBox.appendChild(closeBtn);
  contentBox.appendChild(title);
  contentBox.appendChild(creator);
  contentBox.appendChild(details);
  overlay.appendChild(contentBox);
  document.body.appendChild(overlay);
}

function showInfoModal() {
  const modal = document.getElementById("info-modal-overlay");
  if (modal) {
    modal.style.display = "flex";
  }
}

function hideInfoModal() {
  const modal = document.getElementById("info-modal-overlay");
  if (modal) {
    modal.style.display = "none";
  }
}

// --- No changes to the remaining functions ---
function saveNote() { const noteElement = document.getElementById("sticky-note"), textarea = document.getElementById("sticky-note-textarea"); if (!noteElement || !textarea) return; const noteData = { content: textarea.value, x: noteElement.style.left, y: noteElement.style.top, visible: true }; chrome.storage.local.set({ [getStorageKey()]: noteData }); }
function closeNote() { const noteElement = document.getElementById("sticky-note"); if (noteElement) { noteElement.remove(); } const key = getStorageKey(); chrome.storage.local.get(key, (data) => { const noteData = data[key]; if (noteData) { noteData.visible = false; chrome.storage.local.set({ [key]: noteData }); } }); }
function deleteNote() { if (confirm("Are you sure you want to permanently delete this note?")) { const noteElement = document.getElementById("sticky-note"); if (noteElement) { noteElement.remove(); } chrome.storage.local.remove(getStorageKey()); } }
function makeDraggable(element, header) { let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0; header.onmousedown = dragMouseDown; function dragMouseDown(e) { if (getComputedStyle(element).right) { element.style.left = element.offsetLeft + 'px'; element.style.right = ''; } e.preventDefault(); pos3 = e.clientX; pos4 = e.clientY; document.onmouseup = closeDragElement; document.onmousemove = elementDrag; } function elementDrag(e) { e.preventDefault(); pos1 = pos3 - e.clientX; pos2 = pos4 - e.clientY; pos3 = e.clientX; pos4 = e.clientY; element.style.top = (element.offsetTop - pos2) + "px"; element.style.left = (element.offsetLeft - pos1) + "px"; } function closeDragElement() { document.onmouseup = null; document.onmousemove = null; saveNote(); } }
function getStorageKey() { return `sticky-note_${location.href}`; }
function loadNoteOnStart() { const key = getStorageKey(); chrome.storage.local.get(key, (data) => { const noteData = data[key]; if (noteData && noteData.visible) { createNote(noteData.x, noteData.y, noteData.content); } }); }
loadNoteOnStart();