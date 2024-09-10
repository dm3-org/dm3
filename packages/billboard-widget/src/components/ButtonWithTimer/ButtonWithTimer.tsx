import React, { PropsWithChildren, useState } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import ProgressProvider from './ProgressProvider';
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
    timeout = 60000,
    disabled = false,
}) => {
    const [activeTimeout, setActiveTimeout] = useState(false);

    const handleClick = () => {
        onClick();
        setActiveTimeout(true);
        setTimeout(() => {
            setActiveTimeout(false);
        }, timeout);
    };

    return (
        <>
            {!activeTimeout ? (
                <div>
                    <SubmitMessageIcon
                        onClick={handleClick}
                        disabled={disabled}
                    />
                </div>
            ) : (
                <button
                    className={`dm3-loading-btn ${
                        activeTimeout ? 'active-timeout' : ''
                    } ${disabled ? 'disabled' : ''}`}
                    disabled={activeTimeout || disabled}
                >
                    <div className="svg-wrapper">
                        <ProgressProvider valueStart={0} valueEnd={100}>
                            {(value: number) => (
                                <CircularProgressbar
                                    styles={buildStyles({
                                        rotation: 1,
                                        pathTransitionDuration: timeout / 1000,
                                    })}
                                    value={value}
                                />
                            )}
                        </ProgressProvider>
                    </div>
                </button>
            )}
        </>
    );
};

export default ButtonWithTimer;
