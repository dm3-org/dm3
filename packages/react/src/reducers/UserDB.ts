import * as Lib from 'dm3-lib';
import { ActionMap } from './shared';

export enum UserDbType {
    addMessage = 'ADD_MESSAGE',
    setDB = 'SET_DB',
    createEmptyConversation = 'CREATE_EMPTY_CONVERSATION',
    setSynced = 'SET_SYNCED',
    setConfigViewed = 'SET_CONFIG_VIEWED',
    setSyncProcessState = 'SET_SYNC_PROCESS_STATE',
    hideContact = 'HIDE_CONTACT',
    unhideContact = 'UNHIDE_CONTACT',
}

export type UserDbPayload = {
    [UserDbType.addMessage]: {
        container: Lib.storage.StorageEnvelopContainer;
        connection: Lib.Connection;
    };
    [UserDbType.setDB]: Lib.storage.UserDB;
    [UserDbType.createEmptyConversation]: string;
    [UserDbType.setSynced]: boolean;
    [UserDbType.setConfigViewed]: boolean;
    [UserDbType.setSyncProcessState]: Lib.storage.SyncProcessState;
    [UserDbType.hideContact]: string;
    [UserDbType.unhideContact]: string;
};

export type UserDbActions =
    ActionMap<UserDbPayload>[keyof ActionMap<UserDbPayload>];

export function userDbReducer(
    state: Lib.storage.UserDB | undefined,
    action: UserDbActions,
): Lib.storage.UserDB | undefined {
    const lastChangeTimestamp = Lib.storage.createTimestamp();
    switch (action.type) {
        case UserDbType.addMessage:
            if (!state) {
                throw Error(`UserDB hasn't been created.`);
            }

            const container = action.payload.container;
            const connection = action.payload.connection;
            const newConversations = new Map<
                string,
                Lib.storage.StorageEnvelopContainer[]
            >(state.conversations);

            let hasChanged = false;

            const contactEnsName = Lib.profile.normalizeEnsName(
                container.envelop.message.metadata.from ===
                    connection.account!.ensName
                    ? container.envelop.message.metadata.to
                    : container.envelop.message.metadata.from,
            );

            const prevContainers = Lib.storage.getConversation(
                contactEnsName,
                state,
            );

            if (!container.envelop.id) {
                container.envelop.id = Lib.messaging.getId(container.envelop);
            }

            if (prevContainers.length === 0) {
                newConversations.set(contactEnsName, [container]);
                hasChanged = true;
            } else if (
                prevContainers[prevContainers.length - 1].envelop.message
                    .metadata.timestamp <
                container.envelop.message.metadata.timestamp
            ) {
                newConversations.set(contactEnsName, [
                    ...prevContainers,
                    container,
                ]);
                hasChanged = true;
            } else {
                const otherContainer = prevContainers.filter(
                    (prevContainer) =>
                        prevContainer.envelop.id !== container.envelop.id,
                );

                newConversations.set(
                    contactEnsName,
                    Lib.storage.sortEnvelops([...otherContainer, container]),
                );
                hasChanged = true;
            }

            if (!hasChanged) {
                return state;
            } else {
                Lib.log(`[DB] Add message (timestamp: ${lastChangeTimestamp})`);
                return {
                    ...state,
                    conversations: newConversations,
                    conversationsCount: Array.from(newConversations.keys())
                        .length,
                    synced: false,
                    lastChangeTimestamp,
                };
            }

        case UserDbType.setDB:
            Lib.log(`[DB] Set db (timestamp: ${lastChangeTimestamp})`);
            return {
                ...action.payload,
                lastChangeTimestamp,
            };

        case UserDbType.createEmptyConversation:
            if (!state) {
                throw Error(`UserDB hasn't been created.`);
            }

            if (
                state.conversations.has(
                    Lib.profile.normalizeEnsName(action.payload),
                )
            ) {
                Lib.log(
                    `[DB] Converation exists already (timestamp: ${lastChangeTimestamp})`,
                );
                return state;
            }
            Lib.log(
                `[DB] Create empty conversation (timestamp: ${lastChangeTimestamp})`,
            );

            const conversations = new Map(state.conversations);
            conversations.set(action.payload, []);

            return {
                ...state,
                conversations: conversations,
                conversationsCount: Array.from(conversations.keys()).length,
                synced: false,
                lastChangeTimestamp,
            };

        case UserDbType.setSynced:
            if (!state) {
                throw Error(`UserDB hasn't been created.`);
            }
            if (state.synced === action.payload) {
                return state;
            } else {
                Lib.log(
                    `[DB] Set synced to ${action.payload} (timestamp: ${lastChangeTimestamp})`,
                );

                return {
                    ...state,
                    synced: action.payload,
                    lastChangeTimestamp,
                };
            }

        case UserDbType.setConfigViewed:
            if (!state) {
                throw Error(`UserDB hasn't been created.`);
            }

            Lib.log(`[DB] Set config viewed`);

            return {
                ...state,
                configViewed: action.payload,
                lastChangeTimestamp,
            };

        case UserDbType.setSyncProcessState:
            if (!state) {
                throw Error(`UserDB hasn't been created.`);
            }
            if (state.syncProcessState === action.payload) {
                return state;
            } else {
                Lib.log(
                    `[DB] Set sync process state to ${action.payload} (timestamp: ${lastChangeTimestamp}) `,
                );

                return {
                    ...state,
                    syncProcessState: action.payload,
                    lastChangeTimestamp,
                };
            }

        case UserDbType.hideContact:
            if (!state) {
                throw Error(`UserDB hasn't been created.`);
            }

            if (
                state.hiddenContacts.find(
                    (contact) => contact === action.payload,
                )
            ) {
                Lib.log(`[DB] Contact ${action.payload} already hidden`);
                return state;
            } else {
                Lib.log(`[DB] Hide contact ${action.payload} `);

                return {
                    ...state,
                    hiddenContacts: [...state.hiddenContacts, action.payload],
                    synced: false,
                    lastChangeTimestamp,
                };
            }

        case UserDbType.unhideContact:
            if (!state) {
                throw Error(`UserDB hasn't been created.`);
            }

            if (
                !state.hiddenContacts.find(
                    (contact) => contact === action.payload,
                )
            ) {
                Lib.log(`[DB] Contact ${action.payload} not hidden`);
                return state;
            } else {
                Lib.log(`[DB] Unhide contact ${action.payload} `);

                return {
                    ...state,
                    hiddenContacts: state.hiddenContacts.filter(
                        (contact) =>
                            Lib.profile.normalizeEnsName(contact) !==
                            Lib.profile.normalizeEnsName(action.payload),
                    ),
                    synced: false,
                    lastChangeTimestamp,
                };
            }

        default:
            return state;
    }
}
