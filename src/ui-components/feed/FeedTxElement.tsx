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

    let txName: string | null = null;

    try {
        if (
            !utf8Data &&
            props.txContainer.tx.data.length >= 10 &&
            props.txContainer.tx.to &&
            state.cache.abis.has(Lib.formatAddress(props.txContainer.tx.to))
        ) {
            const contractInterface = new ethers.utils.Interface(
                state.cache.abis.get(
                    Lib.formatAddress(props.txContainer.tx.to!),
                )!,
            );

            txName = contractInterface.parseTransaction({
                data: props.txContainer.tx.data,
                value: props.txContainer.tx.value,
            }).name;
        }
    } catch (e) {
        console.log(e);
    }

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
                                state.cache.ensNames,
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
                                state.cache.ensNames,
                            )}
                        </strong>{' '}
                        {!utf8Data && props.txContainer.tx.data.length < 10 && (
                            <>
                                &nbsp;
                                <span className="badge bg-secondary tx-type">
                                    <Icon iconClass="fas fa-coins" />
                                </span>
                                &nbsp;&nbsp;
                            </>
                        )}
                        {utf8Data && (
                            <>
                                &nbsp;
                                <span className="badge bg-secondary  tx-type">
                                    <Icon iconClass="fas fa-envelope" />
                                </span>
                                &nbsp;&nbsp;
                            </>
                        )}
                        {!utf8Data && props.txContainer.tx.data.length >= 10 && (
                            <>
                                &nbsp;
                                <span className="badge bg-secondary  tx-type">
                                    <Icon iconClass="fas fa-file-code" />
                                    {txName && <>&nbsp;&nbsp;{txName} </>}
                                </span>
                                &nbsp;&nbsp;
                            </>
                        )}
                        <span className="text-muted small">
                            {time.toLocaleDateString()}{' '}
                            {time.toLocaleTimeString()}
                        </span>
                    </div>
                </div>
                <div className="row mt-1">
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
