import '../../styles/common.css';
import { Contacts } from '../../components/Contacts/Contacts';
import menuIcon from '../../assets/images/menu.svg';
import ConfigureProfileBox from '../../components/ConfigureProfileBox/ConfigureProfileBox';
import { useContext, useEffect, useState } from 'react';
import {
    LeftViewSelected,
    RightViewSelected,
} from '../../utils/enum-type-utils';
import { closeLoader, startLoader } from '../../components/Loader/Loader';
import Menu from '../../components/Menu/Menu';
import { ConversationContext } from '../../context/ConversationContext';
import { getAvatarProfilePic } from '../../utils/ens-utils';
import { AuthContext } from '../../context/AuthContext';
import { useMainnetProvider } from '../../hooks/mainnetprovider/useMainnetProvider';
import humanIcon from '../../assets/images/human.svg';
import { DM3ConfigurationContext } from '../../context/DM3ConfigurationContext';
import { UiViewContext } from '../../context/UiViewContext';
import { ModalContext } from '../../context/ModalContext';

export default function LeftView() {
    const { account, displayName } = useContext(AuthContext);
    const { setLoaderContent } = useContext(ModalContext);
    const { initialized } = useContext(ConversationContext);
    const { dm3Configuration } = useContext(DM3ConfigurationContext);

    const { setSelectedLeftView, setSelectedRightView, selectedLeftView } =
        useContext(UiViewContext);

    const mainnetProvider = useMainnetProvider();

    // state to store profile pic of signed in user
    const [profilePic, setProfilePic] = useState<string>('');

    // method to fetch profile pic
    const fetchAndSetProfilePic = async () => {
        setProfilePic(
            await getAvatarProfilePic(
                mainnetProvider,
                account?.ensName as string,
                dm3Configuration.addressEnsSubdomain,
            ),
        );
    };

    // method to set profile page and set contact
    const updateView = () => {
        if (dm3Configuration.showContacts) {
            setSelectedRightView(RightViewSelected.Profile);
        }
    };

    // handles starting loader on page load
    useEffect(() => {
        if (!initialized) {
            setLoaderContent('Fetching contacts...');
            startLoader();
            return;
        }
        closeLoader();
    }, [initialized]);

    useEffect(() => {
        fetchAndSetProfilePic();
    }, []);

    // method to open menu item
    const openMenuItem = () => {
        setSelectedLeftView(LeftViewSelected.Menu);
    };

    return (
        <div className="position-relative h-100 d-flex flex-column align-items-start">
            <div
                className={'w-100 h-100 d-flex justify-content-between flex-column'.concat(
                    ' ',
                    selectedLeftView === LeftViewSelected.Menu
                        ? 'blur-background'
                        : '',
                )}
            >
                <div className="menu-icon-container">
                    <img
                        src={menuIcon}
                        className="pointer-cursor"
                        alt="menu"
                        onClick={() => openMenuItem()}
                    />
                    {/* Profile icon to show in mobile screens */}
                    <div className="mobile-profile-icon">
                        <span
                            onClick={() => updateView()}
                            className="font-weight-500 pointer-cursor text-secondary-color ps-1 pe-1"
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
                </div>
                <Contacts />
                <ConfigureProfileBox />
            </div>

            {selectedLeftView === LeftViewSelected.Menu && (
                <div className={'h-100 menu-container'}>
                    <Menu />
                </div>
            )}
        </div>
    );
}
