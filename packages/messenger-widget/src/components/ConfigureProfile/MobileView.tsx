import '../../styles/modal.css';
import './ConfigureProfile.css';
import { useContext, useEffect } from 'react';
import { useChainId } from 'wagmi';
import { AuthContext } from '../../context/AuthContext';
import { useMainnetProvider } from '../../hooks/mainnetprovider/useMainnetProvider';
import {
    BUTTON_CLASS,
    dm3NamingServices,
    fetchComponent,
    fetchDM3NameComponent,
    fetchServiceFromChainId,
    getEnsName,
    namingServices,
} from './bl';
import { ConfigureProfileContext } from './context/ConfigureProfileContext';
import { DM3ConfigurationContext } from '../../context/DM3ConfigurationContext';
import { ModalContext } from '../../context/ModalContext';

export function MobileView() {
    const connectedChainId = useChainId();

    const mainnetProvider = useMainnetProvider();

    const { account, ethAddress } = useContext(AuthContext);

    const { configureProfileModal, setConfigureProfileModal } = useContext(ModalContext);

    const {
        setEnsName,
        dm3NameServiceSelected,
        setDm3NameServiceSelected,
        namingServiceSelected,
        setNamingServiceSelected,
    } = useContext(ConfigureProfileContext);

    const { dm3Configuration } = useContext(DM3ConfigurationContext);

    // // handles ENS name and address
    // useEffect(() => {
    //     getEnsName(
    //         mainnetProvider,
    //         ethAddress!,
    //         account!,
    //         (name: string) => setEnsName(name),
    //         dm3Configuration.addressEnsSubdomain,
    //     );
    // }, [ethAddress]);

    // useEffect(() => {
    //     if (connectedChainId) {
    //         setNamingServiceSelected(fetchServiceFromChainId(connectedChainId));
    //     }
    // }, []);

    return (
        <div>
            {/* Wallet address */}
            <div className="profile-config-container ps-2 mt-3">
                <div className="d-flex">
                    <p
                        className="m-0 
                    font-size-14 font-weight-500 line-height-24 title-content"
                    >
                        Wallet Address
                        <span className='address-tooltip'>
                            i
                            <span className="address-tooltip-text">
                                You can use your wallet address as a username.
                                A virtual profile is created and stored at a dm3 service.
                                There are no transaction costs for creation and administration.
                                <br />
                                <span className='font-weight-800'> You can receive messages sent to your wallet address.</span>
                            </span>
                        </span>
                    </p>
                </div>
                <p
                    className="dm3-address m-0
                    font-size-14 font-weight-500 line-height-24 grey-text"
                >
                    {ethAddress &&
                        ethAddress +
                        dm3Configuration.addressEnsSubdomain}
                </p>
                {/* <div className="address-details">
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
                    </div> */}
            </div>

            {/* Add profile button */}
            <div className='mt-4 ms-2'>
                <button
                    className={BUTTON_CLASS.concat(
                        configureProfileModal.isAddProfileButtonActive ?
                            ' add-prof-btn-active' : ' add-prof-btn-disabled')}
                    disabled={!configureProfileModal.isAddProfileButtonActive}
                    onClick={() => {
                        setConfigureProfileModal({
                            isAddProfileButtonActive: !configureProfileModal.isAddProfileButtonActive
                        })
                    }}
                >
                    Add Profile
                </button>
            </div>

            {/* DM3 Name */}
            {/* <div className="mt-3 d-flex ps-2 align-items-baseline">
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
            </div> */}

            {/* {fetchDM3NameComponent(
                dm3NameServiceSelected,
                dm3Configuration.chainId,
            )} */}

            {/* ENS Name */}
            {/* <div className="mt-3 d-flex ps-2 align-items-baseline">
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
                                        {data.name.split('- ')[1]}
                                    </option>
                                );
                            })}
                    </select>
                </div>
            </div>

            {fetchComponent(namingServiceSelected, dm3Configuration.chainId)} */}
        </div>
    );
}
