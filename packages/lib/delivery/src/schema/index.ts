import AcknowledgementSchema from './Acknowledgement.schema.json';
import DeliveryServicePropertiesSchema from './DeliveryServiceProperties.schema.json';
import SessionSchema from './Session.schema.json';
import NotificationChannelSchema from './NotificationChannel.schema.json';

export const Acknowledgement =
    AcknowledgementSchema.definitions.Acknowledgement;
export const DeliveryServiceProperties = DeliveryServicePropertiesSchema;
export const Session = SessionSchema;
export const NotificationChannel = NotificationChannelSchema;
