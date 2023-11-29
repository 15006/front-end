
export {}

declare global {
    interface Grouping<K, T> {
        key: K, 
        items: T[] 
    }

    interface Array<T> {
        groupBy<K>(keySelector: (item: T) => K): Grouping<K, T>[];
        sum(keySelector: (item: T) => number): number;
    }
}

Array.prototype.groupBy = function<T, K>(this: Array<T>, keySelector: (item: T) => K)
                : Grouping<K, T>[] {
    const map = this.reduce((prev, item) => {
        const key = keySelector(item);
        if (!prev.has(key)) {
            prev.set(key, {key: key, items: []});
        }
        const group = prev.get(key);
        group.items.push(item);
        return prev;

    }, new Map<K, Grouping<K, T>>());

    return Array.from(map.values());
}   

Array.prototype.sum = function<T>(this: Array<T>, keySelector: (item: T) => number): number {
    return this.reduce((prev, item) => prev + keySelector(item) , 0);
}