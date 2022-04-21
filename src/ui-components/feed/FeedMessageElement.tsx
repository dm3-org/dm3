import './Feed.css';
import * as Lib from '../../lib';
import Avatar, { SpecialSize } from '../ui-shared/Avatar';
import { useContext } from 'react';
import { GlobalContext } from '../GlobalContextProvider';

interface FeedMessageElementProps {
    envelop: Lib.PublicEnvelop;
}

function FeedMessageElement(props: FeedMessageElementProps) {
    const { state, dispatch } = useContext(GlobalContext);
    const time = new Date(props.envelop.message.timestamp);
    return (
        <div className="mt-4 row">
            <div className="col-12 d-flex justify-content-start">
                <div className="h-100 ">
                    <div className="mt-1">
                        <Avatar
                            accountAddress={props.envelop.message.from}
                            specialSize={SpecialSize.Md}
                        />
                    </div>
                </div>
                <div className="ms-2">
                    <div className="row">
                        <div className="col-12">
                            <strong>
                                {Lib.getAccountDisplayName(
                                    props.envelop.message.from,
                                    state.ensNames,
                                )}
                            </strong>{' '}
                            <span className="text-muted small">
                                {time.toLocaleDateString()}{' '}
                                {time.toLocaleTimeString()}
                            </span>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-12">
                            {props.envelop.message.message}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FeedMessageElement;
