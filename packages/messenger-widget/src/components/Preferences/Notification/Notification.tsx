import { Heading } from '../Heading';
import { Checkbox, Text } from './Content';
import { NotificationButton } from './NotificationButton';
import { VerificationModal } from './VerificationModal';
import { DeleteIcon } from './DeleteIcon';
import { useNotification } from './hooks/useNotification';
import {
    getVerficationModalContent,
    VerificationMethod,
} from './hooks/VerificationContent';

export function Notification() {
    const heading = 'Notification';
    const description =
        'Prevent spam from being sent to you by setting rules ' +
        'that senders must fulfill in order for messages to be accepted.';

    const {
        isNotificationsActive,
        isEmailActive,
        setIsEmailActive,
        isMobileActive,
        setIsMobileActive,
        isPushNotifyActive,
        setIsPushNotifyActive,
        email,
        setEmail,
        phone,
        setPhone,
        updateNotificationActive,
        deleteEmail,
        deletePhone,
        activeVerification,
        setActiveVerification,
        activeVerificationContent,
        setActiveVerificationContent,
    } = useNotification();

    return (
        <div>
            <Heading heading={heading} description={description} />

            {/* Verification popup */}
            {activeVerification && (
                <VerificationModal {...activeVerificationContent} />
            )}

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

            {/* Email notifications enabled/disabled */}
            <div className="notification-content-left mt-4">
                <div className="d-flex align-items-center">
                    <Checkbox
                        checked={isEmailActive}
                        disabled={!isNotificationsActive}
                        action={setIsEmailActive}
                        heading="Email"
                    />
                    {email ? (
                        <DeleteIcon
                            data={email}
                            type={VerificationMethod.Email}
                            deleteNotification={deleteEmail}
                        />
                    ) : (
                        <NotificationButton
                            text="Add Email"
                            disabled={!isNotificationsActive}
                            action={() => {
                                setActiveVerification(VerificationMethod.Email);
                                setActiveVerificationContent(
                                    getVerficationModalContent(
                                        VerificationMethod.Email,
                                        setActiveVerification,
                                        setEmail,
                                    ),
                                );
                            }}
                        />
                    )}
                </div>
                <Text
                    disabled={!isNotificationsActive}
                    text={
                        'An email is sent to inform you that a message is waiting for you at a delivery service.'
                    }
                />
            </div>

            {/* Mobile notifications enabled/disabled */}
            <div className="notification-content-left mt-4">
                <div className="d-flex  align-items-center">
                    <Checkbox
                        checked={isMobileActive}
                        disabled={!isNotificationsActive}
                        action={setIsMobileActive}
                        heading="SMS"
                    />
                    {phone ? (
                        <DeleteIcon
                            data={phone}
                            type={VerificationMethod.Telephone}
                            deleteNotification={deletePhone}
                        />
                    ) : (
                        <NotificationButton
                            text="Add Phone Number"
                            disabled={!isNotificationsActive}
                            action={() => {
                                setActiveVerification(
                                    VerificationMethod.Telephone,
                                );
                                setActiveVerificationContent(
                                    getVerficationModalContent(
                                        VerificationMethod.Telephone,
                                        setActiveVerification,
                                        setPhone,
                                    ),
                                );
                            }}
                        />
                    )}
                </div>
                <Text
                    disabled={!isNotificationsActive}
                    text={
                        'A SMS is sent to your phone number to inform you that a ' +
                        'message is waiting for you at a delivery service.'
                    }
                />
            </div>

            {/* Push notifications enabled/disabled */}
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
