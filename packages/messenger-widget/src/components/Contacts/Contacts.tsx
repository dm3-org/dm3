import './Contacts.css';
import threeDotsIcon from '../../assets/images/three-dots.svg';
import { ContactPreview } from '../../interfaces/utils';
import {
    onContactSelected,
    setContactHeightToMaximum,
    setContactList,
    setContactIndexSelectedFromCache,
    updateContactOnAccountChange,
    updateSelectedContact,
} from './bl';
import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../../utils/context-utils';
import { DashboardProps } from '../../interfaces/props';
import { closeLoader, startLoader } from '../Loader/Loader';
import { globalConfig } from 'dm3-lib-shared';
import { ModalStateType, RightViewSelected } from '../../utils/enum-type-utils';
import { ContactMenu } from '../ContactMenu/ContactMenu';
import loader from '../../assets/images/loader.svg';

export function Contacts(props: DashboardProps) {
    // fetches context api data
    const { state, dispatch } = useContext(GlobalContext);

    // local states to handle contact list and active contact
    const [contactSelected, setContactSelected] = useState<number | null>(null);
    const [contacts, setContacts] = useState<ContactPreview[]>([]);
    const [openMenu, setOpenMenu] = useState<boolean>(false);

    // sets contact list to show on UI
    const setListOfContacts = (list: ContactPreview[]) => {
        setContacts(list);
    };

    // sets contact selected from the list
    const setContactFromList = (index: number | null) => {
        setContactSelected(index);
    };

    // fetches sub domain of ENS
    const isAddrEnsName = state.connection.account?.ensName?.endsWith(
        globalConfig.ADDR_ENS_SUBDOMAIN(),
    );

    // handles closing of contact menu list
    const closeContactMenu = () => {
        setOpenMenu(false);
    };

    // handles contact box view
    useEffect(() => {
        setContactHeightToMaximum(
            !state.connection.account?.ensName || isAddrEnsName ? true : false,
        );
    }, [state.connection.account?.ensName]);

    // handles any change in socket or session
    useEffect(() => {
        if (
            !state.accounts.contacts &&
            state.auth?.currentSession?.token &&
            state.connection.socket
        ) {
            // start loader
            dispatch({
                type: ModalStateType.LoaderContent,
                payload: 'Fetching contacts...',
            });
            startLoader();
            props.getContacts(state, dispatch, props.dm3Props);
            setContactList(state, dispatch, setListOfContacts);
        }
    }, [state.auth?.currentSession?.token, state.connection.socket]);

    // handles changes in conversation
    useEffect(() => {
        if (state.userDb?.conversations && state.userDb?.conversationsCount) {
            props.getContacts(state, dispatch, props.dm3Props);
        }
    }, [state.userDb?.conversations, state.userDb?.conversationsCount]);

    // handles change in accounts
    useEffect(() => {
        if (
            !state.accounts.selectedContact &&
            (state.uiView.selectedRightView === RightViewSelected.Chat ||
                state.uiView.selectedRightView === RightViewSelected.Default)
        ) {
            setContactList(state, dispatch, setListOfContacts);
        } else if (
            state.modal.addConversation.active &&
            state.modal.addConversation.processed
        ) {
            updateContactOnAccountChange(
                state,
                dispatch,
                contacts,
                setListOfContacts,
            );
        }
    }, [state.accounts.contacts]);

    // handles contact selected
    useEffect(() => {
        const cacheContacts = state.cache.contacts;

        if (cacheContacts) {
            setContacts(cacheContacts);
            if (
                state.modal.addConversation.active &&
                !state.modal.addConversation.processed
            ) {
                updateSelectedContact(state, dispatch, setContactFromList);
            } else if (state.accounts.selectedContact) {
                setContactSelected(
                    setContactIndexSelectedFromCache(state, cacheContacts),
                );
            }
        }
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

    // handles loader closing
    useEffect(() => {
        if (contacts.length) {
            closeLoader();
        }
    }, [contacts]);

    // fetched contacts from the cache
    useEffect(() => {
        const cacheContacts = state.cache.contacts;
        if (cacheContacts && !contacts) {
            setContacts(cacheContacts);
            if (state.accounts.selectedContact) {
                setContactSelected(
                    setContactIndexSelectedFromCache(state, cacheContacts),
                );
            }
        }
    }, [state.cache.contacts]);

    // handles UI view on contact select
    useEffect(() => {
        if (contactSelected !== null) {
            onContactSelected(
                state,
                dispatch,
                contacts[contactSelected].contactDetails,
            );
        }
    }, [contactSelected]);

    /* Hidden content for highlighting css */
    const hiddenData: number[] = Array.from({ length: 14 }, (_, i) => i + 1);

    return (
        <div
            className={'contacts-scroller width-fill'.concat(
                ' ',
                contacts.length > 6 ? 'scroller-active' : 'scroller-hidden',
            )}
        >
            {contacts.length > 0 &&
                contacts.map((data, index) => (
                    <div
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
                                    <div>
                                        <p>{data.name}</p>
                                    </div>

                                    {contactSelected === index ? (
                                        !state.modal.addConversation.active ? (
                                            <div>
                                                <div className="action-container">
                                                    <img
                                                        className="action-dot"
                                                        src={threeDotsIcon}
                                                        alt="action"
                                                        onClick={() => {
                                                            setOpenMenu(
                                                                !openMenu,
                                                            );
                                                        }}
                                                    />
                                                    {openMenu && (
                                                        <ContactMenu
                                                            closeContactMenu={
                                                                closeContactMenu
                                                            }
                                                            contactDetails={
                                                                data
                                                            }
                                                        />
                                                    )}
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

                                <div className="text-primary-color">
                                    <p className="contacts-msg">
                                        {data.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

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
        </div>
    );
}
