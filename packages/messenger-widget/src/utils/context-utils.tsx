import React, { Dispatch } from 'react';

import { connectionReducer } from '../contexts/Connection';
import { modalReducer } from '../contexts/Modal';
import { initialState } from '../contexts/Shared';
import { uiStateReducer } from '../contexts/UiState';
import { uiViewReducer } from '../contexts/UiView';
import { GlobalContextProviderProps } from '../interfaces/context';
import {
    Actions,
    ConnectionActions,
    DM3ConfigurationStateActions,
    GlobalState,
    ModalStateActions,
    UiStateActions,
    UiViewStateActions,
} from './enum-type-utils';
import { DM3Configuration } from '../interfaces/config';
import { dm3ConfigurationReducer } from '../contexts/DM3Configuration';

// custom context
export const GlobalContext = React.createContext<{
    state: GlobalState;
    dispatch: Dispatch<Actions>;
}>({ state: initialState(''), dispatch: () => null });

// combined all reducers in single reducer
const mainReducer = (state: GlobalState, action: Actions): GlobalState => ({
    connection: connectionReducer(
        state.connection,
        action as ConnectionActions,
    ),
    uiState: uiStateReducer(state.uiState, action as UiStateActions),
    uiView: uiViewReducer(state.uiView, action as UiViewStateActions),
    modal: modalReducer(state.modal, action as ModalStateActions),
    dm3Configuration: dm3ConfigurationReducer(
        state.dm3Configuration,
        action as DM3ConfigurationStateActions,
    ),
});

// global context provider to handle state sharing
function GlobalContextProvider(
    props: GlobalContextProviderProps,
    dm3Configuration: DM3Configuration,
) {
    const [state, dispatch] = React.useReducer(
        mainReducer,
        initialState(dm3Configuration.backendUrl),
    );

    return (
        /** @ts-ignore */
        <GlobalContext.Provider value={{ state, dispatch }}>
            {props.children}
        </GlobalContext.Provider>
    );
}

export default GlobalContextProvider;
