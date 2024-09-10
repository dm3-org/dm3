import {
    PropsWithChildren,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { debounce } from 'lodash';
import arrowIcon from '../assets/arrow-down-icon.svg';

export interface ContainerProps {
    behavior?: 'smooth' | 'auto';
    containerClassName?: string;
    withToBottomButton?: boolean;
}

type Props = PropsWithChildren<ContainerProps>;

/**
 * Scrolls element into view, scrolling only the parent container.
 *
 * @param element
 * @param behavior
 * @returns
 */
function customScrollIntoView(
    element: HTMLDivElement,
    behavior: 'smooth' | 'auto' = 'auto',
) {
    const parent = element.parentElement;
    if (!parent) {
        return;
    }
    const parentRect = parent.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    const scrollPos = parent.scrollTop + (elementRect.top - parentRect.top);

    parent.scrollTo({
        top: scrollPos,
        behavior,
    });
}

/**
 * A component that keep scrolling to the bottom of the container while
 * inserting items.
 * - Stops after scrolled up once.
 * - Starts again when scrolled down.
 *
 * @param props
 * @returns
 */
function AutoScrollContainer(props: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [autoScroll, setAutoScroll] = useState(true);
    const [scrollPosition, setScrollPosition] = useState(0);

    const {
        behavior = 'smooth',
        containerClassName,
        withToBottomButton = true,
        children,
    } = props;

    const isScrolledToEnd = useCallback((el: HTMLDivElement) => {
        return el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
    }, []);

    const scrollToBottom = useCallback(
        (element: HTMLDivElement) => {
            customScrollIntoView(element, behavior);
        },
        [behavior],
    );

    const handleScroll = useMemo(
        () =>
            debounce(() => {
                const containerElement = containerRef.current;
                if (!containerElement) {
                    return;
                }
                const currentPosition = containerElement.scrollTop || 0;

                if (currentPosition < scrollPosition) {
                    setAutoScroll(false);
                }
                if (isScrolledToEnd(containerElement)) {
                    setAutoScroll(true);
                }

                setScrollPosition(currentPosition);
            }, 25),
        [scrollPosition, isScrolledToEnd],
    );

    useEffect(() => {
        if (autoScroll && bottomRef.current) {
            scrollToBottom(bottomRef.current);
        }
    }, [autoScroll, scrollToBottom, children]);

    useEffect(() => {
        containerRef.current?.addEventListener('scroll', handleScroll);
    }, [handleScroll]);

    return (
        <div className={containerClassName} ref={containerRef}>
            {children}
            {withToBottomButton && bottomRef.current ? (
                <button
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    onClick={() => scrollToBottom(bottomRef.current!)}
                    title="Scroll Down"
                    className={`scroll-to-bottom-button ${
                        !autoScroll ? 'show' : ''
                    }`}
                >
                    <img
                        src={arrowIcon}
                        alt="scroll to bottom icon"
                        height="16px"
                        width="16px"
                    />
                </button>
            ) : null}
            <div ref={bottomRef} />
        </div>
    );
}

export default AutoScrollContainer;
