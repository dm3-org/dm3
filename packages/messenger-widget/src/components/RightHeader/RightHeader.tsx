import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useContext, useEffect, useState } from 'react';
import humanIcon from '../../assets/images/human.svg';
import menuIcon from '../../assets/images/menu.svg';
import backIcon from '../../assets/images/back.svg';
import threeDotsIcon from '../../assets/images/three-dots.svg';
import { AuthContext } from '../../context/AuthContext';
import { useMainnetProvider } from '../../hooks/mainnetprovider/useMainnetProvider';
import { HideFunctionProps } from '../../interfaces/props';
import { GlobalContext } from '../../utils/context-utils';
import { getAvatarProfilePic } from '../../utils/ens-utils';
import {
    RightViewSelected,
    UiViewStateType,
} from '../../utils/enum-type-utils';
import './RightHeader.css';
import { ConversationContext } from '../../context/ConversationContext';
import { DM3ConfigurationContext } from '../../context/DM3ConfigurationContext';
import {
    MOBILE_SCREEN_WIDTH,
    closeContactMenu,
} from '../../utils/common-utils';
import { ContactMenu } from '../ContactMenu/ContactMenu';
import { ContactPreview } from '../../interfaces/utils';

export function RightHeader(props: HideFunctionProps) {
    // fetches context storage
    const { state, dispatch } = useContext(GlobalContext);
    const { account, displayName } = useContext(AuthContext);
    const { setSelectedContactName, selectedContact } =
        useContext(ConversationContext);
    const { screenWidth } = useContext(DM3ConfigurationContext);

    const mainnetProvider = useMainnetProvider();

    // state to store profile pic of signed in user
    const [profilePic, setProfilePic] = useState<string>('');

    const contactName = selectedContact?.contactDetails.account.ensName;

    // fetches profile pic of contact for mobile screens
    // fetched profile pic of signed in user for desktop
    const fetchAndSetProfilePic = async () => {
        setProfilePic(
            await getAvatarProfilePic(
                mainnetProvider,
                screenWidth > MOBILE_SCREEN_WIDTH
                    ? (account?.ensName as string)
                    : (contactName as string),
            ),
        );
    };

    // method to set profile page and set contact
    const updateView = () => {
        if (props.showContacts) {
            let profileActive: RightViewSelected =
                state.uiView.selectedRightView;
            profileActive =
                profileActive === RightViewSelected.Profile
                    ? RightViewSelected.Default
                    : RightViewSelected.Profile;

            dispatch({
                type: UiViewStateType.SetSelectedRightView,
                payload: profileActive,
            });
            setSelectedContactName(undefined);
        }
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
            {/* Header for mobile screen */}
            {screenWidth <= MOBILE_SCREEN_WIDTH ? (
                state.uiView.selectedRightView === RightViewSelected.Chat && (
                    <div
                        className={'justify-content-between'.concat(
                            ' col-12 d-flex align-items-center pr-0 profile-name-container background-container',
                        )}
                    >
                        <div className="d-flex justify-content-between align-items-center">
                            {props.showContacts && (
                                <img
                                    src={backIcon}
                                    alt="pic"
                                    className="me-2 pointer-cursor border-radius-3 back-btn"
                                    onClick={() => {
                                        setSelectedContactName(undefined);
                                    }}
                                />
                            )}

                            {/* Add the profile pic of contact  */}
                            <img
                                src={profilePic ? profilePic : humanIcon}
                                alt="pic"
                                className="me-2 pointer-cursor border-radius-3 default-profile-pic"
                            />

                            <span className="font-size-10 text-primary-color">
                                {contactName &&
                                    (contactName.length > 20
                                        ? contactName.substring(
                                              0,
                                              contactName.length,
                                          )
                                        : contactName)}
                            </span>
                        </div>

                        <div>
                            <img
                                className="menu-details"
                                src={threeDotsIcon}
                                alt="menu"
                                onClick={() => openMenu()}
                            />
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
                )
            ) : (
                <div
                    className={(props.showContacts
                        ? 'justify-content-end'
                        : 'justify-content-between'
                    ).concat(
                        ' col-12 d-flex align-items-center pr-0 profile-name-container'.concat(
                            ' ',
                            state.uiView.selectedRightView ===
                                RightViewSelected.Profile
                                ? ' background-chat'
                                : ' background-container',
                        ),
                    )}
                >
                    {!props.showContacts && (
                        <div
                            className={
                                !props.showContacts
                                    ? 'p-2'
                                    : 'menu-icon-container'
                            }
                        >
                            <img
                                src={menuIcon}
                                className="pointer-cursor"
                                alt="menu"
                            />
                        </div>
                    )}

                    <div className="d-flex align-items-center justify-content-end">
                        <div className="me-2">
                            <ConnectButton
                                showBalance={false}
                                accountStatus={{
                                    smallScreen: 'avatar',
                                    largeScreen: 'full',
                                }}
                            />
                        </div>
                        <span
                            onClick={() => updateView()}
                            className="profile-name font-weight-500 pointer-cursor text-secondary-color"
                        >
                            {displayName}
                        </span>
                        <img
                            src={profilePic ? profilePic : humanIcon}
                            alt="menu"
                            className="me-2 pointer-cursor border-radius-3 default-profile-pic"
                            onClick={() => updateView()}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
