/* eslint-disable max-len */
/* eslint-disable no-console */
import { globalConfig } from '@dm3-org/dm3-lib-shared';
import { useContext, useEffect, useState } from 'react';
import loader from '../../assets/images/loader.svg';
import threeDotsIcon from '../../assets/images/three-dots.svg';
import { AuthContext } from '../../context/AuthContext';
import { ConversationContext } from '../../context/ConversationContext';
import { useMainnetProvider } from '../../hooks/mainnetprovider/useMainnetProvider';
import { useTopLevelAlias } from '../../hooks/topLevelAlias/useTopLevelAlias';
import { DashboardProps } from '../../interfaces/props';
import { GlobalContext } from '../../utils/context-utils';
import { RightViewSelected } from '../../utils/enum-type-utils';
import { ContactMenu } from '../ContactMenu/ContactMenu';
import './Contacts.css';
import {
    fetchMessageSizeLimit,
    onContactSelected,
    setContactHeightToMaximum,
    showMenuInBottom,
    updateContactOnAccountChange,
} from './bl';

export function Contacts(props: DashboardProps) {
    // fetches context api data
    const { state, dispatch } = useContext(GlobalContext);
    const { account, deliveryServiceToken } = useContext(AuthContext);
    const { contacts, initialized, setSelectedContactName, selectedContact } =
        useContext(ConversationContext);
    const mainnetProvider = useMainnetProvider();
    const { resolveAliasToTLD } = useTopLevelAlias();

    const [isMenuAlignedAtBottom, setIsMenuAlignedAtBottom] = useState<
        boolean | null
    >(null);

    // fetches sub domain of ENS
    const isAddrEnsName = account?.ensName?.endsWith(
        globalConfig.ADDR_ENS_SUBDOMAIN(),
    );

    // handles contact box view
    useEffect(() => {
        setContactHeightToMaximum(!isAddrEnsName ? true : false);
    }, [account?.ensName]);

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
                () => {},
            );
        }

        // new contact is detected from web socket
        //TODO add websocket listener for add conversation
    }, [state.accounts.contacts]);

    // handles active contact removal
    useEffect(() => {
        if (
            selectedContact !== null &&
            state.uiView.selectedRightView !== RightViewSelected.Chat &&
            state.uiView.selectedRightView !== RightViewSelected.ContactInfo
        ) {
            setSelectedContactName(undefined);
        }
    }, [state.uiView.selectedRightView]);

    // handles UI view on contact select
    useEffect(() => {
        if (selectedContact !== undefined) {
            onContactSelected(state, dispatch, selectedContact.contactDetails);
            //TODO @Bhupesh what is that for
            // setIsMenuAlignedAtBottom(showMenuInBottom(contactSelected));
        }
    }, [selectedContact]);

    useEffect(() => {
        if (
            !props.dm3Props.config.showContacts &&
            props.dm3Props.config.defaultContact &&
            !state.accounts.selectedContact &&
            contacts
        ) {
            //TODO add defaultContact
            // const defaultContactIndex = contacts.findIndex(
            //     (contact) =>
            //         contact.contactDetails &&
            //         contact.contactDetails.account &&
            //         contact.contactDetails.account.ensName ===
            //         props.dm3Props.config.defaultContact,
            // );
            // if (defaultContactIndex > -1) {
            //     setContactSelected(defaultContactIndex);
            // }
        }

        // new conversation is added
        // @Bhupesh what is this for
        // if (
        //     state.modal.addConversation.active &&
        //     !state.modal.addConversation.processed &&
        //     state.cache.contacts
        // ) {
        //     updateSelectedContact(state, dispatch, setContactFromList);
        // }
    }, [contacts]);

    useEffect(() => {
        fetchMessageSizeLimit(mainnetProvider, account!, dispatch);
    }, []);

    /* Hidden content for highlighting css */
    const hiddenData: number[] = Array.from({ length: 22 }, (_, i) => i + 1);

    const scroller = document.getElementById('chat-scroller');

    if (scroller) {
        scroller.addEventListener('scroll', () => {
            if (selectedContact != null) {
                //@Bhupesh what is this for
                // setIsMenuAlignedAtBottom(showMenuInBottom(contactSelected));
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
                contacts.map((data) => {
                    const id = data.contactDetails.account.ensName;
                    return (
                        !data.isHidden && (
                            <div
                                id={`chat-item-id-${id}`}
                                key={id}
                                className={'pointer-cursor width-fill contact-details-container'.concat(
                                    ' ',
                                    selectedContact
                                        ? selectedContact.contactDetails.account
                                              .ensName !== id
                                            ? 'highlight-right-border'
                                            : 'contact-details-container-active'
                                        : '',
                                )}
                                onClick={() =>
                                    setSelectedContactName(data.name)
                                }
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

                                            {/* @Bhupesh what is this cached contacts section for */}
                                            {/* {state.cache.contacts &&
                                                id !== selectedContact?.contactDetails.account.ensName &&
                                                (
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
                                                )} */}

                                            {selectedContact?.contactDetails
                                                .account.ensName === id ? (
                                                selectedContact.message !==
                                                null ? (
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
                                                                        //TODO replace with ID
                                                                        0
                                                                    }
                                                                    isMenuAlignedAtBottom={
                                                                        isMenuAlignedAtBottom ===
                                                                        null
                                                                            ? showMenuInBottom(
                                                                                  selectedContact
                                                                                      .contactDetails
                                                                                      .account
                                                                                      .ensName,
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
                        )
                    );
                })}

            {/* Hidden content for highlighting css */}
            {contacts.length < 10 &&
                hiddenData.map((data) => (
                    <div
                        key={data}
                        className={
                            selectedContact !== null
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
                            selectedContact !== null
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
