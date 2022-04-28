import * as Lib from '../../lib';
import { ActionMap } from './shared';

export enum UserDbType {
    addMessage = 'ADD_MESSAGE',
    setDB = 'SET_DB',
    createEmptyConversation = 'CREATE_EMPTY_CONVERSATION',
    setSynced = 'SET_SYNCED',
    setSyncProcessState = 'SET_SYNC_PROCESS_STATE',
}

export type UserDbPayload = {
    [UserDbType.addMessage]: {
        container: Lib.StorageEnvelopContainer;
        connection: Lib.Connection;
    };
    [UserDbType.setDB]: Lib.UserDB;
    [UserDbType.createEmptyConversation]: string;
    [UserDbType.setSynced]: boolean;
    [UserDbType.setSyncProcessState]: Lib.SyncProcessState;
};

export type UserDbActions =
    ActionMap<UserDbPayload>[keyof ActionMap<UserDbPayload>];

export function userDbReducer(
    state: Lib.UserDB | undefined,
    action: UserDbActions,
): Lib.UserDB | undefined {
    const lastChangeTimestamp = Lib.createTimestamp();
    switch (action.type) {
        case UserDbType.addMessage:
            if (!state) {
                throw Error(`UserDB hasn't been created.`);
            }

            const container = action.payload.container;
            const connection = action.payload.connection;
            const newConversations = new Map<
                string,
                Lib.StorageEnvelopContainer[]
            >(state.conversations);

            let hasChanged = false;

            const contactAddress =
                container.envelop.message.from === connection.account!.address
                    ? container.envelop.message.to
                    : container.envelop.message.from;
            const conversationId = Lib.getConversationId(
                contactAddress,
                connection.account!.address,
            );
            const prevContainers = Lib.getConversation(
                contactAddress,
                connection,
                state,
            );

            if (!container.envelop.id) {
                container.envelop.id = Lib.getId(container.envelop);
            }

            if (prevContainers.length === 0) {
                newConversations.set(conversationId, [container]);
                hasChanged = true;
            } else if (
                prevContainers[prevContainers.length - 1].envelop.message
                    .timestamp < container.envelop.message.timestamp
            ) {
                newConversations.set(conversationId, [
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
                    conversationId,
                    Lib.sortEnvelops([...otherContainer, container]),
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
                    synced: !hasChanged,
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

        default:
            return state;
    }
}
