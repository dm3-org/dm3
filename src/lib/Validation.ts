import MessageSchema from '../schema.json';
import { Envelop } from './Messaging';
import Ajv from 'ajv';

export function validateMessage(envelop: Envelop) {
    const ajv = new Ajv();
    const validate = ajv.compile(MessageSchema);
    if (!validate(envelop.message)) {
        throw Error("Message doesn't fit schema");
    }
}
