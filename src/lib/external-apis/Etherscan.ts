import axios from 'axios';

export async function getTransactions(accountAddress: string): Promise<{
    status: string;
    result: {
        timeStamp: string;
        hash: string;
    }[];
}> {
    const requestUrl =
        `https://api.etherscan.io/api` +
        `?module=account` +
        `&action=txlist` +
        `&address=${accountAddress}` +
        `&startblock=0` +
        `&endblock=99999999` +
        `&page=1` +
        `&offset=10` +
        `&sort=desc` +
        `&apikey=${process.env.REACT_APP_ETHERSCAN_API_KEY}`;

    const request = (await axios.get(requestUrl)).data;

    return request;
}
export type GetTransactions = typeof getTransactions;
