chrome.runtime.onMessage.addListener(message => {
  if (message?.type !== 'QUICK_STAMP') return;
  chrome.storage.local.set({
    ticketTrackerQuickStamp: {
      timestamp: Number(message.timestamp) || Date.now(),
      nonce: `${Date.now()}-${Math.random()}`
    }
  });
});
