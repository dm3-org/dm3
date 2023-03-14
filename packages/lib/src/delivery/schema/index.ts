import AcknoledgmentSchema from './Acknoledgment.schema.json';
import DeliveryServiceProfileSchema from './DeliveryServiceProfile.schema.json';
import DeliveryServicePropertiesSchema from './DeliveryServiceProperties.schema.json';
import MessageSubmissionSchema from './MessageSubmission.schema.json';
import SessionSchema from './Session.schema.json';

export const Acknoledgment = AcknoledgmentSchema.definitions.Acknoledgment;
export const DeliveryServiceProfile = DeliveryServiceProfileSchema;
export const DeliveryServiceProperties =
    DeliveryServicePropertiesSchema.definitions.DeliveryServiceProperties;
export const MessageSubmission = MessageSubmissionSchema;
export const Session = SessionSchema;
