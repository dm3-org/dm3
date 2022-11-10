import { getDeliveryServiceProperties } from './getDeliveryServiceProperties';
import { writeFileSync, unlinkSync } from 'fs';
import { stringify } from 'yaml';
import { resolve } from 'path';

describe('ReadDeliveryServiceProperties', () => {
    it('Returns default DeliveryServiceProfile if config file is undefined', () => {
        const config = getDeliveryServiceProperties('/unknown-path', {
            messageTTL: 12345,
            sizeLimit: 456,
        });

        expect(config).toStrictEqual({ messageTTL: 12345, sizeLimit: 456 });
    });

    it('Returns Config from path', () => {
        const path = resolve(__dirname, './config.test.yml');

        writeFileSync(
            path,
            stringify({
                messageTTL: 12345,
                sizeLimit: 456,
            }),
            { encoding: 'utf-8' },
        );
        const config = getDeliveryServiceProperties(path);

        expect(config).toStrictEqual({
            messageTTL: 12345,
            sizeLimit: 456,
        });

        unlinkSync(path);
    });
    it('Adds default properties if config.yml is not fully specified', () => {
        const path = resolve(__dirname, './config.test.yml');

        writeFileSync(
            path,
            stringify({
                messageTTL: 12345,
            }),
            { encoding: 'utf-8' },
        );
        const config = getDeliveryServiceProperties(path);

        expect(config).toStrictEqual({
            messageTTL: 12345,
            sizeLimit: 0,
        });

        unlinkSync(path);
    });
});
