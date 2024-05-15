import '../../styles/modal.css';
import './ConfigureProfile.css';
import { useContext, useEffect } from 'react';
import { useChainId } from 'wagmi';
import tickIcon from '../../assets/images/white-tick.svg';
import { AuthContext } from '../../context/AuthContext';
import { useMainnetProvider } from '../../hooks/mainnetprovider/useMainnetProvider';
import {
    dm3NamingServices,
    fetchComponent,
    fetchDM3NameComponent,
    fetchServiceFromChainId,
    getEnsName,
    namingServices,
} from './bl';
import { ConfigureProfileContext } from './context/ConfigureProfileContext';
import { DM3ConfigurationContext } from '../../context/DM3ConfigurationContext';

export function NormalView() {
    const connectedChainId = useChainId();

    const mainnetProvider = useMainnetProvider();

    const { account, ethAddress } = useContext(AuthContext);

    const {
        setEnsName,
        dm3NameServiceSelected,
        setDm3NameServiceSelected,
        namingServiceSelected,
        setNamingServiceSelected,
    } = useContext(ConfigureProfileContext);

    const { dm3Configuration } = useContext(DM3ConfigurationContext);

    // handles ENS name and address
    useEffect(() => {
        getEnsName(
            mainnetProvider,
            ethAddress!,
            account!,
            (name: string) => setEnsName(name),
            dm3Configuration.addressEnsSubdomain,
        );
    }, [ethAddress]);

    useEffect(() => {
        if (connectedChainId) {
            setNamingServiceSelected(fetchServiceFromChainId(connectedChainId));
        }
    }, []);

    return (
        <div className="mt-2">
            {/* Wallet Address */}
            <div className="d-flex pt-2 ps-4">
                <div className="configuration-items-align">
                    {ethAddress && <img src={tickIcon} />}
                </div>

                <div className="profile-config-container">
                    <div className="d-flex">
                        <p
                            className="m-0 
                    font-size-14 font-weight-500 line-height-24 title-content"
                        >
                            Wallet Address
                        </p>
                        <p
                            className="m-0 ms-2
                    font-size-14 font-weight-500 line-height-24 grey-text"
                        >
                            {ethAddress &&
                                ethAddress +
                                dm3Configuration.addressEnsSubdomain}
                        </p>
                    </div>
                    <div className="address-details">
                        <div className="small-text font-weight-300 grey-text">
                            You can use your wallet address as a username. A
                            virtual profile is created and stored at a dm3
                            service. There are no transaction costs for creation
                            and administration.
                        </div>
                        <div className="small-text font-weight-700">
                            You can receive messages sent to your wallet
                            address.
                        </div>
                    </div>
                </div>
            </div>

            {/* DM3 Name */}
            <div className="mt-4 d-flex ps-4 align-items-baseline">
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

            {fetchDM3NameComponent(
                dm3NameServiceSelected,
                dm3Configuration.chainId,
            )}

            {/* ENS Name */}
            <div className="mt-4 d-flex ps-4 align-items-baseline">
                <div className="configuration-items-align"></div>
                <div>
                    <select
                        className="name-service-selector"
                        value={namingServiceSelected}
                        onChange={(e) => {
                            setNamingServiceSelected(e.target.value);
                        }}
                    >
                        {namingServices &&
                            namingServices.map((data, index) => {
                                return (
                                    <option value={data.name} key={index}>
                                        {data.name}
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
