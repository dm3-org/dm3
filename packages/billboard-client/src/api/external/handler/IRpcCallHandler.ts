type CallResult = CallFailedResult | CallSuccessResult;

type CallSuccessResult = {
    status: 'success';
    value: any;
};

type CallFailedResult = {
    status: 'failed';
    message: string;
};

interface IRpcCallHandler {
    method: string;
    handle: (params: string[]) => Promise<CallResult>;
}
