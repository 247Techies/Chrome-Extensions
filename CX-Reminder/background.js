let reminderWindowId = null;

chrome.action.onClicked.addListener(async () => {
    const windowWidth = 420; 
    const windowHeight = 700;

    try {
        const screenInfo = await chrome.system.display.getInfo();
        const screen = screenInfo[0].workArea;
        const left = Math.round(screen.width - windowWidth - 10);
        const top = Math.round(screen.height - windowHeight - 10);

        if (reminderWindowId !== null) {
            chrome.windows.get(reminderWindowId, {}, (foundWindow) => {
                if (chrome.runtime.lastError) {
                    createWindow(left, top);
                } else {
                    chrome.windows.update(reminderWindowId, { focused: true });
                }
            });
        } else {
            createWindow(left, top);
        }
    } catch (error) {
        console.error("Could not get display info. Opening window in default position.", error);
        createWindow();
    }

    function createWindow(leftPos, topPos) {
        let options = { url: 'popup.html', type: 'popup', width: windowWidth, height: windowHeight };
        if (leftPos !== undefined && topPos !== undefined) {
            options.left = leftPos;
            options.top = topPos;
        }
        chrome.windows.create(options, (win) => { if (win) { reminderWindowId = win.id; } });
    }
});

chrome.windows.onRemoved.addListener((closedWindowId) => {
    if (closedWindowId === reminderWindowId) {
        reminderWindowId = null;
    }
});

async function playSound(file) {
  if (await chrome.offscreen.hasDocument()) {
    chrome.runtime.sendMessage({ type: 'play-sound', file: file });
  } else {
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['AUDIO_PLAYBACK'],
      justification: 'Notification sound for reminders',
    });
    chrome.runtime.sendMessage({ type: 'play-sound', file: file });
  }
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
    const result = await chrome.storage.local.get([alarm.name]);
    const reminder = result[alarm.name];

    if (reminder) {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'images/icon128.png',
            title: 'CX Reminder: ' + reminder.cxName,
            message: `Time for your follow-up with ${reminder.cxName} (${reminder.cxType}).`,
            priority: 2
        });

        await playSound('sound.wav');
    }
});