import { ContactPreview } from '../../interfaces/utils';
import { AuthContextType } from '../AuthContext';
import { ConversationContextType } from '../ConversationContext';

//Provide a mocked Auth context
//Override the default values with the provided values
export const getMockedConversationContext = (
    override?: Partial<ConversationContextType>,
) => {
    const defaultValues: ConversationContextType = {
        contacts: [],
        setSelectedContactName: (contactEnsName: string | undefined) => {},
        conversationCount: 0,
        initialized: false,
        selectedContact: undefined,
        addConversation: (ensName: string) => {
            return {} as ContactPreview;
        },
        loadMoreConversations: () => { return new Promise((resolve, reject) => resolve(0)) },
        hideContact: (ensName: string) => {},
    };

    return { ...defaultValues, ...override };
};
