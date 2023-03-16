import { Envelop } from './Envelop';
import Ajv from 'ajv';
import { MessageSchema } from './schema';

export function validateMessage(envelop: Envelop) {
    const ajv = new Ajv();
    const validate = ajv.compile(MessageSchema);
    if (!validate(envelop.message)) {
        throw Error("Message doesn't fit schema");
    }
}
