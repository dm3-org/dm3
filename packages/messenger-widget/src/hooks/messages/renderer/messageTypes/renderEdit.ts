import { MessageModel } from '../../useMessage';

export const renderEdit = (messages: MessageModel[]) => {
    const paths: number[][] = [];

    messages.forEach((msg, idx) => {
        const newPath = [];
        if (msg.envelop.message.metadata.type !== 'EDIT') {
            return;
        }
        //Idx is the beginning of the path. Now we have to go throuhg the messages and
        //find the original message recursifly.
        //Along the way we have to keep track of every index we pass.

        let currentIdx = idx;
        let currentMsg = msg;
        newPath.push(currentIdx);
        while (currentMsg.envelop.message.metadata.type === 'EDIT') {
            const originalMsg = messages.find(
                (m, i) =>
                    m.envelop.metadata?.encryptedMessageHash ===
                    currentMsg.envelop.message.metadata.referenceMessageHash,
            );
            if (!originalMsg) {
                break;
            }
            currentIdx = messages.indexOf(originalMsg);
            newPath.push(currentIdx);
            currentMsg = originalMsg;
        }
        paths.push(newPath);
    });

    //order the path array by the last element
    paths.sort((a, b) => {
        return a[a.length - 1] - b[b.length - 1];
    });
    //Compare the last element of every child in the path array. For each distinct
    // last element find the longest path where that particular last eleemnt is the last element

    const uniquePaths: { [id: number]: Set<number> } = {};

    paths.forEach((p) => {
        const lastElement = p[p.length - 1];
        if (!uniquePaths[lastElement]) {
            uniquePaths[lastElement] = new Set();
        }
        p.forEach((e) => uniquePaths[lastElement].add(e));
    });

    const uniquePathArray: number[][] = [];

    for (const pathSet of Object.values(uniquePaths)) {
        const sortedSet = Array.from(pathSet).sort((a, b) => a - b);
        uniquePathArray.push(sortedSet);
    }

    for (const path of uniquePathArray) {
        const originalIndex = path.shift();
        const lastEditIndex = path.shift();

        const editedMessage = messages[lastEditIndex!];
        messages[originalIndex!] = editedMessage;

        //remove the rest of the messages in the path
        path.forEach((idx) => {
            messages[idx] = undefined!;
        });
        messages[lastEditIndex!] = undefined!;
    }

    return messages.filter((m) => m !== undefined);
};
