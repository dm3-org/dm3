/* eslint-disable no-console */
import { globalConfig } from '@dm3-org/dm3-lib-shared';
import { useContext, useEffect, useState } from 'react';
import loader from '../../assets/images/loader.svg';
import threeDotsIcon from '../../assets/images/three-dots.svg';
import { AuthContext } from '../../context/AuthContext';
import { useMainnetProvider } from '../../hooks/mainnetprovider/useMainnetProvider';
import { useTopLevelAlias } from '../../hooks/topLevelAlias/useTopLevelAlias';
import { DashboardProps } from '../../interfaces/props';
import { ContactPreview } from '../../interfaces/utils';
import { GlobalContext } from '../../utils/context-utils';
import {
    CacheType,
    ModalStateType,
    RightViewSelected,
} from '../../utils/enum-type-utils';
import { ContactMenu } from '../ContactMenu/ContactMenu';
import { closeLoader, startLoader } from '../Loader/Loader';
import './Contacts.css';
import {
    addNewConversationFound,
    fetchAndUpdateUnreadMsgCount,
    fetchMessageSizeLimit,
    onContactSelected,
    resetContactListOnHide,
    setContactHeightToMaximum,
    setContactIndexSelectedFromCache,
    setContactList,
    showMenuInBottom,
    updateContactDetailsOfNewContact,
    updateContactOnAccountChange,
    updateSelectedContact,
    updateUnreadMsgCount,
} from './bl';
import { ConversationContext } from '../../context/ConversationContext';
import { initialState } from '../../contexts/Shared';

