import { render } from '@testing-library/react';
import DM3 from './DM3';
import '@testing-library/jest-dom';

describe('DM3 test cases', () => {
    const props = {
        config: {
            defaultContact: '',
            defaultServiceUrl: '',
            ethereumProvider: '',
            walletConnectProjectId: '',
            userEnsSubdomain: '',
            addressEnsSubdomain: '',
            resolverBackendUrl: '',
            profileBaseUrl: '',
            defaultDeliveryService: '',
            backendUrl: '',
            chainId: '',
            resolverAddress: '',
            genomeRegistryAddress: '',
            showAlways: true,
            showContacts: true,
        },
    };

    it('Renders DM3 component', () => {
        const { getByRole } = render(<DM3 {...props} />);
        const element = getByRole('div');
        expect(element).toBeInTheDocument();
    });
});
