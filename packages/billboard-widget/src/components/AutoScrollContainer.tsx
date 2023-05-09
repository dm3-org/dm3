import {
    PropsWithChildren,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { debounce } from 'lodash';

type Props = PropsWithChildren<{
    behavior?: 'smooth' | 'auto';
    containerClassName?: string;
    withToBottomButton?: boolean;
}>;

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
            element.scrollIntoView({
                behavior,
                block: 'nearest',
            });
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
            <div ref={bottomRef} />
            {withToBottomButton && bottomRef.current ? (
                <button
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    onClick={() => scrollToBottom(bottomRef.current!)}
                    title="Scroll Down"
                    className={`scroll-to-bottom-button ${
                        !autoScroll ? 'show' : ''
                    }`}
                >
                    To Bottom
                </button>
            ) : null}
        </div>
    );
}

export default AutoScrollContainer;
