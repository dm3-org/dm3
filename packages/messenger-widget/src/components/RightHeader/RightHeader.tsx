import './RightHeader.css';
import { useContext, useEffect, useState } from 'react';
import humanIcon from '../../assets/images/human.svg';
import { GlobalContext } from '../../utils/context-utils';
import { getAvatarProfilePic } from '../../utils/ens-utils';
import {
    AccountsType,
    RightViewSelected,
    UiViewStateType,
} from '../../utils/enum-type-utils';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { globalConfig } from 'dm3-lib-shared';
import { hasUserProfile } from 'dm3-lib-profile';

export function RightHeader() {
    // fetches context storage
    const { state, dispatch } = useContext(GlobalContext);

    // state to store profile pic of signed in user
    const [profilePic, setProfilePic] = useState<string>('');
    const [displayName, setDisplayName] = useState<string>('');

    // method to fetch profile pic
    const fetchAndSetProfilePic = async () => {
        setProfilePic(
            await getAvatarProfilePic(
                state,
                state.connection.account?.ensName as string,
            ),
        );
    };

    // method to set profile page and set contact
    const updateView = () => {
        let profileActive: RightViewSelected = state.uiView.selectedRightView;
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
    };

    const fetchDisplayName = async () => {
        try {
            if (
                state.connection.provider &&
                state.connection.ethAddress &&
                state.connection.account
            ) {
                const isAddrEnsName =
                    state.connection.account?.ensName?.endsWith(
                        globalConfig.ADDR_ENS_SUBDOMAIN(),
                    );
                const name = await state.connection.provider.lookupAddress(
                    state.connection.ethAddress,
                );
                if (name && !isAddrEnsName) {
                    const hasProfile = await hasUserProfile(
                        state.connection.provider,
                        name,
                    );
                    setDisplayName(
                        hasProfile ? name : state.connection.account?.ensName,
                    );
                } else {
                    return setDisplayName(state.connection.account.ensName);
                }
            } else {
                return setDisplayName(
                    state.connection.account
                        ? state.connection.account.ensName
                        : '',
                );
            }
        } catch (error) {
            return setDisplayName(
                state.connection.account
                    ? state.connection.account.ensName
                    : '',
            );
        }
    };

    // loads the profile pic on page render
    useEffect(() => {
        fetchAndSetProfilePic();
        fetchDisplayName();
    }, []);

    useEffect(() => {
        fetchDisplayName();
    }, [state.connection.account?.ensName]);

    return (
        <div
            className={'col-12 d-flex align-items-center justify-content-end pr-0 profile-name-container'.concat(
                ' ',
                state.uiView.selectedRightView === RightViewSelected.Profile
                    ? 'background-chat'
                    : 'background-container',
            )}
        >
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
                className="pointer-cursor border-radius-3 default-profile-pic"
                onClick={() => updateView()}
            />
        </div>
    );
}
