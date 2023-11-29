export const deepCloneArray = (array: any[]) => {
    const clone = [];
    array.forEach(val => clone.push(Object.assign({}, val)));
    return clone;
}