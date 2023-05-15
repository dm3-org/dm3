const uniqBy = <T>(array: T[], key: keyof T): T[] => {
    const uniqueMap = new Map<T[keyof T], T>();

    for (const item of array) {
        const keyValue = item[key];
        if (!uniqueMap.has(keyValue)) {
            uniqueMap.set(keyValue, item);
        } else {
            // eslint-disable-next-line no-console
            console.warn('skipping duplicate key for:', keyValue);
        }
    }
    return Array.from(uniqueMap.values());
};

export default uniqBy;
