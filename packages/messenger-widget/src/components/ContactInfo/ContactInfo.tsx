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
} from '../../utils/ens-utils';
import { ContactInfo } from '../../interfaces/utils';
import profilePic from '../../assets/images/profile-pic.jpg';
import { closeLoader, startLoader } from '../Loader/Loader';
import { ModalStateType } from '../../utils/enum-type-utils';

export function ContactInfo() {
    const { state, dispatch } = useContext(GlobalContext);
    const [contactDetails, setContactDetails] = useState<ContactInfo | null>(
        null,
    );

    const fetchContactDetails = async () => {
        setContactDetails(await getContactSelected(state));
        closeLoader();
    };

    useEffect(() => {
        dispatch({
            type: ModalStateType.LoaderContent,
            payload: 'Fetching contact information...',
        });
        startLoader();
        fetchContactDetails();
    }, []);

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
                    <EnsDetails
                        propertyKey={'Name'}
                        propertyValue={
                            contactDetails ? contactDetails.name : ''
                        }
                    />
                    <EnsDetails
                        propertyKey={'Address'}
                        propertyValue={
                            contactDetails ? contactDetails.address : ''
                        }
                    />

                    <div className="ens-btn-container pt-4">
                        <Button
                            buttonText="Open ENS profile"
                            actionMethod={() =>
                                openEnsProfile(
                                    contactDetails ? contactDetails.name : '',
                                )
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
