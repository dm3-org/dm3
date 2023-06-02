import React, {
    useEffect,
    useRef,
    useState,
    useMemo,
    PropsWithChildren,
} from 'react';
import { SubmitMessageIcon } from './SubmitMessageIcon';

interface ButtonWithTimerProps extends PropsWithChildren {
    onClick: (e?: React.MouseEvent<HTMLInputElement>) => void;
    timeout?: number;
    size?: number;
    disabled?: boolean;
}

/**
 * Custom button component that will be disabled after clicked for a certain
 * amount of time.
 * @param param0
 * - onClick: the onClick action.
 * - timeout: The timeout in milliseconds till the button is active again
 * - size: the size of the button
 * @returns
 */
const ButtonWithTimer: React.FC<ButtonWithTimerProps> = ({
    onClick,
    timeout = 0,
    size = 40,
    children,
    disabled = false,
}) => {
    const [activeTimeout, setActiveTimeout] = useState(false);
    const circleRef = useRef<SVGCircleElement | null>(null);

    const handleClick = () => {
        onClick();
        setActiveTimeout(true);
        setTimeout(() => {
            setActiveTimeout(false);
        }, timeout);
    };

    const strokeWidth = useMemo(() => {
        return 600 / size;
    }, [size]);

    useEffect(() => {
        let requestId: number;
        let startTime: number | null = null;

        if (!activeTimeout) {
            return;
        }

        /**
         * Do the SVG Magic:
         * - progress * 2.89 because full perimeter is about 289 (46 * 2 * PI)
         *
         * @param timestamp
         */
        function animate(timestamp: number) {
            if (!startTime) {
                startTime = timestamp;
            }
            const runningTime = timestamp - startTime;
            const progress = (runningTime / timeout) * 100;

            circleRef?.current?.setAttribute(
                'stroke-dasharray',
                `${progress * 2.89},300`,
            );

            requestId = requestAnimationFrame(animate);
        }

        requestId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(requestId);
        };
    }, [activeTimeout, timeout]);

    return (
        <>
            {!activeTimeout ? (
                <div >
                    <SubmitMessageIcon onClick={handleClick} disabled={disabled} />
                </div>
            ) : (
                <button
                    className={`dm3-loading-btn ${
                        activeTimeout ? 'active-timeout' : ''
                    } ${disabled ? 'disabled' : ''}`}
                    disabled={activeTimeout || disabled}
                >
                    <div className="svg-wrapper">
                        <svg
                            className="circle-chart"
                            viewBox="0 0 100 100"
                            width={size}
                            height={size}
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <circle
                                className="circle-chart__background"
                                strokeWidth={strokeWidth}
                                fill="none"
                                cx="50"
                                cy="50"
                                r="48"
                            />
                            <circle
                                className="circle-chart__circle"
                                id="send-button-progress-circle"
                                strokeWidth={strokeWidth}
                                fill="none"
                                cx="50"
                                cy="50"
                                r="46"
                                strokeDasharray="0,300"
                                ref={circleRef}
                            />
                        </svg>
                    </div>
                </button>
            )}
        </>
    );
};

export default ButtonWithTimer;
