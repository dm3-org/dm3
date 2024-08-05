import '../../styles/modal.css';
import './ConfigureProfile.css';
import { useContext, useEffect } from 'react';
import { useChainId } from 'wagmi';
import tickIcon from '../../assets/images/white-tick.svg';
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

export function NormalView() {
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

    // handles ENS name and address
    // useEffect(() => {
    //     getEnsName(
    //         mainnetProvider,
    //         ethAddress!,
    //         account!,
    //         (name: string) => setEnsName(name),
    //         dm3Configuration.addressEnsSubdomain,
    //     );
    // }, [ethAddress]);

    useEffect(() => {
        if (connectedChainId) {
            setNamingServiceSelected(fetchServiceFromChainId(connectedChainId));
        }
    }, []);

    return (
        <div className="mt-2">
            {/* Wallet Address */}
            <div className="d-flex pt-4 ps-4">
                {/* <div className="configuration-items-align">
                    {ethAddress && <img src={tickIcon} />}
                </div> */}

                <div className="profile-config-container ps-2">
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
                        <p
                            className="dm3-address m-0 ms-5
                    font-size-14 font-weight-500 line-height-24 grey-text"
                        >
                            {ethAddress &&
                                ethAddress +
                                dm3Configuration.addressEnsSubdomain}
                        </p>
                    </div>

                    {/* Add profile button */}
                    <div className='mt-4'>
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
            </div>

            <div className='mt-4 ms-4 me-4 dm3-prof-select-container'>
                <div className='dm3-prof-select-type'>
                    Add new dm3 profile  - select type
                </div>
                <div className='p-4'>
                    <input type="radio" name="profile_name" value="dm-name" defaultChecked />
                    <label className='name-option'>Claim a dm3 Name (dm3 cloud, Optimism, ...)</label>
                    <br />
                    <input type="radio" name="profile_name" value="own-name" />
                    <label className='name-option mt-3'>use your own Name (ENS, GENOME, ...)</label>
                </div>
                <div className='d-flex justify-content-end me-3 mb-3'>
                    <button
                        className={BUTTON_CLASS.concat(' add-prof-btn-active')}
                        onClick={() => { }}
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* DM3 Name */}
            {/* <div className="mt-4 d-flex ps-4 align-items-baseline">
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
            {/* <div className="mt-4 d-flex ps-4 align-items-baseline">
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

            {fetchComponent(namingServiceSelected, dm3Configuration.chainId)} */}
        </div>
    );
}
