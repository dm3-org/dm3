import '../../styles/common.css';
import { Contacts } from '../../components/Contacts/Contacts';
import menuIcon from '../../assets/images/menu.svg';
import ConfigureProfileBox from '../../components/ConfigureProfileBox/ConfigureProfileBox';
import { DashboardProps } from '../../interfaces/props';
import { GlobalContext } from '../../utils/context-utils';
import { useContext, useEffect, useState } from 'react';
import {
    LeftViewSelected,
    ModalStateType,
    RightViewSelected,
    UiViewStateType,
} from '../../utils/enum-type-utils';
import { closeLoader, startLoader } from '../../components/Loader/Loader';
import Menu from '../../components/Menu/Menu';
import { ConversationContext } from '../../context/ConversationContext';
import './../../styles/common.css';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { getAvatarProfilePic } from '../../utils/ens-utils';
import { AuthContext } from '../../context/AuthContext';
import { useMainnetProvider } from '../../hooks/mainnetprovider/useMainnetProvider';
import humanIcon from '../../assets/images/human.svg';

export default function LeftView(props: DashboardProps) {
    // fetches context api data
    const { state, dispatch } = useContext(GlobalContext);
    const { initialized } = useContext(ConversationContext);
    const { account } = useContext(AuthContext);

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
        if (props.dm3Props.dm3Configuration.showContacts) {
            dispatch({
                type: UiViewStateType.SetSelectedRightView,
                payload: RightViewSelected.Profile,
            });
        }
    };

    // handles starting loader on page load
    useEffect(() => {
        if (!initialized) {
            dispatch({
                type: ModalStateType.LoaderContent,
                payload: 'Fetching contacts...',
            });
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
        dispatch({
            type: UiViewStateType.SetSelectedLeftView,
            payload: LeftViewSelected.Menu,
        });
        const element = document.getElementById('menu-container');
        if (element) {
            element.classList.add('menu-container');
        }
    };

    return (
        <div className="position-relative h-100 d-flex flex-column align-items-start">
            <div
                className={'w-100 height-inherit'.concat(
                    ' ',
                    state.uiView.selectedLeftView === LeftViewSelected.Contacts
                        ? ''
                        : 'display-none',
                )}
            >
                <div className="menu-icon-container">
                    <img
                        src={menuIcon}
                        className="pointer-cursor"
                        alt="menu"
                        onClick={() => openMenuItem()}
                    />
                    {/* Profile icon and address to show in mobile screens */}
                    <div className="mobile-profile-icon">
                        <ConnectButton
                            showBalance={false}
                            accountStatus={{
                                smallScreen: 'avatar',
                                largeScreen: 'full',
                            }}
                        />
                        <img
                            src={profilePic ? profilePic : humanIcon}
                            alt="menu"
                            className="pointer-cursor border-radius-3 default-profile-pic"
                            onClick={() => updateView()}
                        />
                    </div>
                </div>
                <Contacts {...props} />
                <ConfigureProfileBox />
            </div>

            <div
                className={'w-100 h-100'.concat(
                    ' ',
                    state.uiView.selectedLeftView === LeftViewSelected.Menu
                        ? ''
                        : 'display-none',
                )}
            >
                <Menu />
            </div>
        </div>
    );
}
