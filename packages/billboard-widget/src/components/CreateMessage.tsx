import ButtonWithTimer from './ButtonWithTimer/ButtonWithTimer';
import paperPlaneIcon from '../assets/paper-plane.svg';
import gearIcon from '../assets/gear-icon.svg';
import Avatar from './Avatar';
interface Props {
    user?: Record<string, string>; // TODO
    onClickSettings?: () => void;
}

function CreateMessage(props: Props) {
    const {
        user = {
            hash: '0x123456789',
            ens: 'Bob',
        },
        onClickSettings,
    } = props;

    return (
        <div className="create-message">
            <div className="container">
                <Avatar identifier={user.hash} />
                <div className="message-create-area">
                    <div className="create-header">
                        <div className="info text-xxs">
                            {`Logged in as ${user.hash} ${
                                user.ens ? `alias ${user.ens}` : ''
                            }`}
                        </div>
                        {typeof onClickSettings === 'function' ? (
                            <button className="settings-button">
                                <img src={gearIcon} alt="settings icon" />
                            </button>
                        ) : null}
                    </div>
                    <div className="text-area-wrapper">
                        <textarea
                            className="text-area-input text-sm"
                            rows={4}
                        />
                        <div className="button-wrapper">
                            <ButtonWithTimer
                                onClick={() => {
                                    console.log('sent msg: TODO');
                                }}
                            >
                                {
                                    <img
                                        src={paperPlaneIcon}
                                        alt="Send message"
                                        style={{
                                            transform: 'translate(4px, 1px)',
                                        }}
                                    />
                                }
                            </ButtonWithTimer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateMessage;
