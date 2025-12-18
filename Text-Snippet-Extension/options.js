document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('snippet-form');
    const snippetIdInput = document.getElementById('snippet-id');
    const codeInput = document.getElementById('snippet-code');
    const textInput = document.getElementById('snippet-text');
    const snippetsList = document.getElementById('snippets-list');
    const searchInput = document.getElementById('search-input');
    const cancelEditBtn = document.getElementById('cancel-edit');

    // Load existing snippets on page load
    loadSnippets();

    // Form submission handler
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = snippetIdInput.value;
        const code = codeInput.value.trim();
        const text = textInput.value.trim();

        if (!code || !text) return;

        const snippet = { id: id || `snippet_${Date.now()}`, code, text };
        saveSnippet(snippet);
    });
    
    // Cancel edit button
    cancelEditBtn.addEventListener('click', () => {
        resetForm();
    });

    // Search functionality
    searchInput.addEventListener('input', () => {
        loadSnippets(searchInput.value.toLowerCase());
    });

    function saveSnippet(snippet) {
        chrome.storage.sync.get({ snippets: [] }, (data) => {
            const snippets = data.snippets;
            const existingIndex = snippets.findIndex(s => s.id === snippet.id);

            let isEditing = false;
            if (existingIndex > -1) {
                // Editing existing snippet
                snippets[existingIndex] = snippet;
                isEditing = true;
            } else {
                // Adding new snippet
                snippets.push(snippet);
            }

            chrome.storage.sync.set({ snippets }, () => {
                Swal.fire({
                    icon: 'success',
                    title: `Snippet ${isEditing ? 'Updated' : 'Saved'}!`,
                    showConfirmButton: false,
                    timer: 1500
                });
                resetForm();
                loadSnippets();
            });
        });
    }

    function loadSnippets(searchTerm = '') {
        chrome.storage.sync.get({ snippets: [] }, (data) => {
            snippetsList.innerHTML = '';
            const filteredSnippets = data.snippets.filter(
                s => s.code.toLowerCase().includes(searchTerm) || s.text.toLowerCase().includes(searchTerm)
            );

            if (filteredSnippets.length === 0) {
                snippetsList.innerHTML = '<tr><td colspan="3" class="text-center">No snippets found.</td></tr>';
                return;
            }

            filteredSnippets.forEach(snippet => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><code>${escapeHTML(snippet.code)}</code></td>
                    <td>${escapeHTML(snippet.text.substring(0, 80))}${snippet.text.length > 80 ? '...' : ''}</td>
                    <td class="text-end">
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${snippet.id}"><i class="fas fa-edit"></i> Edit</button>
                            <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${snippet.id}"><i class="fas fa-trash"></i> Delete</button>
                        </div>
                    </td>
                `;
                snippetsList.appendChild(tr);
            });
            
            // Add event listeners for edit and delete buttons
            attachActionListeners();
        });
    }

    function attachActionListeners() {
        // Edit button click handler
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                chrome.storage.sync.get({ snippets: [] }, (data) => {
                    const snippetToEdit = data.snippets.find(s => s.id === id);
                    if (snippetToEdit) {
                        snippetIdInput.value = snippetToEdit.id;
                        codeInput.value = snippetToEdit.code;
                        textInput.value = snippetToEdit.text;
                        cancelEditBtn.style.display = 'inline-block';
                        window.scrollTo(0, 0);
                    }
                });
            });
        });

        // Delete button click handler
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                Swal.fire({
                    title: 'Are you sure?',
                    text: "You won't be able to revert this!",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, delete it!'
                }).then((result) => {
                    if (result.isConfirmed) {
                        deleteSnippet(id);
                    }
                });
            });
        });
    }

    function deleteSnippet(id) {
        chrome.storage.sync.get({ snippets: [] }, (data) => {
            const updatedSnippets = data.snippets.filter(s => s.id !== id);
            chrome.storage.sync.set({ snippets: updatedSnippets }, () => {
                Swal.fire(
                    'Deleted!',
                    'Your snippet has been deleted.',
                    'success'
                );
                loadSnippets();
            });
        });
    }
    
    function resetForm() {
        form.reset();
        snippetIdInput.value = '';
        cancelEditBtn.style.display = 'none';
    }

    function escapeHTML(str) {
        const p = document.createElement('p');
        p.appendChild(document.createTextNode(str));
        return p.innerHTML;
    }
});