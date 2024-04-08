import './RightHeader.css';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useContext, useEffect, useState } from 'react';
import humanIcon from '../../assets/images/human.svg';
import menuIcon from '../../assets/images/menu.svg';
import { AuthContext } from '../../context/AuthContext';
import { useMainnetProvider } from '../../hooks/mainnetprovider/useMainnetProvider';
import { GlobalContext } from '../../utils/context-utils';
import { getAvatarProfilePic } from '../../utils/ens-utils';
import {
    RightViewSelected,
    UiViewStateType,
} from '../../utils/enum-type-utils';
import { ConversationContext } from '../../context/ConversationContext';
import { DM3ConfigurationContext } from '../../context/DM3ConfigurationContext';

export function NormalView() {
    // fetches context storage
    const { state, dispatch } = useContext(GlobalContext);
    const { account, displayName } = useContext(AuthContext);
    const { setSelectedContactName } = useContext(ConversationContext);
    const { dm3Configuration } = useContext(DM3ConfigurationContext);

    const mainnetProvider = useMainnetProvider();

    // state to store profile pic of signed in user
    const [profilePic, setProfilePic] = useState<string>('');

    // fetched profile pic of signed in user
    const fetchAndSetProfilePic = async () => {
        setProfilePic(
            await getAvatarProfilePic(
                mainnetProvider,
                account?.ensName as string,
            ),
        );
    };

    // method to set profile page and set contact
    const updateView = () => {
        dispatch({
            type: UiViewStateType.SetSelectedRightView,
            payload: RightViewSelected.Profile,
        });
        setSelectedContactName(undefined);
    };

    // loads the profile pic on page render
    useEffect(() => {
        fetchAndSetProfilePic();
    }, []);

    return (
        <div
            className={(dm3Configuration.showContacts
                ? 'justify-content-end'
                : 'justify-content-between'
            ).concat(
                ' col-12 d-flex align-items-center pr-0 profile-name-container'.concat(
                    ' ',
                    state.uiView.selectedRightView === RightViewSelected.Profile
                        ? ' background-chat'
                        : ' background-container',
                ),
            )}
        >
            {!dm3Configuration.showContacts && (
                <div
                    className={
                        !dm3Configuration.showContacts
                            ? 'p-2'
                            : 'menu-icon-container'
                    }
                >
                    <img src={menuIcon} className="pointer-cursor" alt="menu" />
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
    );
}
