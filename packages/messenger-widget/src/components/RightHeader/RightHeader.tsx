import './RightHeader.css';
import { useContext, useEffect, useState } from 'react';
import humanIcon from '../../assets/images/human.svg';
import { GlobalContext } from '../../utils/context-utils';
import { checkEnsDM3Text, getAvatarProfilePic } from '../../utils/ens-utils';
import {
    AccountsType,
    CacheType,
    RightViewSelected,
    UiViewStateType,
} from '../../utils/enum-type-utils';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { globalConfig } from 'dm3-lib-shared';
import { hasUserProfile } from 'dm3-lib-profile';
import { HideFunctionProps } from '../../interfaces/props';
import menuIcon from '../../assets/images/menu.svg';
import { getAliasChain } from 'dm3-lib-delivery-api';
import { getLastDm3Name } from '../../utils/common-utils';

export function RightHeader(props: HideFunctionProps) {
    // fetches context storage
    const { state, dispatch } = useContext(GlobalContext);

    // state to store profile pic of signed in user
    const [profilePic, setProfilePic] = useState<string>('');

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
                    const dm3ProfileRecordExists = await checkEnsDM3Text(
                        state,
                        name,
                    );
                    dispatch({
                        type: CacheType.AccountName,
                        payload:
                            hasProfile && dm3ProfileRecordExists
                                ? name
                                : state.connection.account?.ensName,
                    });
                } else {
                    const dm3Names: any = await getAliasChain(
                        state.connection.account,
                        state.connection.provider,
                    );
                    let dm3Name;
                    if (dm3Names && dm3Names.length) {
                        dm3Name = getLastDm3Name(dm3Names);
                    }
                    dispatch({
                        type: CacheType.AccountName,
                        payload: dm3Name
                            ? dm3Name
                            : state.connection.account.ensName,
                    });
                }
            } else {
                dispatch({
                    type: CacheType.AccountName,
                    payload: state.connection.account
                        ? state.connection.account.ensName
                        : '',
                });
            }
        } catch (error) {
            dispatch({
                type: CacheType.AccountName,
                payload: state.connection.account
                    ? state.connection.account.ensName
                    : '',
            });
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
                    {state.cache.accountName}
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
