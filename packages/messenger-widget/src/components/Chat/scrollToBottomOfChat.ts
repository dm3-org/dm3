// method to scroll down to latest message automatically
export const scrollToBottomOfChat = () => {
    const element: HTMLElement = document.getElementById(
        'chat-box',
    ) as HTMLElement;
    setTimeout(() => {
        if (element) {
            element.scroll({
                top: element.scrollHeight,
                behavior: 'smooth',
            });
        }
    }, 100);
};
