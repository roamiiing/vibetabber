import { ref, computed, onMounted } from 'vue'
import { defineStore } from 'pinia'

export type Tab = {
    /** UUID for the tab */
    id: string
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
    const tabs = ref<Tab[]>([])

    function mutateTabByOriginalId(originalTabId: number, callback: (tab: Tab) => void) {
        const tabIndex = tabs.value.findIndex((tab) => tab.originalTab.id === originalTabId)
        if (tabIndex === -1) {
            return
        }
        callback(tabs.value[tabIndex])
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

    onMounted(() => {
        gatherTabs().then((newTabs) => {
            tabs.value = newTabs
            const activeTab = tabs.value.find((tab) => tab.originalTab.active)
            if (activeTab) {
                activeTabId.value = activeTab.id
            }
        })

        chrome.tabs.onCreated.addListener((tab) => {
            tabs.value.push({
                id: window.crypto.randomUUID(),
                originalTab: tab,
            })
        })

        chrome.tabs.onRemoved.addListener((tabId) => {
            const tabIndex = tabs.value.findIndex((tab) => tab.originalTab.id === tabId)
            if (tabIndex === -1) {
                return
            }
            tabs.value.splice(tabIndex, 1)
        })

        chrome.tabs.onUpdated.addListener((tabId, changeInfo, originalTab) => {
            mutateTabByOriginalId(tabId, (tab) => {
                tab.originalTab = originalTab
            })
        })

        chrome.tabs.onActivated.addListener((activeInfo) => {
            const tab = tabs.value.find((tab) => tab.originalTab.id === activeInfo.tabId)
            if (!tab) {
                return
            }
            activeTabId.value = tab.id
        })
    })

    return { tabs, activeTabId, activateTab, removeTab, newTab }
})
