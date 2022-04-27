import './Feed.css';
import * as Lib from '../../lib';
import Avatar, { SpecialSize } from '../ui-shared/Avatar';
import { useContext } from 'react';
import { GlobalContext } from '../GlobalContextProvider';
import { SelectedRightView, UiStateType } from '../reducers/UiState';
import { AccountsType } from '../reducers/Accounts';
import { AccountInfo } from '../reducers/shared';

interface FeedMessageElementProps {
    envelop: Lib.PublicEnvelop;
}

function FeedMessageElement(props: FeedMessageElementProps) {
    const { state, dispatch } = useContext(GlobalContext);
    const time = new Date(props.envelop.message.timestamp);
    const clickOnContact = () => {
        if (
            state.connection.account &&
            Lib.formatAddress(props.envelop.message.from) ===
                Lib.formatAddress(state.connection.account.address)
        ) {
            dispatch({
                type: AccountsType.SetAccountInfoView,
                payload: AccountInfo.Account,
            });
            dispatch({
                type: UiStateType.SetSelectedRightView,
                payload: SelectedRightView.UserInfo,
            });
        } else if (state.accounts.contacts) {
            const contact = state.accounts.contacts.find(
                (account) =>
                    Lib.formatAddress(account.address) ===
                    Lib.formatAddress(props.envelop.message.from),
            );
            dispatch({
                type: AccountsType.SetSelectedContact,
                payload: contact,
            });
            dispatch({
                type: UiStateType.SetSelectedRightView,
                payload: SelectedRightView.Chat,
            });
        }
    };
    return (
        <div className="mt-3  feed-element">
            <div className="p-2 ps-3 row">
                <div className=" col-12 d-flex justify-content-start">
                    <div className="h-100 ">
                        <div className="mt-1">
                            <Avatar
                                accountAddress={props.envelop.message.from}
                                specialSize={SpecialSize.Md}
                            />
                        </div>
                    </div>
                    <div className="ms-2">
                        <div className="row">
                            <div className="col-12">
                                <strong
                                    onClick={clickOnContact}
                                    className="contact-name"
                                >
                                    {Lib.getAccountDisplayName(
                                        props.envelop.message.from,
                                        state.ensNames,
                                    )}
                                </strong>{' '}
                                <span className="text-muted small">
                                    {time.toLocaleDateString()}{' '}
                                    {time.toLocaleTimeString()}
                                </span>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-12">
                                {props.envelop.message.message}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FeedMessageElement;
