import DeliveryServiceProfileSchema from '../schema/DeliveryServiceProfile.schema.json';
import Ajv from 'ajv';
import { DeliveryServiceProfile } from './Delivery';

export function validateDeliveryServiceProfile(
    deliveryServiceProfile: DeliveryServiceProfile,
): boolean {
    const ajv = new Ajv();
    const validate = ajv.compile(DeliveryServiceProfileSchema);
    return !!validate(deliveryServiceProfile);
}
