import submitMessageIcon from '../../assets/send-message-icon.svg';
export const SubmitMessageIcon = ({
    onClick,
    disabled,
}: {
    onClick: () => void;
    disabled: boolean;
}) => (
    <button
        className="dm3-send-message-btn"
        style={{
            cursor: !disabled ? 'pointer' : '',
            paddingTop: '12px',
            padding: '12px',
            paddingBottom: '6px',
            display: 'inline-block',
        }}
        disabled={disabled}
        onClick={onClick}
    >
        <img src={submitMessageIcon} alt="Send message" style={{}} />
    </button>
);
