import './Home.css';
import dm3Logo from '../../assets/images/dm3-logo.png';
import { Dm3Props } from '../../interfaces/config';

export function Home(props: Dm3Props) {
    return (
        <div>
            <div className="logo-container">
                <img className="dm3-logo" src={dm3Logo} alt="DM3 logo" />
            </div>
        </div>
    );
}
