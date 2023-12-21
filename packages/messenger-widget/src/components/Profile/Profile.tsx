import '../../styles/profile-contact.css';
import { Button } from '../Button/Button';
import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../../utils/context-utils';
import profPic from '../../assets/images/human.svg';
import closeIcon from '../../assets/images/cross.svg';
import { EnsProfileDetails } from '../../interfaces/utils';
import {
    getAvatarProfilePic,
    getEnsProfileDetails,
    onClose,
    openEnsProfile,
} from '../../utils/ens-utils';
import { EnsDetails } from '../EnsDetails/EnsDetails';
import { openConfigurationModal } from '../ConfigureProfile/bl';
import { AuthContext } from '../../context/AuthContext';
import { useMainnetProvider } from '../../hooks/mainnetprovider/useMainnetProvider';

export function Profile() {
    const { dispatch } = useContext(GlobalContext);
    const { account, ethAddress } = useContext(AuthContext);
    const mainnetProvider = useMainnetProvider();

    const [profilePic, setProfilePic] = useState<string>('');
    const [github, setGithub] = useState<string>('Not set');
    const [twitter, setTwitter] = useState<string>('Not set');
    const [email, setEmail] = useState<string>('Not set');

    // fetches and updates ENS profile details
    const fetchUserEnsProfileDetails = async () => {
        const ensDetails: EnsProfileDetails = await getEnsProfileDetails(
            mainnetProvider!,
            account?.ensName as string,
        );
        ensDetails.github && setGithub(ensDetails.github);
        ensDetails.twitter && setTwitter(ensDetails.twitter);
        ensDetails.email && setEmail(ensDetails.email);
    };

    // method to fetch profile pic
    const fetchAndSetProfilePic = async () => {
        setProfilePic(
            await getAvatarProfilePic(
                mainnetProvider,
                account?.ensName as string,
            ),
        );
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
                        propertyValue={account?.ensName as string}
                    />
                    <EnsDetails
                        propertyKey={'Address'}
                        propertyValue={ethAddress as string}
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
                            actionMethod={() =>
                                openEnsProfile(account?.ensName as string)
                            }
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
