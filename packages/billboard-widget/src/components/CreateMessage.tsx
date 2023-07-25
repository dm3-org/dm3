import { useContext, useEffect, useState, KeyboardEvent, useMemo } from 'react';
import gearIcon from '../assets/gear-icon.svg';

import { AuthContext } from '../context/AuthContext';
import { GlobalContext } from '../context/GlobalContext';
import Avatar from './Avatar';
import ButtonWithTimer from './ButtonWithTimer/ButtonWithTimer';
interface Props {
    onClickSettings?: () => void;
    onCreateMsg: (msg: string) => void;
}

const MIN_MESSAGE_LENGTH = 5;

// Workaround since TS complains about the about enterkeyhint attribute.
// TODO: should actually be fixed in current react/TS versions.
declare module 'react' {
    interface TextareaHTMLAttributes<T>
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        extends AriaAttributes,
            DOMAttributes<T> {
        enterkeyhint?: string;
    }
}

function CreateMessage(props: Props) {
    const { ensName } = useContext(AuthContext);
    const { onCreateMsg, onClickSettings } = props;
    const [textAreaContent, setTextAreaContent] = useState('');
    const { options } = useContext(GlobalContext);

    const submitMessage = () => {
        if (!canSend) {
            return;
        }
        onCreateMsg(textAreaContent);
        setTextAreaContent('');
    };

    // send message on ENTER key
    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitMessage();
        }
    };

    const [userName, setUserName] = useState('');
    useEffect(() => {
        const resolveUserName = async () => {
            if (typeof options?.userNameResolver === 'function') {
                const resolvedUserName = await options.userNameResolver(
                    ensName,
                );
                setUserName(resolvedUserName);
            } else {
                setUserName(ensName);
            }
        };

        resolveUserName();
    }, [ensName, options]);

    const canSend = useMemo(() => {
        return textAreaContent?.length >= MIN_MESSAGE_LENGTH;
    }, [textAreaContent]);
    return (
        <div className="create-message">
            <div className="container">
                <Avatar identifier={ensName} />
                <div className="message-create-area">
                    <div className="create-header">
                        <div className="info text-xxs">
                            {`Logged in as ${userName}`}
                        </div>
                        {typeof onClickSettings === 'function' ? (
                            <button className="settings-button">
                                <img src={gearIcon} alt="settings icon" />
                            </button>
                        ) : null}
                    </div>
                    <div className="text-area-wrapper">
                        <textarea
                            enterkeyhint="send"
                            value={textAreaContent}
                            onChange={(e) => {
                                setTextAreaContent(e.target.value);
                            }}
                            onKeyDown={(e) => handleKeyDown(e)}
                            className="text-area-input text-sm"
                            rows={2}
                        />
                        <div className="button-wrapper">
                            {
                                <ButtonWithTimer
                                    disabled={!canSend}
                                    timeout={options?.timeout}
                                    onClick={() => {
                                        submitMessage();
                                    }}
                                />
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateMessage;
