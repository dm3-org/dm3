import { MessageModel } from '../useMessage';
import { renderDelete } from './messageTypes/renderDelete';
import { renderEdit } from './messageTypes/renderEdit';
import { renderReactions } from './messageTypes/renderReactions';
import { renderReply } from './messageTypes/renderReply';

export const renderMessage = (messages: MessageModel[]) => {
    const withDeletes = renderDelete(messages);
    const withReactions = renderReactions(withDeletes);
    const withReply = renderReply(withReactions);

    withReply.sort(
        (a, b) =>
            a.envelop.message.metadata.timestamp -
            b.envelop.message.metadata.timestamp,
    );
    const withoutEdited = renderEdit(withReply);

    return withoutEdited;
};
