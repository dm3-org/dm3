import React, { Dispatch } from 'react';
import { accountsReducer } from '../contexts/Accounts';
import { authReducer } from '../contexts/Auth';
import { cacheReducer } from '../contexts/Cache';
import { connectionReducer } from '../contexts/Connection';
import { initialState } from '../contexts/Shared';
import { uiStateReducer } from '../contexts/UiState';
import { userDbReducer } from '../contexts/UserDB';
import { GlobalContextProviderProps } from '../interfaces/context';
import {
    AccountsActions,
    Actions,
    AuthStateActions,
    CacheActions,
    ConnectionActions,
    GlobalState,
    UiStateActions,
    UserDbActions,
    ModalStateActions,
    UiViewStateActions,
} from './enum-type-utils';
import { modalReducer } from '../contexts/Modal';
import { uiViewReducer } from '../contexts/UiView';

// custom context
export const GlobalContext = React.createContext<{
    state: GlobalState;
    dispatch: Dispatch<Actions>;
}>({ state: initialState, dispatch: () => null });

// combined all reducers in single reducer
const mainReducer = (state: GlobalState, action: Actions): GlobalState => ({
    connection: connectionReducer(
        state.connection,
        action as ConnectionActions,
    ),
    cache: cacheReducer(state.cache, action as CacheActions),
    accounts: accountsReducer(state.accounts, action as AccountsActions),
    userDb: userDbReducer(state.userDb, action as UserDbActions),
    uiState: uiStateReducer(state.uiState, action as UiStateActions),
    auth: authReducer(state.auth, action as AuthStateActions),
    uiView: uiViewReducer(state.uiView, action as UiViewStateActions),
    modal: modalReducer(state.modal, action as ModalStateActions),
});

// global context provider to handle state sharing
function GlobalContextProvider(props: GlobalContextProviderProps) {
    const [state, dispatch] = React.useReducer(mainReducer, initialState);

    return (
        /** @ts-ignore */
        <GlobalContext.Provider value={{ state, dispatch }}>
            {props.children}
        </GlobalContext.Provider>
    );
}

export default GlobalContextProvider;
