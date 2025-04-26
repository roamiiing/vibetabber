export function deleteFromArrayByReference<T>(array: T[], item: T): T[] {
    const index = array.indexOf(item)
    if (index > -1) array.splice(index, 1)

    return array
}

export function withElement<T>(arrGetter: () => T[]) {
    return (predicate: (elem: T) => boolean, callback: (tab: T) => void) => {
        const elem = arrGetter().find(predicate)
        if (elem) callback(elem)
    }
}

export function withElementAsync<T>(arrGetter: () => T[]) {
    return async (predicate: (elem: T) => boolean, callback: (tab: T) => Promise<void>) => {
        const elem = arrGetter().find(predicate)
        if (elem) await callback(elem)
    }
}
