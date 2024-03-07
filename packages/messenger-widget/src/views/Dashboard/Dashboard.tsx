import './Dashboard.css';
import { useContext } from 'react';
import LeftView from '../LeftView/LeftView';
import RightView from '../RightView/RightView';
import { DashboardProps } from '../../interfaces/props';
import { GlobalContext } from '../../utils/context-utils';
import {
    MessageActionType,
    RightViewSelected,
} from '../../utils/enum-type-utils';
import { ConfigureProfile } from '../../components/ConfigureProfile/ConfigureProfile';
import DeleteMessage from '../../components/DeleteMessage/DeleteMessage';
import { Preferences } from '../../components/Preferences/Preferences';
import AddConversation from '../../components/AddConversation/AddConversation';

export default function Dashboard(props: DashboardProps) {
    const { state } = useContext(GlobalContext);

    const getRightViewStyleClasses = () => {
        if (props.dm3Props.config.showContacts) {
            return 'p-0 h-100 col-lg-9 col-md-9 col-sm-12 right-view-container-type';
        } else {
            return 'p-0 h-100 col-12 right-view-container-type';
        }
    };

    const getLeftViewStyleClasses = () => {
        if (props.dm3Props.config.showContacts) {
            return 'col-lg-3 col-md-3 col-sm-12 p-0 h-100 left-view-container-type';
        } else {
            return 'col-lg-3 col-md-3 col-sm-12 p-0 h-100 display-none left-view-container-type';
        }
    };

    return (
        <div className="h-100">
            <AddConversation />
            {/* Preferences popup */}
            {state.modal.showPreferencesModal && <Preferences />}

            {/* Configure profile popup */}
            {state.modal.isProfileConfigurationPopupActive && (
                <ConfigureProfile />
            )}

            {/* Delete message confirmation popup */}
            {state.uiView.selectedMessageView.actionType ===
                MessageActionType.DELETE && <DeleteMessage />}

            <div className="row m-0 h-100">
                <div className={getLeftViewStyleClasses()}>
                    <LeftView {...props} />
                </div>

                <div
                    className={getRightViewStyleClasses().concat(
                        state.uiView.selectedRightView ===
                            RightViewSelected.Profile
                            ? ' dashboard-right-view-highlight'
                            : '',
                    )}
                >
                    <RightView
                        hideFunction={props.dm3Props.config.hideFunction}
                        showContacts={props.dm3Props.config.showContacts}
                        defaultContact={props.dm3Props.config.defaultContact}
                    />
                </div>
            </div>
        </div>
    );
}
