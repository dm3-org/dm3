import { EncryptionEnvelop, Envelop } from '../messaging/Messaging';
import { Connection } from '../web3-provider/Web3Provider';
import { ethBalanceFilter, EthBalanceFilterSettings } from './EthBalanceFilter';
import { nonceFilter, NonceFilterSettings } from './NonceFilter';

export enum Filter {
    NonceFilter,
    EthBalanceFilter,
}

type FilterSettings = {
    [Filter.NonceFilter]: NonceFilterSettings;
    [Filter.EthBalanceFilter]: EthBalanceFilterSettings;
};

type SettingsMap<M extends { [index: string]: any }> = {
    [Key in keyof M]: {
        filter: Key;
        settings: M[Key];
    };
};

export type FilterFunction =
    SettingsMap<FilterSettings>[keyof SettingsMap<FilterSettings>];

function getFilter(filter: Filter) {
    switch (filter) {
        case Filter.NonceFilter:
            return (
                envelop: Envelop | EncryptionEnvelop,
                settings: NonceFilterSettings,
                connection: Connection,
            ): Promise<boolean> =>
                nonceFilter(
                    envelop,
                    settings,
                    connection.provider!.getTransactionCount,
                );
        case Filter.EthBalanceFilter:
            return (
                envelop: Envelop | EncryptionEnvelop,
                settings: EthBalanceFilterSettings,
                connection: Connection,
            ): Promise<boolean> =>
                ethBalanceFilter(
                    envelop,
                    settings,
                    connection.provider!.getBalance,
                );

        default:
            throw Error('Unknown filter');
    }
}

export async function filter(
    filters: FilterFunction[],
    envelops: (Envelop | EncryptionEnvelop)[],
    connection: Connection,
): Promise<(Envelop | EncryptionEnvelop)[]> {
    if (!connection.provider) {
        throw Error('No provider');
    }

    const filterResults = await Promise.all(
        envelops.map(async (envelop) => ({
            result: (
                await Promise.all(
                    filters.map((filterContainer) =>
                        getFilter(filterContainer.filter)(
                            envelop,
                            filterContainer.settings as any,
                            connection,
                        ),
                    ),
                )
            ).reduce((prev, current) => prev && current, true),
            envelop,
        })),
    );

    return filterResults
        .filter((filterResult) => filterResult.result)
        .map((filterResult) => filterResult.envelop);
}
