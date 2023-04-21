import { useContext, useState } from 'react';
import { GlobalContext } from '../GlobalContextProvider';
import { UiStateType } from '../reducers/UiState';

import './Start.css';

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
                src={'favicon.png'}
                className="align-self-center"
            />
        </button>
    );
}

export default Start;
