document.addEventListener('DOMContentLoaded', () => {
  const btnReopen = document.getElementById('btn-reopen');

  btnReopen.onclick = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'REOPEN_ARCADE' });
        }
      });
    }
  };
});
