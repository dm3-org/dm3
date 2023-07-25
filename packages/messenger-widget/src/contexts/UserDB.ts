import {
    StorageEnvelopContainer,
    UserDB,
    createTimestamp,
    getConversation,
    sortEnvelops,
} from 'dm3-lib-storage';
import { UserDbActions, UserDbType } from '../utils/enum-type-utils';
import { normalizeEnsName } from 'dm3-lib-profile';
import { getId } from 'dm3-lib-messaging';
import { log } from 'dm3-lib-shared';

export function userDbReducer(
    state: UserDB | undefined,
    action: UserDbActions,
): UserDB | undefined {
    const lastChangeTimestamp = createTimestamp();
    switch (action.type) {
        case UserDbType.addMessage:
            if (!state) {
                throw Error(`UserDB hasn't been created.`);
            }

            const container = action.payload.container;
            const connection = action.payload.connection;
            const newConversations = new Map<string, StorageEnvelopContainer[]>(
                state.conversations,
            );

            let hasChanged = false;

            const contactEnsName = normalizeEnsName(
                container.envelop.message.metadata.from ===
                    connection.account!.ensName
                    ? container.envelop.message.metadata.to
                    : container.envelop.message.metadata.from,
            );

            const prevContainers: StorageEnvelopContainer[] = getConversation(
                contactEnsName,
                [{ ensName: contactEnsName }],
                state,
            );

            if (!container.envelop.id) {
                container.envelop.id = getId(container.envelop);
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
                    sortEnvelops([...otherContainer, container]),
                );
                hasChanged = true;
            }

            if (!hasChanged) {
                return state;
            } else {
                log(
                    `[DB] Add message (timestamp: ${lastChangeTimestamp})`,
                    'info',
                );
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
            log(`[DB] Set db (timestamp: ${lastChangeTimestamp})`, 'info');
            return {
                ...action.payload,
                lastChangeTimestamp,
            };

        case UserDbType.createEmptyConversation:
            if (!state) {
                throw Error(`UserDB hasn't been created.`);
            }

            if (state.conversations.has(normalizeEnsName(action.payload))) {
                log(
                    `[DB] Converation exists already (timestamp: ${lastChangeTimestamp})`,
                    'info',
                );
                return state;
            }
            log(
                `[DB] Create empty conversation (timestamp: ${lastChangeTimestamp})`,
                'info',
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
                log(
                    `[DB] Set synced to ${action.payload} (timestamp: ${lastChangeTimestamp})`,
                    'info',
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

            log(`[DB] Set config viewed`, 'info');

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
                log(
                    `[DB] Set sync process state to ${action.payload} (timestamp: ${lastChangeTimestamp}) `,
                    'info',
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
                    (contact: { ensName: string; aka?: string }) =>
                        contact === action.payload,
                )
            ) {
                log(`[DB] Contact ${action.payload} already hidden`, 'info');
                return state;
            } else {
                log(`[DB] Hide contact ${action.payload} `, 'info');

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
                    (contact) => contact.ensName === action.payload,
                )
            ) {
                log(`[DB] Contact ${action.payload} not hidden`, 'info');
                return state;
            } else {
                log(`[DB] Unhide contact ${action.payload} `, 'info');

                return {
                    ...state,
                    hiddenContacts: state.hiddenContacts.filter(
                        (contact) =>
                            normalizeEnsName(contact.ensName) !==
                            normalizeEnsName(action.payload),
                    ),
                    synced: false,
                    lastChangeTimestamp,
                };
            }

        default:
            return state;
    }
}
