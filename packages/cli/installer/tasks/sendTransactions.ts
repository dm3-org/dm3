import { BigNumber, ethers } from 'ethers';
import { InstallerArgs } from '../types';
import { logInfo } from 'dm3-lib-shared';

export const sendTransactions = async (
    args: InstallerArgs,
    tx: ethers.providers.TransactionRequest[],
) => {
    const provider = new ethers.providers.StaticJsonRpcProvider(args.rpc);
    const balance = await provider.getBalance(args.wallet.address);
    const gasPrice = await provider.getGasPrice();
    const gas = tx.reduce(
        (acc, t) => acc.add(t.gasLimit ?? BigNumber.from(0)),
        BigNumber.from(0),
    );

    const txCosts = gas.mul(gasPrice);

    if (txCosts.gt(balance)) {
        throw new Error(
            `Wallet ${args.wallet.address} has insufficient funds to send ${
                tx.length
            } transactions with total cost of ${ethers.utils.formatEther(
                txCosts,
            )} ETH`,
        );
    }

    logInfo(
        `Send ${
            tx.length
        } transaction with total cost of ${ethers.utils.formatEther(
            txCosts,
        )} ETH`,
    );

    //submit transactions
    const txResponses = tx.map((t) => {
        return args.wallet.connect(provider).sendTransaction({ ...t });
    });
    //await transaction receipts
    const receiptes = await Promise.all(
        (await Promise.all(txResponses)).map((tx) => tx.wait()),
    );

    //check if any transaction failed
    const hasError = receiptes.some((r) => r.status === 0);

    if (hasError) {
        throw new Error('Failed to send transactions');
    }
    logInfo('Transactions sent successfully');
};
