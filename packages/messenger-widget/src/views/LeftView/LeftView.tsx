import './LeftView.css';
import { Contacts } from '../../components/Contacts/Contacts';
import menuIcon from '../../assets/images/menu.svg';
import ConfigureProfileBox from '../../components/ConfigureProfileBox/ConfigureProfileBox';
import { DashboardProps } from '../../interfaces/props';
import { GlobalContext } from '../../utils/context-utils';
import { useContext, useEffect } from 'react';
import { ModalStateType } from '../../utils/enum-type-utils';
import { startLoader } from '../../components/Loader/Loader';

export default function LeftView(props: DashboardProps) {
    // fetches context api data
    const { dispatch } = useContext(GlobalContext);

    useEffect(() => {
        dispatch({
            type: ModalStateType.LoaderContent,
            payload: 'Fetching contacts...',
        });
        startLoader();
    }, []);

    return (
        <div className="position-relative h-auto d-flex flex-column align-items-start">
            <div className="menu-icon-container">
                <img src={menuIcon} className="pointer-cursor" alt="menu" />
            </div>
            <Contacts {...props} />
            <ConfigureProfileBox />
        </div>
    );
}
