export type CommonTab = {
    /** UUID for the tab */
    id: string

    /** Current title of the tab, synced with chrome */
    title: string

    /** Title that user set themself */
    customTitle?: string

    /** **Current** url of the tab, synced with chrome */
    url: string

    /** Favicon url of the tab */
    faviconUrl?: string

    chromeId: number

    /**
     * Just in case we need it for migration purposes
     * Do not use it in extension logic
     * @deprecated
     */
    originalTab: chrome.tabs.Tab
}

export type PinnedTab = CommonTab & {
    isPinned: true

    /** Url that was present when the tab was pinned */
    pinnedUrl: string
}

export type UnpinnedTab = CommonTab & {
    isPinned: false
}

export type Tab = PinnedTab | UnpinnedTab
