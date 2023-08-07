import { useEffect } from 'react';
import detailsIcon from '../../assets/images/details.svg';
import hideIcon from '../../assets/images/hide.svg';
import { ContactMenu } from '../../interfaces/props';

export function ContactMenu(props: ContactMenu) {
    const onClickOfShowDetails = () => {
        props.closeContactMenu();
    };

    const onClickOfHideContact = () => {
        props.closeContactMenu();
    };

    return (
        <div className="dropdown-content d-flex font-size-14 font-weight-400">
            <div
                className="d-flex align-items-center justify-content-start"
                onClick={() => onClickOfShowDetails()}
            >
                <img src={detailsIcon} alt="details" className="me-2" />
                Show Details
            </div>
            <div
                className="d-flex align-items-center justify-content-start"
                onClick={() => onClickOfHideContact()}
            >
                <img src={hideIcon} alt="hide" className="me-2" />
                Hide Contact
            </div>
        </div>
    );
}
