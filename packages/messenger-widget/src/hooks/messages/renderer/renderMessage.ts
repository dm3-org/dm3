import { MessageModel } from '../useMessage';
import { renderDelete } from './messageTypes/renderDelete';
import { renderEdit } from './messageTypes/renderEdit';
import { renderReactions } from './messageTypes/renderReactions';
import { renderReply } from './messageTypes/renderReply';

/**
 * The storage contains the messages in the order they were received. This contains every message types not just the
 * ones that are displayed. To give the user the correct impression of the conversation we have to render the messages
 * That means we deal with DELETE, EDIT, REACTIONS and REPLIES.
 * Putting them to the right place in the conversation.
 */
export const renderMessage = (messages: MessageModel[]) => {
    const withDeletes = renderDelete(messages);
    const withReactions = renderReactions(withDeletes);
    const withReply = renderReply(withReactions);

    //Its desirable to have all messages in a conversation sorted by their timestamp. However edited messages are an
    //exception to this rule, since they should be displayed in the order they were edited.
    // Therefore we sort the messages by their timestamp and then we eventually replace messages that have been edited
    //Messages are sorted DESC, so the pagination adds old messages at the end of the array
    withReply.sort(
        (a, b) =>
            b.envelop.message.metadata.timestamp -
            a.envelop.message.metadata.timestamp,
    );
    const withoutEdited = renderEdit(withReply);

    return withoutEdited;
};
