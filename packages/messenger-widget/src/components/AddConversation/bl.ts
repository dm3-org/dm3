// class for input field
export const INPUT_FIELD_CLASS =
    'conversation-name font-weight-400 border-radius-6 w-100 line-height-24';

// method to open the conversation modal
export const openConversationModal = () => {
    const modal: HTMLElement = document.getElementById(
        'conversation-modal',
    ) as HTMLElement;
    modal.style.display = 'block';
    const inputField = document.getElementById('add-conv-input') as HTMLElement;
    inputField.focus();
};

// method to close the add conversation modal
export const closeConversationModal = (
    resetName: Function,
    showErrorMessage: Function,
    resetInputFieldClass: Function,
) => {
    const modal: HTMLElement = document.getElementById(
        'conversation-modal',
    ) as HTMLElement;
    modal.style.display = 'none';
    showErrorMessage(false, '');
    resetName();
    resetInputFieldClass();
};
