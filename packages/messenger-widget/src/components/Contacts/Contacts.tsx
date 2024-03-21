import { useContext, useEffect, useState } from 'react';
import loader from '../../assets/images/loader.svg';
import threeDotsIcon from '../../assets/images/three-dots.svg';
import { ConversationContext } from '../../context/ConversationContext';
import { MessageContext } from '../../context/MessageContext';
import { DashboardProps } from '../../interfaces/props';
import { GlobalContext } from '../../utils/context-utils';
import {
    RightViewSelected,
    UiViewStateType,
} from '../../utils/enum-type-utils';
import { ContactMenu } from '../ContactMenu/ContactMenu';
import './Contacts.css';
import { showMenuInBottom } from './bl';
import { getAccountDisplayName } from '@dm3-org/dm3-lib-profile';
import { ContactPreview } from '../../interfaces/utils';

export function Contacts(props: DashboardProps) {
    // fetches context api data
    const { state, dispatch } = useContext(GlobalContext);
    const { contacts, setSelectedContactName, selectedContact } =
        useContext(ConversationContext);

    const { getMessages, getUnreadMessageCount } = useContext(MessageContext);
    const [isMenuAlignedAtBottom, setIsMenuAlignedAtBottom] = useState<
        boolean | null
    >(null);

    // handles active contact removal
    // move to a better place (profile window) and Contact Info
    useEffect(() => {
        if (
            selectedContact &&
            state.uiView.selectedRightView !== RightViewSelected.Chat &&
            state.uiView.selectedRightView !== RightViewSelected.ContactInfo
        ) {
            setSelectedContactName(undefined);
        }
    }, [state.uiView.selectedRightView]);

    useEffect(() => {
        if (
            !props.dm3Props.config.showContacts &&
            props.dm3Props.config.defaultContact &&
            contacts
        ) {
            // set the default contact
            setSelectedContactName(props.dm3Props.config.defaultContact);

            // filter out the default contact from contact list
            const defContact = contacts.filter(
                (data) => data.name === props.dm3Props.config.defaultContact,
            );

            if (defContact.length) {
                // set the contact by its ensName found in contact list
                setSelectedContactName(
                    defContact[0].contactDetails.account.ensName,
                );
            }

            // show chat screen
            dispatch({
                type: UiViewStateType.SetSelectedRightView,
                payload: RightViewSelected.Chat,
            });
        }
    }, [contacts]);

    const filterDuplicateContacts = (contacts: ContactPreview[]) => {
        const uniqueContacts = contacts.filter(
            (contact: any, index: number, self: any) =>
                index ===
                self.findIndex(
                    (t: any) =>
                        t.contactDetails.account.ensName ===
                        contact.contactDetails.account.ensName,
                ),
        );
        return uniqueContacts;
    };

    /* Hidden content for highlighting css */
    const hiddenData: number[] = Array.from({ length: 22 }, (_, i) => i + 1);

    const scroller = document.getElementById('chat-scroller');

    //If a selected contact is selected and the menu is open, we want to align the menu at the bottom
    if (scroller) {
        scroller.addEventListener('scroll', () => {
            if (selectedContact) {
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
                filterDuplicateContacts(contacts).map((data) => {
                    const id = data.contactDetails.account.ensName;
                    const unreadMessageCount = getUnreadMessageCount(id);

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
                                    setSelectedContactName(
                                        data.contactDetails.account.ensName,
                                    );
                                    if (
                                        state.uiView.selectedRightView !==
                                        RightViewSelected.Chat
                                    ) {
                                        // show chat screen
                                        dispatch({
                                            type: UiViewStateType.SetSelectedRightView,
                                            payload: RightViewSelected.Chat,
                                        });
                                    }
                                    setIsMenuAlignedAtBottom(
                                        showMenuInBottom(
                                            data.contactDetails.account.ensName,
                                        ),
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
                                                        ? data.contactDetails
                                                              .account.ensName
                                                        : ''
                                                }
                                            >
                                                <p className="display-name">
                                                    {getAccountDisplayName(
                                                        data.name,
                                                        25,
                                                    )}
                                                </p>
                                            </div>

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
                            selectedContact
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
                            selectedContact
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
