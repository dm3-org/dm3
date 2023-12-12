import '../../styles/profile-contact.css';
import { Button } from '../Button/Button';
import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../../utils/context-utils';
import profPic from '../../assets/images/human.svg';
import closeIcon from '../../assets/images/cross.svg';
import { EnsProfileDetails } from '../../interfaces/utils';
import {
    checkEnsDM3Text,
    getAvatarProfilePic,
    getEnsProfileDetails,
    onClose,
    openEnsProfile,
} from '../../utils/ens-utils';
import { EnsDetails } from '../EnsDetails/EnsDetails';
import { openConfigurationModal } from '../ConfigureProfile/bl';
import { globalConfig } from 'dm3-lib-shared';
import { hasUserProfile } from 'dm3-lib-profile';

export function Profile() {
    const { state, dispatch } = useContext(GlobalContext);

    const [profilePic, setProfilePic] = useState<string>('');
    const [github, setGithub] = useState<string>('Not set');
    const [twitter, setTwitter] = useState<string>('Not set');
    const [email, setEmail] = useState<string>('Not set');

    // fetches and updates ENS profile details
    const fetchUserEnsProfileDetails = async () => {
        const ensDetails: EnsProfileDetails = await getEnsProfileDetails(
            state,
            state.cache.accountName ? state.cache.accountName : state.connection.account?.ensName as string,
        );
        ensDetails.github && setGithub(ensDetails.github);
        ensDetails.twitter && setTwitter(ensDetails.twitter);
        ensDetails.email && setEmail(ensDetails.email);
    };

    // method to fetch profile pic
    const fetchAndSetProfilePic = async () => {
        setProfilePic(
            await getAvatarProfilePic(
                state,
                state.connection.account?.ensName as string,
            ),
        );
    };

    // method to open ENS name
    const openEnsNameProfile = async () => {
        try {
            if (state.connection.provider && state.connection.ethAddress) {
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

                    if (hasProfile && dm3ProfileRecordExists)
                        openEnsProfile(name as string);
                    else openEnsProfile(state.connection.ethAddress);
                } else {
                    openEnsProfile(state.connection.ethAddress);
                }
            } else {
                openEnsProfile(
                    state.connection.ethAddress
                        ? state.connection.ethAddress
                        : (state.connection.account?.ensName as string),
                );
            }
        } catch (error) {
            openEnsProfile(
                state.connection.ethAddress
                    ? state.connection.ethAddress
                    : (state.connection.account?.ensName as string),
            );
        }
    };

    useEffect(() => {
        fetchAndSetProfilePic();
        fetchUserEnsProfileDetails();
    }, []);

    return (
        <>
            <div
                className="d-flex align-items-center justify-content-between 
            profile-heading text-primary-color font-weight-500"
            >
                Profile
                <img
                    className="pointer-cursor close-icon"
                    src={closeIcon}
                    alt="close"
                    onClick={() => onClose(dispatch)}
                />
            </div>

            <div className="profile-details-container text-primary-color">
                <img
                    src={profilePic ? profilePic : profPic}
                    alt="profile-pic"
                    className="border-radius-4 profile-image"
                />

                <div className="profile-detail-items mt-3">
                    <EnsDetails
                        propertyKey={'Name'}
                        propertyValue={
                            state.connection.account?.ensName as string
                        }
                    />
                    <EnsDetails
                        propertyKey={'Address'}
                        propertyValue={state.connection.ethAddress as string}
                    />
                    <EnsDetails propertyKey={'E-Mail'} propertyValue={email} />
                    <EnsDetails propertyKey={'Github'} propertyValue={github} />
                    <EnsDetails
                        propertyKey={'Twitter'}
                        propertyValue={twitter}
                    />

                    <div className="ens-btn-container">
                        <Button
                            buttonText="Open ENS profile"
                            actionMethod={() => openEnsNameProfile()}
                        />
                    </div>

                    <div className="configure-btn-container">
                        <Button
                            buttonText="Configure dm3 profile"
                            actionMethod={() =>
                                openConfigurationModal(dispatch)
                            }
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
