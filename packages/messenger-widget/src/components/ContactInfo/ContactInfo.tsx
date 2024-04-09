import '../../styles/profile-contact.css';
import { ethers } from 'ethers';
import { useContext, useEffect, useState } from 'react';
import copyIcon from '../../assets/images/copy.svg';
import closeIcon from '../../assets/images/cross.svg';
import profilePic from '../../assets/images/human.svg';
import { ConversationContext } from '../../context/ConversationContext';
import { useMainnetProvider } from '../../hooks/mainnetprovider/useMainnetProvider';
import { onClose, openEnsProfile, openEtherscan } from '../../utils/ens-utils';
import { RightViewSelected } from '../../utils/enum-type-utils';
import { Button } from '../Button/Button';
import { EnsDetails } from '../EnsDetails/EnsDetails';
import { closeLoader, startLoader } from '../Loader/Loader';
import { DM3ConfigurationContext } from '../../context/DM3ConfigurationContext';
import { UiViewContext } from '../../context/UiViewContext';
import { ModalContext } from '../../context/ModalContext';

export function ContactInfo() {
    const { selectedContact, setSelectedContactName, hideContact } =
        useContext(ConversationContext);
    const { dm3Configuration, screenWidth } = useContext(
        DM3ConfigurationContext,
    );
    const { setSelectedRightView } = useContext(UiViewContext);
    const { setLoaderContent } = useContext(ModalContext);

    const mainnetProvider = useMainnetProvider();

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

    const onClickOfHideContact = () => {
        if (!selectedContact) {
            return;
        }
        hideContact(selectedContact.contactDetails.account.ensName);
        //Close the message Modal and show the default one instead
        setSelectedRightView(RightViewSelected.Default);
    };

    useEffect(() => {
        const fetchAddress = async () => {
            if (selectedContact) {
                setLoaderContent('Fetching contact details...');
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
        <div className="contact-info-container-type h-100">
            <div
                className="d-flex align-items-center justify-content-between profile-heading 
            text-primary-color font-weight-500 pt-4 highlight-chat-border"
            >
                Contact Info
                <img
                    className="pointer-cursor close-icon"
                    src={closeIcon}
                    alt="close"
                    onClick={() =>
                        onClose(
                            setSelectedRightView,
                            setSelectedContactName,
                            screenWidth,
                            dm3Configuration.showContacts,
                        )
                    }
                />
            </div>

            <div className="profile-details-container text-primary-color">
                <img
                    src={
                        selectedContact?.contactDetails
                            ? selectedContact.image
                            : profilePic
                    }
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
                            action={() =>
                                openEtherscan(address, dm3Configuration.chainId)
                            }
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

                    {/* Hide button is not visible when showContacts is false.
                    User has no option to choose contact means single contact is
                    available for chat, so that can't be hided */}
                    {dm3Configuration.showContacts && (
                        <div className="configure-btn-container">
                            <Button
                                buttonText="Hide Contact"
                                actionMethod={onClickOfHideContact}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
