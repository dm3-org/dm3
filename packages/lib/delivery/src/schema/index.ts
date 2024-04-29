import AcknoledgmentSchema from './Acknoledgment.schema.json';
import DeliveryServicePropertiesSchema from './DeliveryServiceProperties.schema.json';
import MessageSubmissionSchema from './MessageSubmission.schema.json';
import SessionSchema from './Session.schema.json';
import NotificationChannelSchema from './NotificationChannel.schema.json';
import SiwePayloadSchema from './SiwePayload.schema.json';

export const Acknoledgment = AcknoledgmentSchema.definitions.Acknoledgment;
export const DeliveryServiceProperties = DeliveryServicePropertiesSchema;
export const MessageSubmission = MessageSubmissionSchema;
export const Session = SessionSchema;
export const NotificationChannel = NotificationChannelSchema;
export const SiwePayload = SiwePayloadSchema;
