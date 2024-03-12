/* eslint-disable no-console */
import { useContext } from 'react';
import detailsIcon from '../../assets/images/details.svg';
import hideIcon from '../../assets/images/hide.svg';
import { IContactMenu } from '../../interfaces/props';
import { GlobalContext } from '../../utils/context-utils';
import {
    RightViewSelected,
    UiViewStateType,
} from '../../utils/enum-type-utils';

import { ConversationContext } from '../../context/ConversationContext';
import { closeContactMenu } from '../../utils/common-utils';

export function ContactMenu(props: IContactMenu) {
    const { dispatch } = useContext(GlobalContext);
    const { hideContact } = useContext(ConversationContext);

    const onClickOfShowDetails = () => {
        dispatch({
            type: UiViewStateType.SetSelectedRightView,
            payload: RightViewSelected.ContactInfo,
        });
        closeContactMenu();
    };

    const onClickOfHideContact = () => {
        hideContact(props.contactDetails.contactDetails.account.ensName);
        //Close the message Modal and show the default one instead
        dispatch({
            type: UiViewStateType.SetSelectedRightView,
            payload: RightViewSelected.Default,
        });
        closeContactMenu();
    };

    return (
        <div
            className={'dropdown-content font-size-14 font-weight-400'.concat(
                ' ',
                props.isMenuAlignedAtBottom ? '' : 'dropdown-content-top-align',
            )}
        >
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
