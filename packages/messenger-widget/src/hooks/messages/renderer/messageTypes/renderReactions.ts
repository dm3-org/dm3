import { MessageModel } from '../../useMessage';

export const renderReactions = (messages: MessageModel[]) => {
    const reactions = messages
        .filter(
            (message) => message.envelop.message.metadata.type === 'REACTION',
        )
        .map((reaction) => reaction.envelop);

    //add reactions to the messages
    return messages
        .map((message) => {
            const _reactions = [...message.reactions, ...reactions]
                .filter(
                    (reaction) =>
                        reaction.message.metadata.referenceMessageHash ===
                        message.envelop.metadata?.encryptedMessageHash,
                )
                //Filter duplicates
                .filter((reaction, index, self) => {
                    return (
                        index ===
                        self.findIndex(
                            (r) =>
                                r.message.message === reaction.message.message,
                        )
                    );
                });

            return {
                ...message,
                reactions: _reactions,
            };
        })
        .filter(
            (message) => message.envelop.message.metadata.type !== 'REACTION',
        );
};
