/**
 * Deletes all keys in original object and copies keys of new object
 * Useful when dealing with reactive arrays
 */
export function swapObjectProperties<T extends {}>(obj: T, newObj: T): T {
    for (const key in obj) {
        delete obj[key]
    }

    Object.assign(obj, newObj)

    return obj
}
