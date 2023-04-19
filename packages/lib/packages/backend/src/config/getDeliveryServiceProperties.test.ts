import { getDeliveryServiceProperties } from './getDeliveryServiceProperties';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { stringify } from 'yaml';
import { resolve } from 'path';

describe('ReadDeliveryServiceProperties', () => {
    let path: string;
    beforeEach(() => {
        path = resolve(__dirname, './config.test.yml');
    });

    afterEach(() => {
        if (existsSync(path)) {
            unlinkSync(path);
        }
    });

    it('Returns default DeliveryServiceProfile if config file is undefined', () => {
        const config = getDeliveryServiceProperties('/unknown-path', {
            messageTTL: 12345,
            sizeLimit: 456,
        });

        expect(config).toStrictEqual({ messageTTL: 12345, sizeLimit: 456 });
    });

    it('Returns Config from path', () => {
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
    });
    it('Adds default properties if config.yml is not fully specified', () => {
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
            sizeLimit: 100000,
        });
    });
});
