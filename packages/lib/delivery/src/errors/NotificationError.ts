// Error class for to handle Notification related errors
export class NotificationError extends Error {
    constructor(msg: string) {
        super(msg);
        Object.setPrototypeOf(this, NotificationError.prototype);
    }
}
