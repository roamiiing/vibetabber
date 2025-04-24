chrome.runtime.onStartup.addListener(() => {
    chrome.sidePanel.open({
        tabId: tab.id,
    })
})

chrome.action.onClicked.addListener((tab) => {
    chrome.sidePanel.open({
        tabId: tab.id,
    })
})
