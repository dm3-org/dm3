import { parse } from 'yaml';
import { existsSync, readFileSync } from 'fs';
import * as Lib from 'dm3-lib/dist.backend';

const DEFAULT_CONFIG_FILE_PATH = '';

const DEFAULT_DELIVERY_SERVICE_PROPERTIES: Lib.delivery.DeliveryServiceProperties =
    {
        messageTTL: 0,
        sizeLimit: 0,
    };

export function readDeliveryServiceProperties(
    path: string = DEFAULT_CONFIG_FILE_PATH,
    defaultDeliveryServiceProperties: Lib.delivery.DeliveryServiceProperties = DEFAULT_DELIVERY_SERVICE_PROPERTIES,
): Lib.delivery.DeliveryServiceProperties {
    if (!existsSync(path)) {
        Lib.log('Config file not found. Default Config is used');
        return defaultDeliveryServiceProperties;
    }
    const yamlString = readFileSync(path, { encoding: 'utf-8' });

    const { messageTTL, sizeLimit } = parse(yamlString);

    return { messageTTL, sizeLimit };
}
