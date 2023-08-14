import './Contacts.css';
import threeDotsIcon from '../../assets/images/three-dots.svg';
import { ContactPreview } from '../../interfaces/utils';
import {
    MouseOut,
    MouseOver,
    fetchAndSetContacts,
    onContactSelected,
    removedSelectedContact,
    setContactHeightToMaximum,
    setContactIndexSelectedFromCache,
    updateStickyStyleOnSelect,
} from './bl';
import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../../utils/context-utils';
import { DashboardProps } from '../../interfaces/props';
import { closeLoader, startLoader } from '../Loader/Loader';
import { globalConfig } from 'dm3-lib-shared';
import {
    CacheType,
    ModalStateType,
    RightViewSelected,
} from '../../utils/enum-type-utils';
import { ContactMenu } from '../ContactMenu/ContactMenu';

export function Contacts(props: DashboardProps) {
    // fetches context api data
    const { state, dispatch } = useContext(GlobalContext);

    // state to handle contact activeness
    const [contactSelected, setContactSelected] = useState<number | null>(null);
    const [contacts, setContacts] = useState<ContactPreview[]>([]);
    const [openMenu, setOpenMenu] = useState<boolean>(false);

    // fetches and sets contact
    const setContactList = async () => {
        const data: ContactPreview[] = await fetchAndSetContacts(state);
        dispatch({
            type: CacheType.Contacts,
            payload: data,
        });
        setContacts(data);
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
            setContactList();
        }
    }, [state.auth?.currentSession?.token, state.connection.socket]);

    // handles changes in conversation
    useEffect(() => {
        if (state.userDb?.conversations && state.userDb?.conversationsCount) {
            dispatch({
                type: ModalStateType.LoaderContent,
                payload: 'Fetching contacts...',
            });
            startLoader();
            props.getContacts(state, dispatch, props.dm3Props);
            setContactList();
        }
    }, [state.userDb?.conversations, state.userDb?.conversationsCount]);

    // handles change in accounts
    useEffect(() => {
        setContactList();
    }, [state.accounts]);

    // handles active contact removal
    useEffect(() => {
        if (
            contactSelected !== null &&
            state.uiView.selectedRightView !== RightViewSelected.Chat &&
            state.uiView.selectedRightView !== RightViewSelected.ContactInfo
        ) {
            removedSelectedContact(contactSelected);
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
        if (cacheContacts) {
            setContacts(cacheContacts);
            if (state.accounts.selectedContact) {
                setContactSelected(
                    setContactIndexSelectedFromCache(
                        state,
                        dispatch,
                        cacheContacts,
                    ),
                );
            }
        }
    }, [state.cache.contacts]);

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
                    <div key={index} id={'contact-container-' + index}>
                        <div
                            className={'pointer-cursor width-fill contact-details-container'.concat(
                                ' ',
                                contactSelected !== null
                                    ? contactSelected === index
                                        ? 'active-contact-border background-active-contact'
                                        : 'highlight-right-border'
                                    : '',
                            )}
                            onMouseOver={(e: React.MouseEvent) =>
                                MouseOver(
                                    e,
                                    'normal-btn',
                                    index,
                                    contactSelected !== null
                                        ? contactSelected
                                        : null,
                                    closeContactMenu,
                                )
                            }
                            onMouseOut={(e: React.MouseEvent) =>
                                MouseOut(e, 'normal-btn', index)
                            }
                            onClick={(e: any) => {
                                setContactSelected(index);
                                updateStickyStyleOnSelect(index);
                                onContactSelected(
                                    e,
                                    index,
                                    'normal-btn-hover',
                                    'background-active-contact',
                                    state,
                                    dispatch,
                                    data.contactDetails,
                                );
                            }}
                        >
                            <div
                                className="col-12 d-flex flex-row align-items-center justify-content-start width-fill"
                                key={index}
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

                                        <div
                                            className="display-none"
                                            id={'contact-' + index}
                                        >
                                            <div className="action-container">
                                                <img
                                                    className="action-dot"
                                                    src={threeDotsIcon}
                                                    alt="action"
                                                    onClick={() => {
                                                        setOpenMenu(!openMenu);
                                                    }}
                                                />
                                                {openMenu &&
                                                    index ===
                                                        contactSelected && (
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
                                    </div>

                                    <div className="text-primary-color">
                                        <p className="contacts-msg">
                                            {data.message}
                                        </p>
                                    </div>
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
