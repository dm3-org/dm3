import '../../styles/modal.css';
import './ConfigureProfile.css';
import { switchNetwork } from '@wagmi/core';
import { useContext, useEffect, useState } from 'react';
import { useChainId } from 'wagmi';
import { AuthContext } from '../../context/AuthContext';
import { useMainnetProvider } from '../../hooks/mainnetprovider/useMainnetProvider';
import {
    dm3NamingServices,
    fetchChainIdFromServiceName,
    fetchComponent,
    fetchDM3NameComponent,
    fetchServiceFromChainId,
    getEnsName,
    namingServices,
} from './bl';
import { ConfigureProfileContext } from './context/ConfigureProfileContext';
import { DM3ConfigurationContext } from '../../context/DM3ConfigurationContext';

export function MobileView() {
    const connectedChainId = useChainId();

    const mainnetProvider = useMainnetProvider();

    const { account, ethAddress } = useContext(AuthContext);

    const { setEnsName } = useContext(ConfigureProfileContext);

    const { dm3Configuration } = useContext(DM3ConfigurationContext);

    // ENS Name service selected
    const [namingServiceSelected, setNamingServiceSelected] = useState<string>(
        namingServices[0].name,
    );

    // DM3 Name service selected
    const [dm3NameServiceSelected, setDm3NameServiceSelected] =
        useState<string>(dm3NamingServices[0].name);

    // changes network on naming service change
    const changeNetwork = (serviceName: string) => {
        const chainId = fetchChainIdFromServiceName(
            serviceName,
            dm3Configuration.chainId,
        );
        if (chainId && chainId !== connectedChainId) {
            switchNetwork({ chainId });
        }
    };

    // handles ENS name and address
    useEffect(() => {
        getEnsName(mainnetProvider, ethAddress!, account!, (name: string) =>
            setEnsName(name),
        );
    }, [ethAddress]);

    useEffect(() => {
        if (connectedChainId) {
            setNamingServiceSelected(fetchServiceFromChainId(connectedChainId));
        }
    }, []);

    return (
        <div>
            {/* DM3 Name */}
            <div className="mt-3 d-flex ps-2 align-items-baseline">
                <div className="configuration-items-align"></div>
                <div>
                    <select
                        className="name-service-selector"
                        value={dm3NameServiceSelected}
                        onChange={(e) => {
                            setDm3NameServiceSelected(e.target.value);
                        }}
                    >
                        {dm3NamingServices &&
                            dm3NamingServices.map((data, index) => {
                                return (
                                    <option value={data.name} key={index}>
                                        {data.name}
                                    </option>
                                );
                            })}
                    </select>
                </div>
            </div>

            {fetchDM3NameComponent(dm3NameServiceSelected)}

            {/* ENS Name */}
            <div className="mt-3 d-flex ps-2 align-items-baseline">
                <div className="configuration-items-align"></div>
                <div>
                    <select
                        className="name-service-selector"
                        value={namingServiceSelected}
                        onChange={(e) => {
                            setNamingServiceSelected(e.target.value);
                            changeNetwork(e.target.value);
                        }}
                    >
                        {namingServices &&
                            namingServices.map((data, index) => {
                                return (
                                    <option value={data.name} key={index}>
                                        {data.name.split('- ')[1]}
                                    </option>
                                );
                            })}
                    </select>
                </div>
            </div>

            {fetchComponent(namingServiceSelected, dm3Configuration.chainId)}
        </div>
    );
}
