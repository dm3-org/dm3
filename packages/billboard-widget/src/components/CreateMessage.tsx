import { ethers } from 'ethers';
import { useContext, useState } from 'react';
import gearIcon from '../assets/gear-icon.svg';

import { AuthContext } from '../context/AuthContext';
import Avatar from './Avatar';
import ButtonWithTimer from './ButtonWithTimer/ButtonWithTimer';
import { SubmitMessageIcon } from './ButtonWithTimer/SubmitMessageIcon';
interface Props {
    onClickSettings?: () => void;
    onCreateMsg: (msg: string) => void;
}

const SEND_TIMEOUT = 6000; // 6 seconds
const MIN_MESSAGE_LENGTH = 5;

function CreateMessage(props: Props) {
    const { ensName } = useContext(AuthContext);
    const { onCreateMsg, onClickSettings } = props;
    const [textAreaContent, setTextAreaContent] = useState('');

    return (
        <div className="create-message">
            <div className="container">
                <Avatar
                    identifier={ethers.utils.keccak256(
                        ethers.utils.toUtf8Bytes(ensName),
                    )}
                />
                <div className="message-create-area">
                    <div className="create-header">
                        <div className="info text-xxs">
                            {`Logged in as ${ensName}`}
                        </div>
                        {typeof onClickSettings === 'function' ? (
                            <button className="settings-button">
                                <img src={gearIcon} alt="settings icon" />
                            </button>
                        ) : null}
                    </div>
                    <div className="text-area-wrapper">
                        <textarea
                            value={textAreaContent}
                            onChange={(e) => {
                                setTextAreaContent(e.target.value);
                            }}
                            className="text-area-input text-sm"
                            rows={2}
                        />
                        <div className="button-wrapper">
                            {
                                <ButtonWithTimer
                                    disabled={
                                        textAreaContent?.length <
                                        MIN_MESSAGE_LENGTH
                                    }
                                    timeout={SEND_TIMEOUT}
                                    onClick={() => {
                                        onCreateMsg(textAreaContent);
                                        setTextAreaContent('');
                                    }}
                                ></ButtonWithTimer>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateMessage;
