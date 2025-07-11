document.addEventListener('DOMContentLoaded', () => {
    const setReminderBtn = document.getElementById('setReminderBtn');
    const closeBtn = document.getElementById('closeBtn');
    const remindersList = document.getElementById('remindersList');
    const reminderCountEl = document.getElementById('reminderCount');

    const formatCountdown = (ms) => {
        let totalSeconds = Math.floor(ms / 1000);
        let totalMinutes = Math.floor(totalSeconds / 60);
        let hours = Math.floor(totalMinutes / 60);
        let minutes = totalMinutes % 60;
        const pad = (num) => num.toString().padStart(2, '0');
        return `${pad(hours)}:${pad(minutes)}`;
    };

    const displayReminders = () => {
        chrome.storage.local.get(null, (items) => {
            remindersList.innerHTML = '';
            const sortedKeys = Object.keys(items).sort((a, b) => items[a].time - items[b].time);

            chrome.action.setBadgeText({ text: sortedKeys.length > 0 ? String(sortedKeys.length) : '' });
            chrome.action.setBadgeBackgroundColor({ color: '#d9534f' });

            reminderCountEl.textContent = sortedKeys.length > 0 ? sortedKeys.length : '';

            if (sortedKeys.length === 0) {
                remindersList.innerHTML = '<p>No active reminders.</p>';
                return;
            }

            for (const key of sortedKeys) {
                const reminder = items[key];
                const timeRemaining = reminder.time - Date.now();
                const formattedTime = new Date(reminder.time).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });

                const itemDiv = document.createElement('div');
                itemDiv.className = 'reminder-item';

                let countdownText = formatCountdown(timeRemaining);
                if (timeRemaining < 0) {
                    itemDiv.classList.add('past-due');
                    countdownText = 'PAST DUE';
                }
                
                let ticketLinkHtml = '';
                if (reminder.ticketLink) {
                    ticketLinkHtml = `<a href="${reminder.ticketLink}" target="_blank" class="ticket-link">Ticket</a>`;
                }

                itemDiv.innerHTML = `
                    <div class="reminder-info">
                        <strong>${reminder.cxName}</strong> (${reminder.cxType})
                        <div class="reminder-time-display">Due: ${formattedTime}</div>
                        ${ticketLinkHtml}
                    </div>
                    <div class="reminder-actions">
                        <div class="countdown" id="countdown-${key}">${countdownText}</div>
                        <button class="delete-btn" data-key="${key}" title="Delete Reminder">×</button>
                    </div>
                `;
                remindersList.appendChild(itemDiv);
            }
        });
    };
    
    const updateCountdowns = () => {
        const countdownElements = document.querySelectorAll('.countdown');
        let needsRedraw = false;
        
        chrome.storage.local.get(null, (items) => {
             countdownElements.forEach(el => {
                const key = el.id.split('-')[1];
                if (items[key]) {
                    const timeRemaining = items[key].time - Date.now();
                    if (timeRemaining > 0) {
                        el.textContent = formatCountdown(timeRemaining);
                    } else if (el.textContent !== 'PAST DUE') {
                        needsRedraw = true;
                    }
                } else {
                    needsRedraw = true;
                }
            });

            if (needsRedraw) {
                displayReminders();
            }
        });
    };

    // THIS IS THE FULLY RESTORED FUNCTION
    setReminderBtn.addEventListener('click', () => {
        const cxName = document.getElementById('cxName').value;
        const cxType = document.getElementById('cxType').value;
        const ticketLink = document.getElementById('ticketLink').value;
        const followUpTime = document.getElementById('followUpTime').value;

        if (!cxName || !followUpTime) {
            alert('Please fill in CX Name and Follow-up Time.');
            return;
        }
        
        const reminderTime = new Date(followUpTime).getTime();
        if (reminderTime < Date.now()) {
            alert('Please select a future time for the reminder.');
            return;
        }
        
        const alarmName = 'reminder_' + reminderTime + '_' + cxName;
        const reminderData = {
            id: alarmName,
            cxName: cxName,
            cxType: cxType,
            ticketLink: ticketLink,
            time: reminderTime
        };

        chrome.storage.local.set({ [alarmName]: reminderData }, () => {
            chrome.alarms.create(alarmName, { when: reminderTime });
            displayReminders();
            document.getElementById('cxName').value = '';
            document.getElementById('cxType').value = '';
            document.getElementById('ticketLink').value = '';
            document.getElementById('followUpTime').value = '';
        });
    });

    // THIS IS THE FULLY RESTORED FUNCTION
    remindersList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const key = e.target.dataset.key;
            chrome.storage.local.remove(key, () => {
                chrome.alarms.clear(key, () => {
                    displayReminders();
                });
            });
        }
    });

    // THIS IS THE FULLY RESTORED FUNCTION
    closeBtn.addEventListener('click', () => {
        window.close();
    });

    displayReminders();
    setInterval(updateCountdowns, 1000 * 30);
});