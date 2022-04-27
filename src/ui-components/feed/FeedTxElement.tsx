import './Feed.css';
import * as Lib from '../../lib';
import Avatar, { SpecialSize } from '../ui-shared/Avatar';
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

    const openUrl = (url: string) => {
        const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
        if (newWindow) {
            newWindow.opener = null;
        }
    };

    let utf8Data: string | null = null;
    try {
        utf8Data = ethers.utils.toUtf8String(
            ethers.utils.arrayify(props.txContainer.tx.data),
        );
    } catch (e) {}

    return (
        <div
            className="mt-3 feed-element feed-element-tx"
            onClick={() =>
                openUrl(`https://etherscan.io/tx/${props.txContainer.tx.hash}`)
            }
        >
            <div className="p-2 ps-3 ">
                <div className="row">
                    <div className="col-12">
                        <strong>
                            <Avatar
                                accountAddress={props.txContainer.tx.from}
                                specialSize={SpecialSize.Xs}
                            />{' '}
                            {Lib.getAccountDisplayName(
                                props.txContainer.tx.from,
                                state.ensNames,
                            )}{' '}
                            <Icon iconClass="fas fa-arrow-right text-muted" />{' '}
                            <Avatar
                                accountAddress={
                                    props.txContainer.tx.to
                                        ? props.txContainer.tx.to
                                        : ethers.constants.AddressZero
                                }
                                specialSize={SpecialSize.Xs}
                            />{' '}
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
                    <div
                        className={`col-12 small ${
                            utf8Data ? '' : 'text-muted'
                        }`}
                    >
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
                        {utf8Data}
                        {!utf8Data && props.txContainer.tx.data.length >= 10 && (
                            <>
                                <Icon iconClass="fas fa-code" />{' '}
                                {props.txContainer.tx.data.slice(0, 10)}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FeedTxElement;
