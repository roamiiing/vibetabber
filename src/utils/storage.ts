import { type StorageLikeAsync } from '@vueuse/core'

export class ChromeAsyncStorage implements StorageLikeAsync {
    constructor(private readonly _area: chrome.storage.LocalStorageArea) {}

    async getItem(key: string) {
        const value = await this._area.get(key)
        return value[key] || null
    }

    async setItem(key: string, value: string) {
        await this._area.set({ [key]: value })
    }

    async removeItem(key: string) {
        await this._area.remove(key)
    }
}

export class LockableChromeAsyncStorage extends ChromeAsyncStorage {
    private _isLocked = false

    constructor(
        area: chrome.storage.LocalStorageArea,
        private readonly _timeout = 1000,
    ) {
        super(area)
    }

    private async _executeLocked() {
        if (this._isLocked) return
        await new Promise(res => setTimeout(res, this._timeout))
        if (this._isLocked) return
    }

    lock() {
        this._isLocked = true
    }

    async setItem(key: string, value: string) {
        await this._executeLocked()
        await super.setItem(key, value)
    }

    async removeItem(key: string) {
        await this._executeLocked()
        await super.removeItem(key)
    }
}
