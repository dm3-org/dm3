import { useState } from 'react';
import { Heading } from '../Heading';
import { Checkbox, Text } from './Content';
import { NotificationButton } from './NotificationButton';

export function Notification() {
    const heading = 'Notification';
    const description =
        'Prevent spam from being sent to you by setting rules ' +
        'that senders must fulfill in order for messages to be accepted.';

    const [isNotificationsActive, setIsNotificationsActive] =
        useState<boolean>(true);
    const [isEmailActive, setIsEmailActive] = useState<boolean>(true);
    const [isMobileActive, setIsMobileActive] = useState<boolean>(true);
    const [isPushNotifyActive, setIsPushNotifyActive] = useState<boolean>(true);

    const updateNotificationActive = (action: boolean) => {
        setIsNotificationsActive(action);
        setIsEmailActive(action);
        setIsMobileActive(action);
        setIsPushNotifyActive(action);
    };

    return (
        <div>
            <Heading heading={heading} description={description} />

            {/* Notifications enabled/disabled */}
            <div className="ms-5 mt-4">
                <div className="d-flex align-items-center">
                    <Checkbox
                        checked={isNotificationsActive}
                        disabled={false}
                        action={(d: boolean) => updateNotificationActive(d)}
                        heading="Activate Notifications"
                    />
                </div>
                <Text
                    disabled={false}
                    text={
                        'Notifications are sent if a message is waiting for you at the delivery service. ' +
                        'There are different types of notification you can select.'
                    }
                />
            </div>

            {/* Email notifications enabled/diabled */}
            <div className="notification-content-left mt-4">
                <div className="d-flex align-items-center">
                    <Checkbox
                        checked={isEmailActive}
                        disabled={!isNotificationsActive}
                        action={setIsEmailActive}
                        heading="Email"
                    />
                    <NotificationButton
                        text="Add Email"
                        disabled={!isNotificationsActive}
                        action={() => {}}
                    />
                </div>
                <Text
                    disabled={!isNotificationsActive}
                    text={
                        'An email is sent to inform you that a message is waiting for you at a delivery service.'
                    }
                />
            </div>

            {/* Mobile notifications enabled/diabled */}
            <div className="notification-content-left mt-4">
                <div className="d-flex  align-items-center">
                    <Checkbox
                        checked={isMobileActive}
                        disabled={!isNotificationsActive}
                        action={setIsMobileActive}
                        heading="SMS"
                    />
                    <NotificationButton
                        text="Add Phone Number"
                        disabled={!isNotificationsActive}
                        action={() => {}}
                    />
                </div>
                <Text
                    disabled={!isNotificationsActive}
                    text={
                        'A SMS is sent to your phone number to inform you that a ' +
                        'message is waiting for you at a delivery service.'
                    }
                />
            </div>

            {/* Push notifications enabled/diabled */}
            <div className="notification-content-left mt-4">
                <div className="d-flex align-items-center">
                    <Checkbox
                        checked={isPushNotifyActive}
                        disabled={!isNotificationsActive}
                        action={setIsPushNotifyActive}
                        heading="Push Notifications"
                    />
                </div>
                <Text
                    disabled={!isNotificationsActive}
                    text={'Enable push notifications to your browser.'}
                />
            </div>
        </div>
    );
}
