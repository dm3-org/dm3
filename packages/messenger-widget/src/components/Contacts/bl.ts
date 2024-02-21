export const showMenuInBottom = (id: string | null): boolean => {
    const scroller: HTMLElement = document.getElementById(
        'chat-scroller',
    ) as HTMLElement;
    if (id != null && scroller) {
        const contact: HTMLElement = document.getElementById(
            `chat-item-id-${id}`,
        ) as HTMLElement;
        if (contact) {
            const scrollerBottom: number =
                scroller.getBoundingClientRect().bottom;
            const contactBottom: number =
                contact.getBoundingClientRect().bottom;
            return scrollerBottom - contactBottom >= 156 ? true : false;
        }
    }
    return true;
};
