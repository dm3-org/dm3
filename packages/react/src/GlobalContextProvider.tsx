import React, { Dispatch } from 'react';
import { ConnectionActions, connectionReducer } from './reducers/Connection';
import { AccountsActions, accountsReducer } from './reducers/Accounts';
import { GlobalState, initialState } from './reducers/shared';
import { UserDbActions, userDbReducer } from './reducers/UserDB';
import { UiStateActions, uiStateReducer } from './reducers/UiState';
import { CacheActions, cacheReducer } from './reducers/Cache';

export type Actions =
    | ConnectionActions
    | CacheActions
    | AccountsActions
    | UserDbActions
    | UiStateActions;

export const GlobalContext = React.createContext<{
    state: GlobalState;
    dispatch: Dispatch<Actions>;
}>({ state: initialState, dispatch: () => null });

interface GlobalContextProviderProps {
    children: JSX.Element;
}

const mainReducer = (state: GlobalState, action: Actions): GlobalState => ({
    connection: connectionReducer(
        state.connection,
        action as ConnectionActions,
    ),
    cache: cacheReducer(state.cache, action as CacheActions),
    accounts: accountsReducer(state.accounts, action as AccountsActions),
    userDb: userDbReducer(state.userDb, action as UserDbActions),
    uiState: uiStateReducer(state.uiState, action as UiStateActions),
});

function GlobalContextProvider(props: GlobalContextProviderProps) {
    const [state, dispatch] = React.useReducer(mainReducer, initialState);

    return (
        <GlobalContext.Provider value={{ state, dispatch }}>
            {props.children}
        </GlobalContext.Provider>
    );
}

export default GlobalContextProvider;
