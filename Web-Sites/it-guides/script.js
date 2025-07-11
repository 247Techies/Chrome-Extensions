$(document).ready(function() {
    const select = $('#command-select');
    const resultsArea = $('#results-area');
    const ticketDescriptionEl = $('#ticket-description');
    const stepsListEl = $('#steps-list');
    const copyTicketBtn = $('#copy-ticket-btn');
    
    let commandsData = []; // To store the fetched commands

    // Initialize Select2
    select.select2({
        theme: 'bootstrap-5',
        placeholder: 'Search by keyword (e.g., sfc, dns, ip)...',
        allowClear: true,
    });
    
    // Fetch JSON data and populate the dropdown
    fetch('commands.json')
        .then(response => response.json())
        .then(data => {
            commandsData = data;
            // Add a placeholder option first
            select.append(new Option('', ''));
            // Populate dropdown with titles from JSON
            data.forEach(command => {
                const option = new Option(command.title, command.id);
                select.append(option);
            });
        })
        .catch(error => {
            console.error('Error fetching commands:', error);
            Swal.fire('Error', 'Could not load commands data.', 'error');
        });

    // Event handler for when a command is selected
    select.on('change', function() {
        const selectedId = $(this).val();
        if (!selectedId) {
            resultsArea.addClass('d-none'); // Hide results if nothing is selected
            return;
        }

        const command = commandsData.find(c => c.id === selectedId);
        displayCommandDetails(command);
    });

    // Function to display the details of the selected command
    function displayCommandDetails(command) {
        // Populate Ticket Description
        ticketDescriptionEl.text(command.ticket_template);
        // Store the raw text in a data attribute for the copy button
        copyTicketBtn.data('copy-text', command.ticket_template);

        // Populate Steps
        stepsListEl.empty(); // Clear previous steps
        const ol = $('<ol class="list-group list-group-numbered"></ol>');
        command.execution.forEach(exec => {
            const li = $(`<li class="list-group-item">${exec.step}</li>`);
            // If there's a command, create a code block with a copy button
            if (exec.command) {
                const codeBlock = $(`
                    <div class="step-code">
                        <code>${exec.command}</code>
                        <button class="btn btn-sm btn-outline-secondary copy-code-btn" title="Copy Command">
                            <i class="fa-regular fa-copy"></i>
                        </button>
                    </div>
                `);
                // Store the command text in a data attribute on the button
                codeBlock.find('.copy-code-btn').data('copy-text', exec.command);
                li.append(codeBlock);
            }
            ol.append(li);
        });
        stepsListEl.append(ol);
        
        resultsArea.removeClass('d-none'); // Show the results
    }

    // Generic copy function using SweetAlert for feedback
    function copyToClipboard(text, successMessage) {
        navigator.clipboard.writeText(text).then(() => {
            Swal.fire({
                icon: 'success',
                title: successMessage,
                showConfirmButton: false,
                timer: 1500
            });
        }).catch(err => {
            console.error('Failed to copy: ', err);
            Swal.fire('Error', 'Failed to copy text.', 'error');
        });
    }

    // Event listener for the ticket description copy button
    copyTicketBtn.on('click', function() {
        const textToCopy = $(this).data('copy-text');
        const formattedText = `> ${textToCopy} >`;
        copyToClipboard(formattedText, 'Ticket description copied!');
    });

    // Event listener for dynamically created code copy buttons
    $(document).on('click', '.copy-code-btn', function() {
        const textToCopy = $(this).data('copy-text');
        copyToClipboard(textToCopy, 'Command copied!');
    });
});