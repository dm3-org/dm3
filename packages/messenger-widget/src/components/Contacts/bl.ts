// sets height of the left view according to content
export const setContactHeightToMaximum = (isProfileConfigured: boolean) => {
    const element = document.getElementsByClassName(
        'contacts-scroller',
    )[0] as HTMLElement;
    element.style.height = isProfileConfigured ? '88.5vh' : '88.5vh';
};

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
