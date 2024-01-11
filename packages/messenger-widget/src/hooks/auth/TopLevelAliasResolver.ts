export const TopLevelAliasResolver = () => {
    const resolveDisplayName = async (ensName: string) => {
        //For now we have only .gno. Eventual query TLD registry to resolve alias
        const isGnoName = ensName.endsWith('.alex1234.eth');

        if (isGnoName) {
            return ensName.replace('.alex1234.eth', '.gno');
        }
        return ensName;
    };

    return {
        resolveDisplayName,
    };
};
