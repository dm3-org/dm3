import AcknoledgmentSchemaJson from './Acknoledgment.schema.json';
import DeliveryServicePropertiesJson from './DeliveryServiceProperties.schema.json';
import SessionSchemaJson from './Session.schema.json';

export const AcknoledgmentSchema =
    AcknoledgmentSchemaJson.definitions.Acknoledgment;

export const DeliveryServicePropertiesSchema =
    DeliveryServicePropertiesJson.definitions.DeliveryServiceProperties;

export const SessionSchema = SessionSchemaJson;
