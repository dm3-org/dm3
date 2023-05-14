const uniqBy = <T>(array: T[], key: keyof T): T[] => {
    const uniqueMap = new Map<T[keyof T], T>();

    for (const item of array) {
        const keyValue = item[key];
        if (!uniqueMap.has(keyValue)) {
            uniqueMap.set(keyValue, item);
        }
    }
    return Array.from(uniqueMap.values());
};

export default uniqBy;
