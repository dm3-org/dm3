import './Dashboard.css';
import { useContext } from 'react';
import LeftView from '../LeftView/LeftView';
import RightView from '../RightView/RightView';
import {
    MessageActionType,
    RightViewSelected,
} from '../../utils/enum-type-utils';
import DeleteMessage from '../../components/DeleteMessage/DeleteMessage';
import { Preferences } from '../../components/Preferences/Preferences';
import AddConversation from '../../components/AddConversation/AddConversation';
import { DM3ConfigurationContext } from '../../context/DM3ConfigurationContext';
import { ConversationContext } from '../../context/ConversationContext';
import { MOBILE_SCREEN_WIDTH } from '../../utils/common-utils';
import { UiViewContext } from '../../context/UiViewContext';
import { ModalContext } from '../../context/ModalContext';

export default function Dashboard() {
    const { screenWidth, dm3Configuration } = useContext(
        DM3ConfigurationContext,
    );
    const { selectedRightView, messageView } = useContext(UiViewContext);
    const { selectedContact } = useContext(ConversationContext);
    const { showPreferencesModal, showProfileConfigurationModal } =
        useContext(ModalContext);

    const getRightViewStyleClasses = () => {
        if (dm3Configuration.showContacts) {
            return screenWidth < MOBILE_SCREEN_WIDTH
                ? 'p-0 h-100 col-12 right-view-container-type'
                : 'p-0 h-100 col-lg-9 col-md-9 col-sm-12 right-view-container-type';
        } else {
            return 'p-0 h-100 col-12 right-view-container-type';
        }
    };

    const getLeftViewStyleClasses = () => {
        if (dm3Configuration.showContacts) {
            return screenWidth < MOBILE_SCREEN_WIDTH
                ? 'col-12 p-0 h-100 left-view-container-type'
                : 'col-lg-3 col-md-3 col-sm-12 p-0 h-100 left-view-container-type';
        } else {
            return 'col-lg-3 col-md-3 col-sm-12 p-0 h-100 display-none left-view-container-type';
        }
    };

    return (
        <div className="h-100">
            <AddConversation />

            {/* Preferences popup */}
            {(showPreferencesModal || showProfileConfigurationModal) && (
                <Preferences />
            )}

            {/* Delete message confirmation popup */}
            {messageView.actionType === MessageActionType.DELETE && (
                <DeleteMessage />
            )}

            {/* Mobile screen UI */}
            {screenWidth < MOBILE_SCREEN_WIDTH ? (
                <div className="row m-0 h-100">
                    {!selectedContact &&
                        selectedRightView !== RightViewSelected.Profile &&
                        selectedRightView !== RightViewSelected.ContactInfo && (
                            <div className={getLeftViewStyleClasses()}>
                                <LeftView />
                            </div>
                        )}

                    {(selectedRightView === RightViewSelected.Profile ||
                        selectedRightView === RightViewSelected.ContactInfo ||
                        selectedContact) && (
                        <div className={getRightViewStyleClasses()}>
                            <RightView />
                        </div>
                    )}
                </div>
            ) : (
                <div className="row m-0 h-100">
                    <div className={getLeftViewStyleClasses()}>
                        <LeftView />
                    </div>

                    <div
                        className={getRightViewStyleClasses().concat(
                            ' ',
                            selectedRightView === RightViewSelected.Profile &&
                                dm3Configuration.showContacts
                                ? 'dashboard-right-view-highlight'
                                : '',
                        )}
                    >
                        <RightView />
                    </div>
                </div>
            )}
        </div>
    );
}
