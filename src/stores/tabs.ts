import { ref, computed, onMounted } from 'vue'
import { defineStore } from 'pinia'
import { useStorageAsync } from '@vueuse/core'
import { chromeAsyncLocalStorage } from '@/utils/storage'

export type Tab = {
    /** UUID for the tab */
    id: string
    isPinned?: boolean
    customTitle?: string

    originalTab: chrome.tabs.Tab
}

async function gatherTabs(): Promise<Tab[]> {
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
    // const pinnedTabs = ref<Tab[]>([])
    // const unpinnedTabs = ref<Tab[]>([])
    const pinnedTabs = useStorageAsync<Tab[]>('pinnedTabs', [], chromeAsyncLocalStorage)
    const unpinnedTabs = useStorageAsync<Tab[]>('unpinnedTabs', [], chromeAsyncLocalStorage)

    const tabs = computed(() => [...pinnedTabs.value, ...unpinnedTabs.value])

    function mutateTabByOriginalId(originalTabId: number, callback: (tab: Tab) => void) {
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
