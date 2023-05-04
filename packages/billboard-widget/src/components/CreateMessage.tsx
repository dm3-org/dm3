import ButtonWithTimer from '../ButtonWithTimer/ButtonWithTimer';
import Icon from '../assets/paper-plane.svg';
import Avatar from './Avatar';
interface Props {
    user?: Record<string, string>; // TODO
}

function CreateMessage(props: Props) {
    const {
        user = {
            hash: '0x123456789',
            ens: 'Bob',
        },
    } = props;

    return (
        <div className="create-message">
            <div className="container">
                <Avatar identifier={user.hash} />
                <div className="message-create-area">
                    <div className="info">
                        {`Logged in as ${user.hash} ${
                            user.ens ? `alias ${user.ens}` : ''
                        }`}
                    </div>
                    <div className="text-area-wrapper">
                        <textarea className="text-area-input" rows={4} />
                        <div className="button-wrapper">
                            <ButtonWithTimer
                                onClick={() => {
                                    console.log('sent msg: TODO');
                                }}
                            >
                                {
                                    <img
                                        src={Icon}
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
