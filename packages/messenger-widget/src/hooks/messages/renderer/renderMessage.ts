import { MessageModel } from '../useMessage';
import { renderDelete } from './messageTypes/renderDelete';
import { renderReactions } from './messageTypes/renderReactions';

export const renderMessage = (messages: MessageModel[]) => {
    const withDeletes = renderDelete(messages);
    const withReactions = renderReactions(withDeletes);

    return withReactions;
};
