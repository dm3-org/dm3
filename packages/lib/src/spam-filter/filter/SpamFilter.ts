import { DeliveryInformation } from '../../messaging';

export interface SpamFilter {
    filter(e: DeliveryInformation): Promise<boolean>;
}
