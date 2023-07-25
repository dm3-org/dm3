import React, { useContext, useEffect, useRef, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { GlobalContext } from '../GlobalContextProvider';
import { AccountsType } from '../reducers/Accounts';
import Avatar from '../ui-shared/Avatar';
import { AccountInfo, Contact } from '../reducers/shared';
import useTooltip from '../ui-shared/useTooltip';
import { UserDB, getConversation } from 'dm3-lib-storage';
import { MessageState } from 'dm3-lib-messaging';
import { Connection } from '../web3provider/Web3Provider';
import { getAccountDisplayName, normalizeEnsName } from 'dm3-lib-profile';

interface ContactListProps {
    contact: Contact;
    connection: Connection;
}

function ContactListEntry(props: ContactListProps) {
    const [unreadMessages, setUnreadMessages] = useState<number>(0);
    const [teaser, setTeaser] = useState<string | undefined>();
    const { state, dispatch } = useContext(GlobalContext);
    const tooltipRef = useTooltip(
        props.contact.account.ensName,
        'right',
        25,
        'account-tooltip',
    );

    useEffect(() => {
        if (state.accounts.contacts) {
            const messages = getConversation(
                props.contact.account.ensName,
                state.accounts.contacts.map((contact) => contact.account),
                state.userDb as UserDB,
            );
            const calcUnreadMessages = () => {
                setUnreadMessages(
                    messages.filter(
                        (container) =>
                            container.messageState === MessageState.Send,
                    ).length,
                );
            };
            calcUnreadMessages();

            if (messages.length > 0) {
                const message =
                    messages[messages.length - 1].envelop.message.message!;
                setTeaser(
                    message.slice(0, 25) + (message.length > 25 ? '...' : ''),
                );
            }
        }
    }, [props.contact, state.userDb?.conversations, state.accounts.contacts]);

    const selected =
        state.accounts.selectedContact &&
        normalizeEnsName(props.contact.account.ensName) ===
            normalizeEnsName(state.accounts.selectedContact?.account.ensName);

    return (
        <div
            className={`list-group-item list-group-item-action contact-entry d-flex justify-content-between ${
                selected ? 'contract-entry-selected' : ''
            }`}
            ref={tooltipRef}
            key={props.contact.account.ensName}
            onClick={() => {
                dispatch({
                    type: AccountsType.SetSelectedContact,
                    payload: props.contact,
                });
                dispatch({
                    type: AccountsType.SetAccountInfoView,
                    payload: AccountInfo.None,
                });
            }}
        >
            <div className="d-flex">
                <div className="align-self-center contact-entry-avatar">
                    <Avatar ensName={props.contact.account.ensName} />
                </div>
            </div>
            <div className="w-100 text-start contact-entry-center">
                <div className="row">
                    <div className="col-12">
                        <strong>
                            {getAccountDisplayName(
                                props.contact.account.ensName,
                                25,
                            )}
                        </strong>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12 text-muted teaser">{teaser}</div>
                </div>
            </div>
            <div className="">
                {unreadMessages > 0 && (
                    <span className="badge bg-secondary push-end messages-badge">
                        {unreadMessages}
                    </span>
                )}
            </div>
        </div>
    );
}

export default ContactListEntry;
