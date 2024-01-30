/* eslint-disable no-console */
import '../../styles/profile-contact.css';
import { Button } from '../Button/Button';
import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../../utils/context-utils';
import closeIcon from '../../assets/images/cross.svg';
import { EnsDetails } from '../EnsDetails/EnsDetails';
import {
    getContactSelected,
    hideContact,
    onClose,
    openEnsProfile,
    openEtherscan,
} from '../../utils/ens-utils';
import { IContactInfo } from '../../interfaces/utils';
import profilePic from '../../assets/images/human.svg';
import { closeLoader, startLoader } from '../Loader/Loader';
import { ModalStateType } from '../../utils/enum-type-utils';
import copyIcon from '../../assets/images/copy.svg';
import { useMainnetProvider } from '../../hooks/mainnetprovider/useMainnetProvider';
import { ConversationContext } from '../../context/ConversationContext';
import { ethers } from 'ethers';

export function ContactInfo() {
    const { state, dispatch } = useContext(GlobalContext);
    const { selectedContact } = useContext(ConversationContext);
    const mainnetProvider = useMainnetProvider();

    const [contactDetails, setContactDetails] = useState<IContactInfo | null>(
        null,
    );

    const [address, setAddress] = useState<string>('');

    const copyText = async (text: string) => {
        await navigator.clipboard.writeText(text);
    };

    const getAddress = async (ensName: string) => {
        let address;
        try {
            address = await mainnetProvider?.resolveName(ensName);
        } catch (error) {}

        if (!address) {
            address = ensName.split('.')[0];
            address = ethers.utils.isAddress(address) ? address : 'Not set';
        }
        return address;
    };

    useEffect(() => {
        const fetchAddress = async () => {
            if (selectedContact) {
                startLoader();
                const _address = await getAddress(
                    selectedContact.contactDetails.account.ensName ?? '',
                );
                setAddress(_address);
                closeLoader();
            }
        };
        fetchAddress();
    }, [selectedContact]);

    return (
        <>
            <div
                className="d-flex align-items-center justify-content-between profile-heading 
            text-primary-color font-weight-500 pt-4 highlight-chat-border"
            >
                Contact Info
                <img
                    className="pointer-cursor close-icon"
                    src={closeIcon}
                    alt="close"
                    onClick={() => onClose(dispatch)}
                />
            </div>

            <div className="profile-details-container text-primary-color">
                <img
                    src={contactDetails ? contactDetails.image : profilePic}
                    alt="profile-pic"
                    className="border-radius-4 profile-image"
                />

                <div className="profile-detail-items mt-3">
                    <div className="d-flex align-items-center">
                        <EnsDetails
                            propertyKey={'Name'}
                            propertyValue={selectedContact?.name ?? ''}
                            action={() =>
                                openEnsProfile(selectedContact?.name ?? '')
                            }
                        />
                        <img
                            src={copyIcon}
                            alt=""
                            className="copy-btn pointer-cursor"
                            onClick={() => {
                                copyText(selectedContact?.name ?? '');
                            }}
                        />
                    </div>
                    <div className="d-flex align-items-center">
                        <EnsDetails
                            propertyKey={'Address'}
                            propertyValue={address}
                            action={() => openEtherscan(address)}
                        />
                        <img
                            src={copyIcon}
                            alt=""
                            className="copy-btn pointer-cursor"
                            onClick={() => {
                                copyText(address);
                            }}
                        />
                    </div>

                    <div className="ens-btn-container pt-4">
                        <Button
                            buttonText="Open ENS profile"
                            actionMethod={() =>
                                openEnsProfile(selectedContact?.name ?? '')
                            }
                        />
                    </div>

                    <div className="configure-btn-container">
                        <Button
                            buttonText="Hide Contact"
                            actionMethod={() => hideContact(state, dispatch)}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
