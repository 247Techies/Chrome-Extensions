// This script runs in the offscreen document.

chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'play-sound') {
      const audio = new Audio(msg.file);
      audio.play();
    }
  });