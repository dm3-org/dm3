import { SpamFilter } from '..';
import { DeliveryInformation } from '../../messaging';

export interface NonceFilterSettings {
    nonceHigherOrEqualThan: number;
}

export async function _nonceFilter(
    from: string,
    settings: NonceFilterSettings,
    getNonce: (address: string) => Promise<number>,
): Promise<boolean> {
    return (await getNonce(from)) >= settings.nonceHigherOrEqualThan;
}
export function nonceFilter(
    getNonce: (address: string) => Promise<number>,
    settings: NonceFilterSettings,
): SpamFilter {
    const filter = async ({ from }: DeliveryInformation) => {
        return (await getNonce(from)) >= settings.nonceHigherOrEqualThan;
    };

    return { filter };
}
