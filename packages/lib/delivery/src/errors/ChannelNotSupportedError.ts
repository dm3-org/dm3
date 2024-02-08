// Error class for channels not supported by delivery services
export class ChannelNotSupportedError extends Error {
    constructor(msg: string) {
        super(msg);
        Object.setPrototypeOf(this, ChannelNotSupportedError.prototype);
    }
}
