import '@testing-library/jest-dom';
import { DM3Configuration } from '../../widget';
import { useDm3Configuration } from './useDM3Configuration';
import { SiweValidityStatus } from '../../utils/enum-type-utils';
import { renderHook, waitFor, act } from '@testing-library/react';

const config: DM3Configuration = {
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
    showAlways: true,
    showContacts: true,
    publicVapidKey: '',
    nonce: '',
};

describe('useDM3Configuration hook test cases', () => {
    it('Should initialize the useDM3Configuration hook', () => {
        const { result } = renderHook(() => useDm3Configuration());
        const { dm3Configuration, screenWidth, siweValidityStatus } =
            result.current;
        expect(dm3Configuration).toStrictEqual(config);
        expect(siweValidityStatus).toBe(SiweValidityStatus.TO_BE_INITIATED);
        expect(screenWidth).toBeGreaterThan(0);
    });

    it('Should set screen width property', async () => {
        const { result } = renderHook(() => useDm3Configuration());
        const { setScreenWidth, screenWidth } = result.current;
        expect(screenWidth).toBe(1024);
        await act(async () => setScreenWidth(800));
        await waitFor(() => {
            const { screenWidth } = result.current;
            expect(screenWidth).toBe(800);
        });
    });

    it('Should update dm3 config property', async () => {
        const { result } = renderHook(() => useDm3Configuration());
        const { dm3Configuration, setDm3Configuration } = result.current;
        expect(dm3Configuration).toStrictEqual(config);
        dm3Configuration.defaultContact = 'bob.eth';
        await act(async () => setDm3Configuration(dm3Configuration));
        await waitFor(() => {
            const { dm3Configuration } = result.current;
            expect(dm3Configuration.defaultContact).toBe('bob.eth');
        });
    });

    it('Should update SIWE validaty status property', async () => {
        const { result } = renderHook(() => useDm3Configuration());
        const { setSiweValidityStatus, siweValidityStatus } = result.current;
        expect(siweValidityStatus).toStrictEqual(
            SiweValidityStatus.TO_BE_INITIATED,
        );
        await act(async () => setSiweValidityStatus(SiweValidityStatus.ERROR));
        await waitFor(() => {
            const { siweValidityStatus } = result.current;
            expect(siweValidityStatus).toBe(SiweValidityStatus.ERROR);
        });
    });
});
