import { SubdomainManager } from './SubdomainManager';
import { expect } from 'chai';

describe('SubdomainManager', () => {
    it('reds subdomain from env', () => {
        process.env = {
            ...process.env,
            ADDR_ENS_SUBDOMAINS: JSON.stringify(['dm3.eth', 'foo.eth']),
        };
        const subdomainManager = new SubdomainManager('ADDR_ENS_SUBDOMAINS');

        console.log(subdomainManager.isSubdomainSupported('foo.dm3.eth'));
        expect(subdomainManager.isSubdomainSupported('alice.dm3.eth')).to.equal(
            true,
        );
        expect(subdomainManager.isSubdomainSupported('alice.foo.eth')).to.equal(
            true,
        );
        expect(
            subdomainManager.isSubdomainSupported('alice.rando.eth'),
        ).to.equal(false);
    });
});
