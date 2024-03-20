import { render } from '@testing-library/react';
import DM3 from './DM3';
import '@testing-library/jest-dom';

describe('DM3 test cases', () => {
    const props = {
        config: {
            showContacts: true,
            inline: true,
            defaultStorageLocation: '' as any,
            hideStorageSelection: true,
            style: '' as any,
            defaultServiceUrl: '',
            showAlways: true,
            miniSignIn: true,
            warnBeforeLeave: false,
            browserStorageBackup: false,
            showHelp: false,
            theme: 'dark',
            ethereumProvider: 'goerli',
            walletConnectProjectId: 'dadsa',
        },
        dm3Configuration: {
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
