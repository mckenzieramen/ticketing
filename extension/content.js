document.addEventListener('keydown', event => {
  if (event.ctrlKey && event.code === 'Space' && !event.altKey && !event.metaKey) {
    event.preventDefault();
    event.stopPropagation();
    chrome.runtime.sendMessage({ type: 'QUICK_STAMP', timestamp: Date.now() });
  }
}, true);
