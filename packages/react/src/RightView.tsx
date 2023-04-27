import { useContext, useEffect } from 'react';
import 'react-chat-widget/lib/styles.css';
import { GlobalContext } from './GlobalContextProvider';
import Chat from './chat/Chat';
import RightHeader from './header/RightHeader';
import DarkLogo from './logos/DarkLogo';
import { SelectedRightView, UiStateType } from './reducers/UiState';
import { AccountInfo } from './reducers/shared';
import UserInfo from './user-info/UserInfo';

function RightView() {
    const { state, dispatch } = useContext(GlobalContext);

    useEffect(() => {
        switch (state.accounts.accountInfoView) {
            case AccountInfo.DomainConfig:
            case AccountInfo.Contact:
            case AccountInfo.Account:
                dispatch({
                    type: UiStateType.SetSelectedRightView,
                    payload: SelectedRightView.UserInfo,
                });
                break;
            case AccountInfo.None:
            default:
                dispatch({
                    type: UiStateType.SetSelectedRightView,
                    payload: SelectedRightView.Chat,
                });
        }
    }, [state.accounts.accountInfoView]);

    const classes = `col-md-${
        state.uiState.maxLeftView ? '8' : '12'
    } content-container ${
        state.uiState.maxLeftView ? '' : 'content-container-max'
    } h-100 d-flex flex-column`;

    if (
        !state.accounts.selectedContact &&
        state.uiState.selectedRightView === SelectedRightView.Chat
    ) {
        return (
            <div className={classes}>
                <div className="row h-100">
                    <div className="col-md-12 text-center w-100 d-flex  h-100">
                        <div className="align-self-center w-100 d-flex justify-content-center">
                            <DarkLogo secondary={true} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    switch (state.uiState.selectedRightView) {
        case SelectedRightView.Chat:
            return (
                <div className={classes}>
                    <RightHeader />
                    {state.accounts.selectedContact &&
                        state.uiState.selectedRightView ===
                            SelectedRightView.Chat && <Chat />}
                </div>
            );

        case SelectedRightView.UserInfo:
            return (
                <div className={classes}>
                    <RightHeader />
                    <UserInfo
                        account={
                            state.accounts.accountInfoView ===
                            AccountInfo.Account
                                ? state.connection.account!
                                : state.accounts.selectedContact?.account!
                        }
                    />
                </div>
            );

        case SelectedRightView.Error:
        default:
            return (
                <div className={`row`}>
                    <div className="col-md-12 text-center row-space d-flex flex-column">
                        <div className="align-self-center mb-3">
                            <DarkLogo />
                        </div>
                        <strong style={{ color: '#fff' }}>
                            No Ethereum provider detected. Please install a
                            plugin like MetaMask.
                        </strong>
                    </div>
                </div>
            );
    }
}

export default RightView;
