chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({ url: "https://feedback2.247techies.tech/service_requests/search" });
});