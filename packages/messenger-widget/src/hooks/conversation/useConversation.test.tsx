import '@testing-library/jest-dom';
import { DM3Configuration } from '../../widget';
import { useConversation } from './useConversation';
import { act, renderHook, waitFor } from '@testing-library/react';

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

describe('useConversation hook test cases', () => {
    const CONTACT_NAME = 'user.dm3.eth';

    it('Should configure useConversation hook', async () => {
        const { result } = renderHook(() => useConversation(config));
        expect(result.current.contacts.length).toBe(0);
        expect(result.current.conversationCount).toBe(0);
        expect(result.current.initialized).toBe(false);
        expect(result.current.selectedContact).toBe(undefined);
    });

    it('Should add a new contact', async () => {
        const { result } = renderHook(() => useConversation(config));
        const newContact = await act(async () =>
            result.current.addConversation(CONTACT_NAME),
        );
        expect(newContact.name).toBe(CONTACT_NAME);
        await waitFor(() => expect(result.current.contacts.length).toBe(1));
    });

    it('Should add multiple contacts', async () => {
        const { result } = renderHook(() => useConversation(config));
        await act(async () => result.current.addConversation('bob.eth'));
        await act(async () => result.current.addConversation('liza.eth'));
        await act(async () => result.current.addConversation('heroku.eth'));
        await act(async () => result.current.addConversation('samar.eth'));
        await waitFor(() => expect(result.current.contacts.length).toBe(4));
    });

    it('Should select a contact', async () => {
        const { result } = renderHook(() => useConversation(config));
        await act(async () => result.current.addConversation(CONTACT_NAME));
        expect(result.current.selectedContact).toBe(undefined);
        await act(async () =>
            result.current.setSelectedContactName(CONTACT_NAME),
        );
        await waitFor(() => {
            const { selectedContact } = result.current;
            expect(selectedContact?.contactDetails.account.ensName).toBe(
                CONTACT_NAME,
            );
        });
    });

    it('Should unselect a contact', async () => {
        const { result } = renderHook(() => useConversation(config));
        await act(async () => result.current.addConversation(CONTACT_NAME));
        await act(async () =>
            result.current.setSelectedContactName(CONTACT_NAME),
        );
        await waitFor(() => {
            const { selectedContact } = result.current;
            expect(selectedContact?.contactDetails.account.ensName).toBe(
                CONTACT_NAME,
            );
        });
        await act(async () => result.current.setSelectedContactName(undefined));
        await waitFor(() =>
            expect(result.current.selectedContact).toBe(undefined),
        );
    });

    it('Should hide a contact', async () => {
        const { result } = renderHook(() => useConversation(config));
        await act(async () => result.current.addConversation(CONTACT_NAME));
        await waitFor(() =>
            expect(result.current.contacts[0].isHidden).toBe(false),
        );
        await act(async () => result.current.hideContact(CONTACT_NAME));
        await waitFor(() =>
            expect(result.current.contacts[0].isHidden).toBe(true),
        );
    });

    it('Should unhide a contact', async () => {
        const { result } = renderHook(() => useConversation(config));
        await act(async () => result.current.addConversation(CONTACT_NAME));
        await act(async () => result.current.hideContact(CONTACT_NAME));
        await waitFor(() =>
            expect(result.current.contacts[0].isHidden).toBe(true),
        );
        await act(async () =>
            result.current.unhideContact(result.current.contacts[0]),
        );
        await waitFor(() =>
            expect(result.current.contacts[0].isHidden).toBe(false),
        );
    });
});
