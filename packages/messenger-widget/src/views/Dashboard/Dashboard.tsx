import './Dashboard.css';
import { useContext } from 'react';
import LeftView from '../LeftView/LeftView';
import RightView from '../RightView/RightView';
import Storage from '../../components/Storage/Storage';
import { DashboardProps } from '../../interfaces/props';
import { GlobalContext } from '../../utils/context-utils';
import { RightViewSelected } from '../../utils/enum-type-utils';
import { ConfigureProfile } from '../../components/ConfigureProfile/ConfigureProfile';

export default function Dashboard(props: DashboardProps) {
    const { state } = useContext(GlobalContext);

    return (
        <div className="h-auto">
            <Storage />
            {state.modal.isProfileConfigurationPopupActive && (
                <ConfigureProfile />
            )}
            <div className="row m-0 h-auto">
                <div className="col-lg-3 col-md-3 col-sm-12 p-0">
                    <LeftView {...props} />
                </div>
                <div
                    className={
                        'col-lg-9 col-md-9 col-sm-12 p-0 h-auto' +
                        (state.uiView.selectedRightView ===
                        RightViewSelected.Profile
                            ? ' dashboard-right-view-highlight'
                            : '')
                    }
                >
                    <RightView />
                </div>
            </div>
        </div>
    );
}
