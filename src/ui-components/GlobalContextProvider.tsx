import React, { Dispatch } from 'react';
import { ConnectionActions, connectionReducer } from './reducers/Connection';
import { EnsNamesActions, ensNamesReducer } from './reducers/EnsNames';
import { AccountsActions, accountsReducer } from './reducers/Accounts';
import { GlobalState, initialState } from './reducers/shared';
import { UserDbActions, userDbReducer } from './reducers/UserDB';

type Actions =
    | ConnectionActions
    | EnsNamesActions
    | AccountsActions
    | UserDbActions;

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
    ensNames: ensNamesReducer(state.ensNames, action as EnsNamesActions),
    accounts: accountsReducer(state.accounts, action as AccountsActions),
    userDb: userDbReducer(state.userDb, action as UserDbActions),
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
