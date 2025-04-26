import { useStorageAsync, watchOnce } from '@vueuse/core'
import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'

import { chromeTabToCustomTab, pinnedTabToUnpinnedTab, unpinnedTabToPinnedTab } from '@/mappers/tabs'
import type { PinnedTab, Tab, UnpinnedTab } from '@/models/tab'
import { deleteFromArrayByReference, withElement, withElementAsync } from '@/utils/arrays'
import { swapObjectProperties } from '@/utils/objects'
import { LockableChromeAsyncStorage } from '@/utils/storage'

type StoredTabs = {
    pinned: PinnedTab[]
    unpinned: UnpinnedTab[]
}

// TODO: URL might be different. Tested in chrome and chromium
const NEWTAB_URL = 'chrome://newtab/'

export const useTabsStore = defineStore('tabs', () => {
    let isRestoringTab = false

    // NOTE: When chrome is closed it fires tabs.onRemoved events first, then windows.onRemoved
    // so we cannot distinguish between closing chrome and closing a tab. Because of this all writes to
    // `lockableChromeAsyncStorage` are **deferred by 1 second** (though in-memory data is always up-to-date)
    const lockableChromeAsyncStorage = new LockableChromeAsyncStorage(chrome.storage.local)
    const storedTabs = useStorageAsync<StoredTabs>('storedTabs', { pinned: [], unpinned: [] }, lockableChromeAsyncStorage)

    const pinnedTabs = computed(() => storedTabs.value.pinned)
    const unpinnedTabs = computed(() => storedTabs.value.unpinned)
    const tabs = computed<Tab[]>(() => [...pinnedTabs.value, ...unpinnedTabs.value])

    // TODO: overall performance of this might be better if we index more things maybe
    // (chromeIdToTab, idToTab, etc.)
    const tabsChromeIds = computed(() => new Set(tabs.value.map(tab => tab.chromeId)))
    const activeTabId = ref<string>()

    const withTab = withElement(() => tabs.value)
    const withTabAsync = withElementAsync(() => tabs.value)

    async function restoreTabs() {
        const chromeTabs = await chrome.tabs.query({})

        const activeChromeTab = chromeTabs.find(chromeTab => chromeTab.active)

        const lastUnpinnedTab = unpinnedTabs.value.at(-1)
        if (activeChromeTab?.url === NEWTAB_URL && lastUnpinnedTab?.url === NEWTAB_URL) deleteFromArrayByReference(unpinnedTabs.value, lastUnpinnedTab)

        unpinnedTabs.value.push(...chromeTabs.map(chromeTab => chromeTabToCustomTab(chromeTab)).filter(tab => !tabsChromeIds.value.has(tab.chromeId)))

        if (activeChromeTab)
            withTab(
                tab => tab.chromeId === activeChromeTab.id,
                tab => (activeTabId.value = tab.id),
            )
    }

    async function createNewTab() {
        await chrome.tabs.create({})
    }

    async function activateTab(tabId: string) {
        await withTabAsync(
            tab => tab.id === tabId,
            async tab => {
                try {
                    await chrome.tabs.update(tab.chromeId, { active: true })
                } catch {
                    // TODO: extension api throws error when tab is not present
                    // might be better to check tab existence explicitly
                    isRestoringTab = true
                    const createdChromeTab = await chrome.tabs.create({ url: tab.isPinned ? tab.pinnedUrl : tab.url })
                    swapObjectProperties(tab, chromeTabToCustomTab(createdChromeTab, tab))
                }

                activeTabId.value = tab.id
            },
        )
    }

    async function removeTab(tabId: string) {
        await withTabAsync(
            tab => tab.id === tabId,
            async tab => {
                deleteFromArrayByReference(tab.isPinned ? pinnedTabs.value : unpinnedTabs.value, tab)
                await chrome.tabs.remove(tab.chromeId)
            },
        )
    }

    function changePinState(tabId: string) {
        withTab(
            tab => tab.id === tabId,
            tab => {
                if (tab.isPinned) {
                    deleteFromArrayByReference(pinnedTabs.value, tab)
                    unpinnedTabs.value.push(pinnedTabToUnpinnedTab(tab))
                } else {
                    deleteFromArrayByReference(unpinnedTabs.value, tab)
                    pinnedTabs.value.push(unpinnedTabToPinnedTab(tab))
                }
            },
        )
    }

    // to prevent data race, load tabs from storage first
    watchOnce(storedTabs, restoreTabs, { immediate: false })

    chrome.tabs.onCreated.addListener(tab => {
        if (isRestoringTab) return (isRestoringTab = false)
        unpinnedTabs.value.push(chromeTabToCustomTab(tab))
    })

    chrome.tabs.onActivated.addListener(activeInfo => {
        withTab(
            tab => tab.chromeId === activeInfo.tabId,
            tab => (activeTabId.value = tab.id),
        )
    })

    chrome.tabs.onRemoved.addListener(tabId => {
        withTab(
            tab => tab.chromeId === tabId,
            tab => deleteFromArrayByReference(tab.isPinned ? pinnedTabs.value : unpinnedTabs.value, tab),
        )
    })

    chrome.tabs.onUpdated.addListener((tabId, _changeInfo, chromeTab) => {
        withTab(
            tab => tab.chromeId === tabId,
            tab => swapObjectProperties(tab, chromeTabToCustomTab(chromeTab, tab)),
        )
    })

    return {
        unpinnedTabs: readonly(unpinnedTabs),
        pinnedTabs: readonly(pinnedTabs),
        tabs: readonly(tabs),
        activeTabId: readonly(activeTabId),
        createNewTab,
        activateTab,
        removeTab,
        changePinState,
    }
})
