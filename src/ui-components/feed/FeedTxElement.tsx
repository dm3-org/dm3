import './Feed.css';
import * as Lib from '../../lib';
import Avatar from '../ui-shared/Avatar';
import { useContext } from 'react';
import { GlobalContext } from '../GlobalContextProvider';
import Icon from '../ui-shared/Icon';
import { ethers } from 'ethers';

interface FeedTxElementProps {
    txContainer: Lib.TxContainer;
}

function FeedTxElement(props: FeedTxElementProps) {
    const { state, dispatch } = useContext(GlobalContext);
    const time = new Date(props.txContainer.timestamp);

    console.log(props.txContainer.tx.to);
    return (
        <div className="mt-4 row">
            <div className="col-12 d-flex justify-content-start ">
                <div className="h-100 d-flex flex-row mt-1">
                    <div className="h-100">
                        <Avatar accountAddress={props.txContainer.tx.from} />
                    </div>
                    <div className="align-self-center ms-1 me-1 text-muted">
                        <Icon iconClass="fas fa-arrow-right" />
                    </div>
                    <div className="h-100">
                        {props.txContainer.tx.to && (
                            <Avatar accountAddress={props.txContainer.tx.to} />
                        )}
                    </div>
                </div>
                <div className="ms-2">
                    <div className="row">
                        <div className="col-12">
                            <strong>
                                {Lib.getAccountDisplayName(
                                    props.txContainer.tx.from,
                                    state.ensNames,
                                )}{' '}
                                <Icon iconClass="fas fa-arrow-right text-muted" />{' '}
                                {Lib.getAccountDisplayName(
                                    props.txContainer.tx.to,
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
                        <div className="col-12 small text-muted">
                            {!props.txContainer.tx.value.eq(
                                ethers.BigNumber.from(0),
                            ) && (
                                <>
                                    <Icon iconClass="fas fa-coins" />{' '}
                                    {ethers.utils
                                        .formatEther(props.txContainer.tx.value)
                                        .toString()}{' '}
                                    ETH
                                </>
                            )}
                            {props.txContainer.tx.data.length >= 10 &&
                                !props.txContainer.tx.value.eq(
                                    ethers.BigNumber.from(0),
                                ) && <>&nbsp;&nbsp;&nbsp;</>}
                            {props.txContainer.tx.data.length >= 10 && (
                                <>
                                    <Icon iconClass="fas fa-code" />{' '}
                                    {props.txContainer.tx.data.slice(0, 10)}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FeedTxElement;
