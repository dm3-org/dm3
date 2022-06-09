import React, { useContext, useRef, useState } from 'react';
import { GlobalContext } from '../GlobalContextProvider';
import { UiStateType } from '../reducers/UiState';
import Icon from '../ui-shared/Icon';
import './Start.css';

function Start() {
    const { state, dispatch } = useContext(GlobalContext);
    return (
        <button
            className={`start-btn`}
            onClick={() => dispatch({ type: UiStateType.ToggleShow })}
            type="button"
        >
            <Icon iconClass="fas fa-envelope" />
        </button>
    );
}

export default Start;
