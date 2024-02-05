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
} from './bl';
import { MessageContext } from '../../context/MessageContext';

export function Contacts(props: DashboardProps) {
    // fetches context api data
    const { state, dispatch } = useContext(GlobalContext);
    const { account } = useContext(AuthContext);
    const { contacts, setSelectedContactName, selectedContact } =
        useContext(ConversationContext);
    const mainnetProvider = useMainnetProvider();
    const { resolveAliasToTLD } = useTopLevelAlias();

    const { getMessages } = useContext(MessageContext);

    const [isMenuAlignedAtBottom, setIsMenuAlignedAtBottom] = useState<
        boolean | null
    >(null);

    // fetches sub domain of ENS
    const isAddrEnsName = account?.ensName?.endsWith(
        globalConfig.ADDR_ENS_SUBDOMAIN(),
    );

    // handles contact box view
    //Can be removed once responsive design has been implemented @Bhupesh
    useEffect(() => {
        setContactHeightToMaximum(!isAddrEnsName ? true : false);
    }, [account?.ensName]);

    // handles active contact removal
    // move to a better place (profile window) and Contact Info
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
            setIsMenuAlignedAtBottom(showMenuInBottom(selectedContact.name));
        }
    }, [selectedContact]);

    useEffect(() => {
        if (
            !props.dm3Props.config.showContacts &&
            props.dm3Props.config.defaultContact &&
            !state.accounts.selectedContact &&
            contacts
        ) {
            //TODO when used as a widget, there is no contact list so the user can
            //not select a contact and has to chat with the default contact
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
    }, [contacts]);

    useEffect(() => {
        fetchMessageSizeLimit(mainnetProvider, account!, dispatch);
    }, []);

    /* Hidden content for highlighting css */
    const hiddenData: number[] = Array.from({ length: 22 }, (_, i) => i + 1);

    const scroller = document.getElementById('chat-scroller');

    //If a selected contact is selected and the menu is open, we want to align the menu at the bottom
    if (scroller) {
        scroller.addEventListener('scroll', () => {
            if (selectedContact != null) {
                setIsMenuAlignedAtBottom(
                    showMenuInBottom(selectedContact.name),
                );
            }
        });
    }

    const getPreviewMessage = (contact: string) => {
        const messages = getMessages(contact);
        if (messages?.length > 0) {
            return messages[messages.length - 1].envelop.message.message ?? '';
        }
        return '';
    };

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
                    const unreadMessageCount = data.messageCount;

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
                                onClick={() => {
                                    console.log(
                                        'set selected contact ',
                                        data.contactDetails.account.ensName,
                                    );
                                    setSelectedContactName(
                                        data.contactDetails.account.ensName,
                                    );
                                }}
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
                                            {id !==
                                                selectedContact?.contactDetails
                                                    .account.ensName &&
                                                unreadMessageCount > 0 && (
                                                    <div>
                                                        <div className="msg-count">
                                                            {unreadMessageCount}
                                                        </div>
                                                    </div>
                                                )}

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
                                                {getPreviewMessage(id)}
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
