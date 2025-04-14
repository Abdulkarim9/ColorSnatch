// background.js - Service worker for ColorSnatch extension

// Add context menu for quick access
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "snatch-color",
    title: "Snatch color",
    contexts: ["page"]
  });
});

// Listen for extension icon clicks
chrome.action.onClicked.addListener((tab) => {
  activateColorSnatch(tab);
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "snatch-color") {
    activateColorSnatch(tab);
  }
});

// Listen for keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  if (command === "activate-color-snatch") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        activateColorSnatch(tabs[0]);
      }
    });
  }
});

// Function to activate color snatch on active tab
function activateColorSnatch(tab) {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js']
  });
} 