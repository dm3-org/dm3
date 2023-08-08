// method to open the conversation modal
export const openConversationModal = () => {
    let modal: HTMLElement = document.getElementById(
        'conversation-modal',
    ) as HTMLElement;
    modal.style.display = 'block';
};

// method to close the add conversation modal
export const closeConversationModal = () => {
    let modal: HTMLElement = document.getElementById(
        'conversation-modal',
    ) as HTMLElement;
    modal.style.display = 'none';
};
