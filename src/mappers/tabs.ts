import type { CommonTab, PinnedTab, Tab, UnpinnedTab } from '@/models/tab'

export function chromeTabToCustomTab(chromeTab: chrome.tabs.Tab, previousTab: PinnedTab): PinnedTab
export function chromeTabToCustomTab(chromeTab: chrome.tabs.Tab, previousTab?: UnpinnedTab): UnpinnedTab
export function chromeTabToCustomTab(chromeTab: chrome.tabs.Tab, previousTab?: Tab): Tab
export function chromeTabToCustomTab(chromeTab: chrome.tabs.Tab, previousTab?: Tab): Tab {
    const commonTab: CommonTab = {
        id: previousTab?.id ?? window.crypto.randomUUID(),
        title: chromeTab.title as string,
        customTitle: previousTab?.customTitle,
        chromeId: chromeTab.id as number,
        url: chromeTab.url as string,
        faviconUrl: chromeTab.favIconUrl,
        originalTab: chromeTab,
    }

    if (previousTab?.isPinned)
        return {
            ...commonTab,
            isPinned: true,
            pinnedUrl: previousTab.pinnedUrl,
        }

    return {
        ...commonTab,
        isPinned: false,
    }
}

export function unpinnedTabToPinnedTab(unpinnedTab: UnpinnedTab): PinnedTab {
    return {
        ...unpinnedTab,
        isPinned: true,
        pinnedUrl: unpinnedTab.url,
    }
}

export function pinnedTabToUnpinnedTab(pinnedTab: PinnedTab): UnpinnedTab {
    return {
        ...pinnedTab,
        isPinned: false,
    }
}
