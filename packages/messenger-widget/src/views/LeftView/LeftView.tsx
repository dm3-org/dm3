import './LeftView.css';
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
import { startLoader } from '../../components/Loader/Loader';
import Menu from '../../components/Menu/Menu';

export default function LeftView(props: DashboardProps) {
    // fetches context api data
    const { state, dispatch } = useContext(GlobalContext);

    // handles starting loader on page load
    useEffect(() => {
        dispatch({
            type: ModalStateType.LoaderContent,
            payload: 'Fetching contacts...',
        });
        startLoader();
    }, []);

    // method to open menu item
    const openMenuItem = () => {
        dispatch({
            type: UiViewStateType.SetSelectedLeftView,
            payload: LeftViewSelected.Menu,
        });
    };

    return (
        <div className="position-relative h-100 d-flex flex-column align-items-start">
            {state.uiView.selectedLeftView === LeftViewSelected.Contacts ? (
                <>
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
                </>
            ) : (
                <Menu />
            )}
        </div>
    );
}
