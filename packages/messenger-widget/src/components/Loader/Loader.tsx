/* eslint-disable no-console */
import './Loader.css';
import { useContext } from 'react';
import loader from '../../assets/images/loader.svg';
import { GlobalContext } from '../../utils/context-utils';

export const closeLoader = () => {
    console.log('stop loader');
    const loader = document.getElementsByClassName('loading')[0] as HTMLElement;
    loader.setAttribute('style', 'display:none !important');
};

export const startLoader = () => {
    console.log('start loader');
    const loader = document.getElementsByClassName('loading')[0] as HTMLElement;
    loader.setAttribute('style', 'display:flex !important');
};

export function Loader() {
    const { state } = useContext(GlobalContext);

    return (
        <div>
            <div className="loading d-flex justify-content-center align-items-center">
                <img
                    className="rotating loader-img"
                    src={loader}
                    alt="loader"
                />
                <div className="loader-content">
                    {state.modal.loaderContent}
                </div>
            </div>
        </div>
    );
}
