import './Contacts.css';
import { useContext, useEffect, useState } from 'react';
import loader from '../../assets/images/loader.svg';
import threeDotsIcon from '../../assets/images/three-dots.svg';
import { ConversationContext } from '../../context/ConversationContext';
import { MessageContext } from '../../context/MessageContext';
import {
    MessageActionType,
    RightViewSelected,
} from '../../utils/enum-type-utils';
import { ContactMenu } from '../ContactMenu/ContactMenu';
import { showMenuInBottom } from './bl';
import {
    getAccountDisplayName,
    normalizeEnsName,
} from '@dm3-org/dm3-lib-profile';
import { ContactPreview } from '../../interfaces/utils';
import { DM3ConfigurationContext } from '../../context/DM3ConfigurationContext';
import { UiViewContext } from '../../context/UiViewContext';
import { ModalContext } from '../../context/ModalContext';
import InfiniteScroll from 'react-infinite-scroll-component';

export function Contacts() {
    const { dm3Configuration } = useContext(DM3ConfigurationContext);
    const { messages, getMessages, getUnreadMessageCount, contactIsLoading } =
        useContext(MessageContext);
    const { selectedRightView, setSelectedRightView, setSelectedLeftView } =
        useContext(UiViewContext);
    const {
        contacts,
        setSelectedContactName,
        selectedContact,
        loadMoreConversations,
    } = useContext(ConversationContext);
    const { setLastMessageAction } = useContext(ModalContext);

    const [isMenuAlignedAtBottom, setIsMenuAlignedAtBottom] = useState<
        boolean | null
    >(null);

    /* Hidden content for highlighting css */
    const [hiddenData, setHiddenData] = useState<number[]>([]);

    const [hasMoreContact, setHasMoreContact] = useState<boolean>(true);

    const getMoreContacts = async () => {
        const newContactsCount = await loadMoreConversations();
        if (!newContactsCount) {
            setHasMoreContact(false);
        }
    };

    useEffect(() => {
        if (
            !dm3Configuration.showContacts &&
            dm3Configuration.defaultContact &&
            contacts
        ) {
            // set the default contact
            setSelectedContactName(dm3Configuration.defaultContact);

            // filter out the default contact from contact list
            const defContact = contacts.filter(
                (data) => data.name === dm3Configuration.defaultContact,
            );

            if (defContact.length) {
                // set the contact by its ensName found in contact list
                setSelectedContactName(
                    defContact[0].contactDetails.account.ensName,
                );
            }

            // show chat screen
            setSelectedRightView(RightViewSelected.Chat);
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

    const getPreviewMessage = (contactEnsName: string) => {
        const _contact = normalizeEnsName(contactEnsName);
        const messages = getMessages(_contact);

        if (messages?.length > 0) {
            return messages[0].envelop.message.message ?? '';
        }
        const contact = contacts.find(
            (c) => c.contactDetails.account.ensName === _contact,
        );
        const previewMessage = contact?.message;
        return previewMessage ?? '';
    };

    const isContactSelected = (id: string) => {
        return selectedContact?.contactDetails.account.ensName === id;
    };

    const isContactLoading = (id: string) => {
        const contactName = selectedContact?.contactDetails?.account?.ensName;
        //If there is no selectedContact return false
        if (!contactName) {
            return false;
        }
        //selectedContact in the state matches the list entry
        const contactIsSelected =
            selectedContact?.contactDetails.account.ensName === id;

        return contactIsSelected && contactIsLoading(contactName);
    };

    // updates hidden contacts data for highlighted border
    const setHiddenContentForHighlightedBorder = () => {
        const element: HTMLElement = document.getElementById(
            'chat-scroller',
        ) as HTMLElement;
        if (element) {
            // fetch height of chat window
            const height = element.clientHeight;
            // divide it by each contact height to show in UI
            const minimumContactCount = height / 64;
            // get count of hidden contacts to add
            const hiddenContacts = minimumContactCount - contacts.length + 10;
            if (hiddenData.length !== hiddenContacts) {
                setHiddenData(
                    Array.from({ length: hiddenContacts }, (_, i) => i + 1),
                );
            }
        }
    };

    // handles change in screen size
    window.addEventListener('resize', setHiddenContentForHighlightedBorder);

    // sets hidden content styles for higlighted border
    useEffect(() => {
        setHiddenContentForHighlightedBorder();
    }, [contacts]);

    return (
        <div
            id="chat-scroller"
            className={'contacts-scroller width-fill scroller-active'}
        >
            <InfiniteScroll
                dataLength={contacts.length + hiddenData.length}
                next={getMoreContacts}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}
                inverse={false}
                hasMore={hasMoreContact}
                loader={<></>}
                scrollableTarget="chat-scroller"
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
                                            ? selectedContact.contactDetails
                                                  .account.ensName !== id
                                                ? 'highlight-right-border'
                                                : 'contact-details-container-active'
                                            : '',
                                    )}
                                    onClick={() => {
                                        // On change of contact, message action is set to none
                                        // so that it automatically scrolls to latest message.
                                        setLastMessageAction(
                                            MessageActionType.NONE,
                                        );
                                        setSelectedContactName(
                                            data.contactDetails.account.ensName,
                                        );
                                        if (
                                            selectedRightView !==
                                            RightViewSelected.Chat
                                        ) {
                                            setSelectedRightView(
                                                RightViewSelected.Chat,
                                            );
                                        }
                                        setIsMenuAlignedAtBottom(
                                            showMenuInBottom(
                                                data.contactDetails.account
                                                    .ensName,
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
                                                            ? data
                                                                  .contactDetails
                                                                  .account
                                                                  .ensName
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
                                                    selectedContact
                                                        ?.contactDetails.account
                                                        .ensName &&
                                                    unreadMessageCount > 0 && (
                                                        <div>
                                                            <div className="msg-count">
                                                                {
                                                                    unreadMessageCount
                                                                }
                                                            </div>
                                                        </div>
                                                    )}
                                                {/* //TODO add loading state for message */}
                                                {isContactSelected(id) ? (
                                                    isContactLoading(id) &&
                                                    !messages[id].length ? (
                                                        <div className="pe-2">
                                                            <img
                                                                className="rotating"
                                                                src={loader}
                                                                alt="loader"
                                                            />
                                                        </div>
                                                    ) : (
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
                                                                                      selectedContact!
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
                {hiddenData.map((data) => (
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
            </InfiniteScroll>
        </div>
    );
}
