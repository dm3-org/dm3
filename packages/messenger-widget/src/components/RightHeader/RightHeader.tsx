import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useContext, useEffect, useState } from 'react';
import humanIcon from '../../assets/images/human.svg';
import menuIcon from '../../assets/images/menu.svg';
import { AuthContext } from '../../context/AuthContext';
import { useMainnetProvider } from '../../hooks/mainnetprovider/useMainnetProvider';
import { HideFunctionProps } from '../../interfaces/props';
import { GlobalContext } from '../../utils/context-utils';
import { getAvatarProfilePic } from '../../utils/ens-utils';
import {
    AccountsType,
    RightViewSelected,
    UiViewStateType,
} from '../../utils/enum-type-utils';
import './RightHeader.css';

export function RightHeader(props: HideFunctionProps) {
    // fetches context storage
    const { state, dispatch } = useContext(GlobalContext);
    const { account, displayName, ethAddress } = useContext(AuthContext);

    const mainnetProvider = useMainnetProvider();

    // state to store profile pic of signed in user
    const [profilePic, setProfilePic] = useState<string>('');

    // method to fetch profile pic
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

            dispatch({
                type: AccountsType.SetSelectedContact,
                payload: undefined,
            });
        }
    };

    // loads the profile pic on page render
    useEffect(() => {
        fetchAndSetProfilePic();
    }, []);

    return (
        <div
            className={(props.showContacts
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
            {!props.showContacts && (
                <div
                    className={
                        !props.showContacts ? 'p-2' : 'menu-icon-container'
                    }
                >
                    <img src={menuIcon} className="pointer-cursor" alt="menu" />
                </div>
            )}

            <div className="d-flex align-items-center justify-content-end">
                <div className="me-2">
                    <ConnectButton showBalance={false} />
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
