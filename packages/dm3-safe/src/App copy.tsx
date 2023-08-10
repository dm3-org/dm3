import { useSafeAppsSDK } from '@safe-global/safe-apps-react-sdk';
import React, { useCallback, useEffect, useState } from 'react';
// @ts-ignore
import { DM3 } from 'dm3-react';
import './dm3.css';

declare global {
    interface Window {
        ethereum: any;
    }
}

const SafeApp = (): React.ReactElement => {
    const { sdk, safe } = useSafeAppsSDK();
    sdk.safe.getEnvironmentInfo();
    const [eoa, seteoa] = useState<string | undefined>();

    const submitTx = useCallback(async () => {
        try {
            const { safeTxHash } = await sdk.txs.send({
                txs: [
                    {
                        to: safe.safeAddress,
                        value: '0',
                        data: '0x',
                    },
                ],
            });
            console.log({ safeTxHash });

            const safeTx = await sdk.txs.getBySafeTxHash(safeTxHash);
            console.log({ safeTx });
        } catch (e) {
            console.error(e);
        }
    }, [safe, sdk]);

    useEffect(() => {
        const foo = async () => {
            sdk.safe.getEnvironmentInfo();
            sdk.safe.getInfo();

            const [eoa] = await window.ethereum.request({
                method: 'eth_requestAccounts',
            });

            seteoa(eoa);
            window.ethereum.on('accountsChanged', ([newEoa]: string[]) =>
                seteoa(newEoa),
            );
            window.ethereum.on('accountsChanged', (c: any) => {
                console.log('acccc');
                console.log(c);
            });
        };
        foo();
    }, [sdk.safe]);

    return (
        <DM3
            defaultContacts={['help.dm3.eth']}
            defaultServiceUrl={process.env.REACT_APP_DEFAULT_SERVICE}
            showAlways={true}
        />
    );
};

export default SafeApp;
