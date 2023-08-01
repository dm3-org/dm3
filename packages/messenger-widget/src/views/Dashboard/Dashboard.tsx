import './Dashboard.css';
import { useContext } from 'react';
import LeftView from '../../components/LeftView/LeftView';
import RightView from '../../components/RightView/RightView';
import Storage from '../../components/Storage/Storage';
import { DashboardProps } from '../../interfaces/props';
import { GlobalContext } from '../../utils/context-utils';

export default function Dashboard(props: DashboardProps) {

    const { state } = useContext(GlobalContext);

    return (
        <div className="h-auto">
            <Storage />
            <div className="row m-0 h-auto">
                <div className="col-lg-3 col-md-3 col-sm-12 p-0">
                    <LeftView />
                </div>
                <div className={"col-lg-9 col-md-9 col-sm-12 p-0 h-auto" +
                    (state.rightView.showProfile ? " dashboard-right-view-highlight" : "")}>
                    <RightView />
                </div>
            </div>
        </div>
    );
}
