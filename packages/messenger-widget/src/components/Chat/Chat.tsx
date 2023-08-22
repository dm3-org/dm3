import './Chat.css';
import { useContext, useState } from 'react';
import sendBtnIcon from '../../assets/images/send-btn.svg';
import fileIcon from '../../assets/images/file.svg';
import emojiIcon from '../../assets/images/emoji.svg';
import { GlobalContext } from '../../utils/context-utils';
import ConfigProfileAlertBox from '../ContactProfileAlertBox/ContactProfileAlertBox';

export function Chat() {
    const { state } = useContext(GlobalContext);

    const [textData, setTextData] = useState('');
    const [dataList, setDataList] = useState([
        {
            message: 'Hii bro !',
            time: '21/09/2022, 15:09:46',
            readed: true,
            ownMessage: false,
        },
        {
            message: 'Hope you are doing well',
            time: '21/09/2022, 15:09:46',
            readed: true,
            ownMessage: false,
        },
        {
            message: `Hii bruh, Yeah I am good! How are you doing man? 
            It's really a long time we talked. 
            I miss those old memorable days we enjoyed in our childhood !`,
            time: '21/09/2022, 15:09:46',
            readed: true,
            ownMessage: true,
        },
        {
            message: 'Me too good',
            time: '21/09/2022, 15:09:46',
            readed: true,
            ownMessage: false,
        },
        {
            message: 'Nice to hear that',
            time: '21/09/2022, 15:09:46',
            readed: false,
            ownMessage: true,
        },
    ]);

    const isProfileConfigured =
        state.accounts.selectedContact?.account.profile?.publicEncryptionKey;

    function setData(e: React.ChangeEvent<HTMLInputElement>) {
        setTextData(e.target.value);
    }

    return (
        <div
            className={
                state.accounts.selectedContact
                    ? 'highlight-chat-border'
                    : 'highlight-chat-border-none'
            }
        >
            <div className="m-2 text-primary-color position-relative chat-container">
                {/* To show information box that contact has not created profile */}
                {!isProfileConfigured && <ConfigProfileAlertBox />}

                <div
                    className={'chat-items position-relative'.concat(
                        ' ',
                        !isProfileConfigured
                            ? 'chat-height-small'
                            : 'chat-height-high',
                    )}
                >
                    Chat screen...
                </div>
                <div className="d-flex chat-action width-fill position-absolute">
                    <div className="chat-action-items width-fill border-radius-6">
                        <div className="d-flex align-items-center width-fill">
                            <div className="d-flex align-items-center pointer-cursor text-secondary-color">
                                <span className="d-flex">
                                    <img
                                        className="chat-svg-icon"
                                        src={fileIcon}
                                        alt="file"
                                    />
                                </span>
                                <span className="d-flex smile-icon">
                                    <img
                                        className="chat-svg-icon"
                                        src={emojiIcon}
                                        alt="emoji"
                                    />
                                </span>
                                <span className="d-flex smile-icon">|</span>
                            </div>
                            <form className="width-fill">
                                <input
                                    id="msg-input"
                                    className="text-input-field width-fill height-fill text-primary-color 
                                    font-size-14 background-chat"
                                    value={textData}
                                    type="text"
                                    autoComplete="off"
                                    placeholder="Write a message..."
                                    onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>,
                                    ) => setData(e)}
                                ></input>
                            </form>
                            <span className="d-flex align-items-center pointer-cursor text-secondary-color">
                                <img
                                    className="chat-svg-icon"
                                    src={sendBtnIcon}
                                    alt="send"
                                />
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
