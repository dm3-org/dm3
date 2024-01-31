import { Contacts } from '../../components/Contacts/Contacts';
import menuIcon from '../../assets/images/menu.svg';
import ConfigureProfileBox from '../../components/ConfigureProfileBox/ConfigureProfileBox';
import { DashboardProps } from '../../interfaces/props';
import { GlobalContext } from '../../utils/context-utils';
import { useContext, useEffect } from 'react';
import {
    LeftViewSelected,
    ModalStateType,
    UiViewStateType,
} from '../../utils/enum-type-utils';
import { closeLoader, startLoader } from '../../components/Loader/Loader';
import Menu from '../../components/Menu/Menu';
import { ConversationContext } from '../../context/ConversationContext';

export default function LeftView(props: DashboardProps) {
    // fetches context api data
    const { state, dispatch } = useContext(GlobalContext);
    const { initialized } = useContext(ConversationContext);

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
                className={'w-100 '.concat(
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
                </div>
                <Contacts {...props} />
                <ConfigureProfileBox />
            </div>

            <div
                className={'w-100 h-100'.concat(
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
