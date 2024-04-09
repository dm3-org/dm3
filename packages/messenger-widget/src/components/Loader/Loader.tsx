import './Loader.css';
import { useContext } from 'react';
import loader from '../../assets/images/loader.svg';
import { ModalContext } from '../../context/ModalContext';

export const closeLoader = () => {
    const loader = document.getElementsByClassName('loading')[0] as HTMLElement;
    loader.setAttribute('style', 'display:none !important');
};

export const startLoader = () => {
    const loader = document.getElementsByClassName('loading')[0] as HTMLElement;
    loader.setAttribute('style', 'display:flex !important');
};

export function Loader() {
    const { loaderContent } = useContext(ModalContext);

    return (
        <div className="loading d-flex justify-content-center align-items-center">
            <img className="rotating loader-img" src={loader} alt="loader" />
            <div className="loader-content">{loaderContent}</div>
        </div>
    );
}
