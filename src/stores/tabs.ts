import { ref, computed, onMounted } from 'vue'
import { defineStore } from 'pinia'
import { useStorageAsync } from '@vueuse/core'
import { chromeAsyncLocalStorage } from '@/utils/storage'

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

function chromeTabToCustomTab(chromeTab: chrome.tabs.Tab, previousTab?: Tab): Tab {
    const commonTab: CommonTab = {
        id: previousTab?.id ?? window.crypto.randomUUID(),
        chromeId: chromeTab.id as number,
        url: chromeTab.url as string,
        faviconUrl: chromeTab.favIconUrl,
    }
}

async function gatherTabs(): Promise<CommonTab[]> {
    const tabs = await chrome.tabs.query({})

    return tabs.map((tab) => {
        return {
            id: window.crypto.randomUUID(),
            originalTab: tab,
        }
    })
}

export const useTabsStore = defineStore('tabs', () => {
    const activeTabId = ref<string>()
    const pinnedTabs = useStorageAsync<PinnedTab[]>('pinnedTabs', [], chromeAsyncLocalStorage)
    const unpinnedTabs = useStorageAsync<UnpinnedTab[]>('unpinnedTabs', [], chromeAsyncLocalStorage)

    const tabs = computed(() => [...pinnedTabs.value, ...unpinnedTabs.value])

    function mutateTabByOriginalId(originalTabId: number, callback: (tab: CommonTab) => void) {
        const tab = tabs.value.find((tab) => tab.originalTab.id === originalTabId)
        if (tab) callback(tab)
    }

    function activateTab(tabId: string) {
        chrome.tabs.update(tabs.value.find((tab) => tab.id === tabId)!.originalTab.id!, { active: true })
    }

    function removeTab(tabId: string) {
        chrome.tabs.remove(tabs.value.find((tab) => tab.id === tabId)!.originalTab.id!)
    }

    function newTab() {
        chrome.tabs.create({})
    }

    function changePinState(tabId: string) {
        const tab = tabs.value.find((tab) => tab.id === tabId)
        if (!tab) return

        if (tab.isPinned) {
            pinnedTabs.value = pinnedTabs.value.filter((tab) => tab.id !== tabId)
            unpinnedTabs.value.push(tab)
        } else {
            unpinnedTabs.value = unpinnedTabs.value.filter((tab) => tab.id !== tabId)
            pinnedTabs.value.push(tab)
        }

        tab.isPinned = !tab.isPinned
    }

    onMounted(() => {
        gatherTabs().then((newTabs) => {
            unpinnedTabs.value = newTabs
            const activeTab = unpinnedTabs.value.find((tab) => tab.originalTab.active)
            if (activeTab) {
                activeTabId.value = activeTab.id
            }
        })

        chrome.tabs.onCreated.addListener((tab) => {
            unpinnedTabs.value.push({
                id: window.crypto.randomUUID(),
                originalTab: tab,
            })
        })

        chrome.tabs.onRemoved.addListener((tabId) => {
            const tab = tabs.value.find((tab) => tab.originalTab.id === tabId)
            if (!tab) return

            if (tab.isPinned) {
                pinnedTabs.value = pinnedTabs.value.filter((tab) => tab.originalTab.id !== tabId)
            } else {
                unpinnedTabs.value = unpinnedTabs.value.filter((tab) => tab.originalTab.id !== tabId)
            }
        })

        chrome.tabs.onUpdated.addListener((tabId, changeInfo, originalTab) => {
            mutateTabByOriginalId(tabId, (tab) => {
                tab.originalTab = originalTab
            })
        })

        chrome.tabs.onActivated.addListener((activeInfo) => {
            const tab = tabs.value.find((tab) => tab.originalTab.id === activeInfo.tabId)
            if (!tab) return (activeTabId.value = undefined)
            activeTabId.value = tab.id
        })
    })

    return { tabs, unpinnedTabs, pinnedTabs, activeTabId, activateTab, removeTab, newTab, changePinState }
})
