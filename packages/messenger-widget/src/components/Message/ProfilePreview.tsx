import { useContext } from 'react';
import './Message.css';
import { UiViewContext } from '../../context/UiViewContext';
import { RightViewSelected } from '../../utils/enum-type-utils';
import { closeContactMenu } from '../../utils/common-utils';
import { ConversationContext } from '../../context/ConversationContext';

export interface ProfilePreviewProps {
    picture: string;
    name: string;
    ownMessage: boolean;
}

export function ProfilePreview(props: ProfilePreviewProps) {
    const { setSelectedRightView } = useContext(UiViewContext);
    const { setSelectedContactName } = useContext(ConversationContext);

    // method to open the profile of selected account
    const openProfile = () => {
        // if our own profile icon is clicked
        if (props.ownMessage) {
            // select and open profile component
            setSelectedRightView(RightViewSelected.Profile);
            // unselect the contact
            setSelectedContactName(undefined);
            return;
        }
        // open contact info of the selected contact
        setSelectedRightView(RightViewSelected.ContactInfo);
        // close the contact menu
        closeContactMenu();
    };

    return (
        <div className="d-flex align-items-center">
            {/* profile picture of the account or contact selected */}
            <img
                className="chat-profile-pic mb-1 pointer-cursor"
                src={props.picture}
                onClick={() => openProfile()}
            />
            {/* Name of the account or contact selected */}
            <div
                className="ms-2 font-size-12 font-weight-800 pointer-cursor"
                onClick={() => openProfile()}
            >
                {props.name.length > 16 ? props.name.slice(0, 16) : props.name}
            </div>
        </div>
    );
}
