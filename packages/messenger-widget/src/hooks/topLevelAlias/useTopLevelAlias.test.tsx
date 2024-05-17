import '@testing-library/jest-dom';
import { useContext, useState } from 'react';
import { DM3Configuration } from '../../widget';
import { act, fireEvent, render } from '@testing-library/react';
import { TLDContext, TLDContextProvider } from '../../context/TLDContext';
import { _useMainnetProvider } from '../mainnetprovider/_useMainnetProvider';
import { MainnetProviderContextProvider } from '../../context/ProviderContext';
import {
    DM3ConfigurationContext,
    DM3ConfigurationContextProvider,
} from '../../context/DM3ConfigurationContext';

const config: DM3Configuration = {
    userEnsSubdomain: process.env.REACT_APP_USER_ENS_SUBDOMAIN as string,
    addressEnsSubdomain: process.env.REACT_APP_ADDR_ENS_SUBDOMAIN as string,
    resolverBackendUrl: process.env.REACT_APP_RESOLVER_BACKEND as string,
    profileBaseUrl: process.env.REACT_APP_PROFILE_BASE_URL as string,
    defaultDeliveryService: process.env
        .REACT_APP_DEFAULT_DELIVERY_SERVICE as string,
    backendUrl: process.env.REACT_APP_BACKEND as string,
    chainId: process.env.REACT_APP_CHAIN_ID as string,
    resolverAddress: process.env.REACT_APP_RESOLVER_ADDR as string,
    defaultServiceUrl: process.env.REACT_APP_DEFAULT_SERVICE as string,
    ethereumProvider: process.env.REACT_APP_MAINNET_PROVIDER_RPC as string,
    walletConnectProjectId: process.env
        .REACT_APP_WALLET_CONNECT_PROJECT_ID as string,
    genomeRegistryAddress: process.env
        .REACT_APP_GENOME_REGISTRY_ADDRESS as string,
    defaultContact: 'defaultcontact.eth',
    showAlways: true,
    showContacts: true,
};

function TestComponent() {
    return (
        <>
            <DM3ConfigurationContextProvider>
                <MainnetProviderContextProvider dm3Configuration={config}>
                    <TLDContextProvider>
                        <TestHook />
                    </TLDContextProvider>
                </MainnetProviderContextProvider>
            </DM3ConfigurationContextProvider>
        </>
    );
}

function TestHook() {
    const [alias, setAlias] = useState<string>('');
    const { resolveAliasToTLD, resolveTLDtoAlias } = useContext(TLDContext);
    const { setDm3Configuration } = useContext(DM3ConfigurationContext);

    const resolveAlias = async () => {
        const data = await resolveAliasToTLD('alice.gnosis.eth');
        setAlias(data);
    };

    const resolveTld = async () => {
        const data = await resolveTLDtoAlias('alice.gno');
        setAlias(data);
    };

    return (
        <>
            {alias}
            <button onClick={() => setDm3Configuration(config)}>
                Configure
            </button>
            <button onClick={async () => await resolveAlias()}>
                Resolve Alias
            </button>
            <button onClick={async () => await resolveTld()}>
                Resolve TLD
            </button>
        </>
    );
}

describe.skip('useTopLevelAlias hook test cases', () => {
    it('Should call resolveAliasToTLD method', async () => {
        const { getByText } = render(<TestComponent />);
        await act(() => fireEvent.click(getByText('Configure')));
        await act(() => fireEvent.click(getByText('Resolve Alias')));
        // waits for 3 seconds to get the alias resolved to TLD
        await act(() => new Promise((resolve) => setTimeout(resolve, 3000)));
        const alias = getByText(`alice.gnosis.eth`);
        expect(alias).toBeInTheDocument;
    });

    it('Should call resolveTLDtoAlias method', async () => {
        const { getByText } = render(<TestComponent />);
        await act(() => fireEvent.click(getByText('Configure')));
        await act(() => fireEvent.click(getByText('Resolve TLD')));
        // waits for 3 seconds to get the TLD resolved to alias
        await act(() => new Promise((resolve) => setTimeout(resolve, 3000)));
        const alias = getByText('alice.gno');
        expect(alias).toBeInTheDocument;
    });
});
