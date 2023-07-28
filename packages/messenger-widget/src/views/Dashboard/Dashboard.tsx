import Storage from '../../components/Storage/Storage';
import './Dashboard.css';

export default function Dashboard() {
    return (
        <div className="dashboard">
            <Storage />
            <div className="row m-0 height-fill">
                <div className="col-lg-3 col-md-3 col-sm-12 p-0"></div>
                <div className="col-lg-9 col-md-9 col-sm-12 p-0 h-auto"></div>
            </div>
        </div>
    );
}
