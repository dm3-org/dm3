import './Home.css';
import DM3 from '../../components/DM3/DM3';
import { Dm3Props } from '../../interfaces/config';
import dm3Logo from '../../assets/images/dm3-logo.png';

export function Home(props: Dm3Props) {
    return (
        <div>
            <div className="logo-container">
                <img className="dm3-logo" src={dm3Logo} alt="DM3 logo" />
            </div>
            <DM3 config={props.config} />
        </div>
    );
}
