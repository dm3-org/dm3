import { useContext, useEffect, useState } from 'react';
import './Feed.css';
import * as Lib from '../../lib';
import { GlobalContext } from '../GlobalContextProvider';
import Icon from '../ui-shared/Icon';
import StateButton, { ButtonState } from '../ui-shared/StateButton';
import FeedMessageElement from './FeedMessageElement';
import FeedTxElement from './FeedTxElement';
import { FeedType } from '../reducers/Feed';

function Feed() {
    const { state, dispatch } = useContext(GlobalContext);
    const [messageText, setMessageText] = useState<string | undefined>();
    const [submitState, setSubmitState] = useState<ButtonState>(
        ButtonState.Idel,
    );

    const submitPublicMessage = async () => {
        if (messageText && state.userDb) {
            try {
                setSubmitState(ButtonState.Loading);
                const message = await Lib.createPublicMessage(
                    messageText,
                    state.connection,
                    state.userDb,
                );
                await Lib.submitPublicMessage(
                    state.connection,
                    state.userDb,
                    message,
                );

                setMessageText('');
                setSubmitState(ButtonState.Success);
            } catch (e) {
                Lib.log(e as string);
                setSubmitState(ButtonState.Failed);
            }
        }
    };

    const createFeed = async () => {
        dispatch({
            type: FeedType.AddFeedElements,
            payload: await Lib.getNewFeedElements(
                state.feed,
                state.connection,
                state.accounts.contacts ? state.accounts.contacts : [],
            ),
        });
    };

    useEffect(() => {
        createFeed();
    }, [state.connection.account, state.accounts.contacts]);

    useEffect(() => {
        createFeed();
    }, []);

    const feedElements = state.feed.map((element) =>
        (element as Lib.PublicEnvelop).message ? (
            <FeedMessageElement
                envelop={element as Lib.PublicEnvelop}
                key={Lib.getId(element as Lib.PublicEnvelop)}
            />
        ) : (
            <FeedTxElement
                txContainer={element as Lib.TxContainer}
                key={(element as Lib.TxContainer).tx.hash}
            />
        ),
    );

    return (
        <div
            className={`feed w-100 h-100 d-flex align-items-stretch flex-column`}
        >
            <div className="container-fluid p-0">
                <div className="row">
                    <div className="col-10 pe-0">
                        <textarea
                            onInput={(e) => {
                                setSubmitState(ButtonState.Idel);
                                setMessageText((e.target as any).value);
                            }}
                            className="form-control public-message-text"
                            placeholder="Leave a comment here"
                            disabled={submitState === ButtonState.Loading}
                        />
                    </div>
                    <div className="col-2 ps-0">
                        <StateButton
                            content={<Icon iconClass="fas fa-paper-plane " />}
                            btnState={ButtonState.Idel}
                            btnType="primary"
                            onClick={submitPublicMessage}
                            disabled={!messageText}
                            className="h-100 public-message-btn"
                        />
                    </div>
                </div>
            </div>
            <div className=" overflow-auto container-fluid ">
                {feedElements}
            </div>
        </div>
    );
}

export default Feed;