export function Contacts(props: DashboardProps) {
    // fetches context api data
    const { state, dispatch } = useContext(GlobalContext);
    const { account, deliveryServiceToken } = useContext(AuthContext);
    const { contacts: contacts, initialized } = useContext(ConversationContext);
    const mainnetProvider = useMainnetProvider();
    const { resolveAliasToTLD } = useTopLevelAlias();

    // local states to handle contact list and active contact
    const [contactSelected, setContactSelected] = useState<number | null>(null);

    const [isMenuAlignedAtBottom, setIsMenuAlignedAtBottom] = useState<
        boolean | null
    >(null);

    // sets contact selected from the list
    const setContactFromList = (index: number | null) => {
        setContactSelected(index);
    };

    // fetches sub domain of ENS
    const isAddrEnsName = account?.ensName?.endsWith(
        globalConfig.ADDR_ENS_SUBDOMAIN(),
    );

    // handles contact box view
    useEffect(() => {
        setContactHeightToMaximum(!isAddrEnsName ? true : false);
    }, [account?.ensName]);

    // handles any change in socket or session
    useEffect(() => {
        if (!initialized) {
            dispatch({
                type: ModalStateType.LoaderContent,
                payload: 'Fetching contacts...',
            });
            console.log('start loader');
            return startLoader();
        }

        closeLoader();
    }, [initialized]);

    // handles change in accounts
    useEffect(() => {
        if (
            !state.accounts.selectedContact &&
            (state.uiView.selectedRightView === RightViewSelected.Chat ||
                state.uiView.selectedRightView === RightViewSelected.Default)
        ) {
        }

        if (
            state.modal.addConversation.active &&
            state.modal.addConversation.processed
        ) {
            //TODO check what is this
            updateContactOnAccountChange(
                state,
                mainnetProvider,
                dispatch,
                contacts,
                () => {},
                setContactFromList,
            );
        }

        // new contact is detected from web socket
        //TODO add websocket listener for add conversation
    }, [state.accounts.contacts]);

    // handles contact selected
    useEffect(() => {
        //TODO add click handler to select contact
    }, [state.accounts.selectedContact]);

    // handles active contact removal
    useEffect(() => {
        if (
            contactSelected !== null &&
            state.uiView.selectedRightView !== RightViewSelected.Chat &&
            state.uiView.selectedRightView !== RightViewSelected.ContactInfo
        ) {
            setContactSelected(null);
        }
    }, [state.uiView.selectedRightView]);

    // handles UI view on contact select
    useEffect(() => {
        if (contactSelected !== null) {
            onContactSelected(
                state,
                dispatch,
                contacts[contactSelected].contactDetails,
            );
            setIsMenuAlignedAtBottom(showMenuInBottom(contactSelected));
            //  updateUnreadMsgCount(state, dispatch, contactSelected);
        }
    }, [contactSelected]);

    useEffect(() => {
        if (
            !props.dm3Props.config.showContacts &&
            props.dm3Props.config.defaultContact &&
            !state.accounts.selectedContact &&
            contacts
        ) {
            const defaultContactIndex = contacts.findIndex(
                (contact) =>
                    contact.contactDetails &&
                    contact.contactDetails.account &&
                    contact.contactDetails.account.ensName ===
                        props.dm3Props.config.defaultContact,
            );
            if (defaultContactIndex > -1) {
                setContactSelected(defaultContactIndex);
            }
        }

        // new conversation is added
        if (
            state.modal.addConversation.active &&
            !state.modal.addConversation.processed &&
            state.cache.contacts
        ) {
            updateSelectedContact(state, dispatch, setContactFromList);
        }
    }, [contacts]);

    useEffect(() => {
        fetchMessageSizeLimit(mainnetProvider, account!, dispatch);
    }, []);

    /* Hidden content for highlighting css */
    const hiddenData: number[] = Array.from({ length: 22 }, (_, i) => i + 1);

    const scroller = document.getElementById('chat-scroller');

    if (scroller) {
        scroller.addEventListener('scroll', () => {
            if (contactSelected != null) {
                setIsMenuAlignedAtBottom(showMenuInBottom(contactSelected));
            }
        });
    }

    return (
        <div
            id="chat-scroller"
            className={'contacts-scroller width-fill'.concat(
                ' ',
                contacts.length > 6 ? 'scroller-active' : 'scroller-hidden',
            )}
        >
            {contacts.length > 0 &&
                contacts.map(
                    (data, index) =>
                        !data.isHidden && (
                            <div
                                id={`chat-item-id-${index}`}
                                key={index}
                                className={'pointer-cursor width-fill contact-details-container'.concat(
                                    ' ',
                                    contactSelected != null
                                        ? contactSelected !== index
                                            ? 'highlight-right-border'
                                            : 'contact-details-container-active'
                                        : '',
                                )}
                                onClick={() => setContactSelected(index)}
                            >
                                <div
                                    className="col-12 d-flex flex-row align-items-center 
                                justify-content-start width-fill"
                                >
                                    <div>
                                        <img
                                            src={data.image}
                                            alt="profile-pic"
                                            className="border-radius-6 pic"
                                        />
                                    </div>

                                    <div className="d-flex flex-column font-size-12 width-fill content">
                                        <div
                                            className="d-flex flex-row font-weight-500 justify-content-between 
                                    text-primary-color"
                                        >
                                            <div
                                                className="pb-1"
                                                title={
                                                    data.contactDetails
                                                        ? resolveAliasToTLD(
                                                              data
                                                                  .contactDetails
                                                                  .account
                                                                  .ensName,
                                                          )
                                                        : ''
                                                }
                                            >
                                                <p className="display-name">
                                                    {resolveAliasToTLD(
                                                        data.name,
                                                    )}
                                                </p>
                                            </div>

                                            {state.cache.contacts &&
                                                index !== contactSelected &&
                                                state.cache.contacts[index] &&
                                                state.cache.contacts[index]
                                                    .unreadMsgCount > 0 && (
                                                    <div>
                                                        <div className="msg-count">
                                                            {
                                                                state.cache
                                                                    .contacts[
                                                                    index
                                                                ].unreadMsgCount
                                                            }
                                                        </div>
                                                    </div>
                                                )}

                                            {contactSelected === index ? (
                                                !state.modal.addConversation
                                                    .active ? (
                                                    <div>
                                                        <div className="action-container">
                                                            <img
                                                                className="action-dot"
                                                                src={
                                                                    threeDotsIcon
                                                                }
                                                                alt="action"
                                                            />
                                                            {
                                                                <ContactMenu
                                                                    contactDetails={
                                                                        data
                                                                    }
                                                                    index={
                                                                        index
                                                                    }
                                                                    isMenuAlignedAtBottom={
                                                                        isMenuAlignedAtBottom ===
                                                                        null
                                                                            ? showMenuInBottom(
                                                                                  contactSelected,
                                                                              )
                                                                            : isMenuAlignedAtBottom
                                                                    }
                                                                />
                                                            }
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="pe-2">
                                                        <img
                                                            className="rotating"
                                                            src={loader}
                                                            alt="loader"
                                                        />
                                                    </div>
                                                )
                                            ) : (
                                                <></>
                                            )}
                                        </div>

                                        <div className="text-primary-color pe-3">
                                            <p className="contacts-msg">
                                                {data.message}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ),
                )}

            {/* Hidden content for highlighting css */}
            {contacts.length < 10 &&
                hiddenData.map((data) => (
                    <div
                        key={data}
                        className={
                            contactSelected !== null
                                ? 'highlight-right-border'
                                : 'highlight-right-border-none'
                        }
                    >
                        <div className="hidden-data"></div>
                    </div>
                ))}

            {contacts.length >= 10 &&
                hiddenData.slice(11).map((data) => (
                    <div
                        key={data}
                        className={
                            contactSelected !== null
                                ? 'highlight-right-border'
                                : 'highlight-right-border-none'
                        }
                    >
                        <div className="hidden-data"></div>
                    </div>
                ))}
        </div>
    );
}
