import './RightHeader.css';
import { useContext, useEffect, useState } from 'react';
import humanIcon from '../../assets/images/human.svg';
import backIcon from '../../assets/images/back.svg';
import { useMainnetProvider } from '../../hooks/mainnetprovider/useMainnetProvider';
import { getAvatarProfilePic } from '../../utils/ens-utils';
import { RightViewSelected } from '../../utils/enum-type-utils';
import { ConversationContext } from '../../context/ConversationContext';
import { closeContactMenu } from '../../utils/common-utils';
import { ContactMenu } from '../ContactMenu/ContactMenu';
import { ContactPreview } from '../../interfaces/utils';
import { DM3ConfigurationContext } from '../../context/DM3ConfigurationContext';
import { UiViewContext } from '../../context/UiViewContext';

export function MobileView() {
    const { selectedRightView } = useContext(UiViewContext);

    const { setSelectedContactName, selectedContact } =
        useContext(ConversationContext);

    const { dm3Configuration } = useContext(DM3ConfigurationContext);

    const mainnetProvider = useMainnetProvider();

    // state to store profile pic of signed in user
    const [profilePic, setProfilePic] = useState<string>('');

    const contactName = selectedContact?.contactDetails.account.ensName;

    // fetches profile pic of contact selected
    const fetchAndSetProfilePic = async () => {
        setProfilePic(
            await getAvatarProfilePic(
                mainnetProvider,
                contactName as string,
                dm3Configuration.addressEnsSubdomain,
            ),
        );
    };

    // Method to open 3 dot icon menu to in mobile screen
    const openMenu = () => {
        const menu = document.querySelector('.dropdown-content');
        if (menu && !menu.classList.contains('menu-details-dropdown-content')) {
            menu.classList.add('menu-details-dropdown-content');
        } else {
            closeContactMenu();
        }
    };

    // loads the profile pic on page render
    useEffect(() => {
        fetchAndSetProfilePic();
    }, []);

    return (
        <>
            {selectedRightView === RightViewSelected.Chat && (
                <div
                    className={'justify-content-between'.concat(
                        ' col-12 d-flex align-items-center pr-0 profile-name-container background-container',
                    )}
                >
                    <div className="d-flex justify-content-between align-items-center">
                        {dm3Configuration.showContacts && (
                            <img
                                src={backIcon}
                                alt="pic"
                                className="me-2 pointer-cursor border-radius-3 back-btn"
                                onClick={() => {
                                    setSelectedContactName(undefined);
                                }}
                            />
                        )}

                        <img
                            src={profilePic ? profilePic : humanIcon}
                            alt="pic"
                            className="me-2 pointer-cursor border-radius-3 default-profile-pic"
                        />

                        <span className="font-size-10 text-primary-color">
                            {contactName}
                        </span>
                    </div>

                    <div>
                        <div
                            className="menu-details"
                            onClick={() => openMenu()}
                        >
                            ···
                        </div>
                        {
                            <ContactMenu
                                contactDetails={
                                    selectedContact as ContactPreview
                                }
                                isMenuAlignedAtBottom={true}
                            />
                        }
                    </div>
                </div>
            )}
        </>
    );
}
