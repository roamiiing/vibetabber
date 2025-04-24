import type { StorageLikeAsync } from '@vueuse/core'

function chromeStorageToAsyncStorage(storage: chrome.storage.StorageArea): StorageLikeAsync {
    return {
        async getItem(key: string) {
            const value = await storage.get(key)
            return value[key] || null
        },
        async setItem(key: string, value: string) {
            await storage.set({ [key]: value })
        },
        async removeItem(key: string) {
            await storage.remove(key)
        },
    }
}

export const chromeAsyncLocalStorage = chromeStorageToAsyncStorage(chrome.storage.local)
