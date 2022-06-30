import React, { useContext, useState } from 'react';
import { GlobalContext } from '../GlobalContextProvider';
import { UiStateType } from '../reducers/UiState';

import './Start.css';
import WhiteLogo from '../assets/ENS-Mail_Signet_blue-white.svg';
import GrayLogo from '../assets/ENS-Mail_Signet_blue-gray.svg';

function Start() {
    const { state, dispatch } = useContext(GlobalContext);
    const [hover, setHover] = useState(false);
    const brightness = hover ? 'brightness(80%)' : 'brightness(95%)';
    return (
        <button
            className={`start-btn d-flex justify-content-center`}
            onClick={() => dispatch({ type: UiStateType.ToggleShow })}
            type="button"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <img
                style={{
                    width: '100%',
                    filter:
                        'drop-shadow(0px 0px 5px rgb(0 0 0 / 0.4)) ' +
                        brightness,
                }}
                src={hover ? GrayLogo : WhiteLogo}
                className="align-self-center"
            />
        </button>
    );
}

export default Start;
