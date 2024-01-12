import propertiesIcon from './../../assets/images/properties.svg';
import dm3Icon from './../../assets/images/dm3.svg';
import spamIcon from './../../assets/images/spam.svg';
import notificationIcon from './../../assets/images/notification.svg';
import networkIcon from './../../assets/images/network.svg';
import storageIcon from './../../assets/images/storage.svg';
import { Spam } from './Spam';
import { Properties } from './Properties';
import { Notification } from './Notification';
import { Network } from './Network';
import { Storage } from './Storage';
import { DM3Profile } from './DM3Profile';

export const preferencesItems = [
    {
        image: <img src={propertiesIcon} alt="properties" className="me-2" />,
        name: 'Properties',
        component: <Properties />,
    },
    {
        image: <img src={dm3Icon} alt="dm3" className="me-2" />,
        name: 'dm3 Profile',
        component: <DM3Profile />,
    },
    {
        image: <img src={spamIcon} alt="spam" className="me-2" />,
        name: 'Spam Protection',
        component: <Spam />,
    },
    {
        image: (
            <img src={notificationIcon} alt="notification" className="me-2" />
        ),
        name: 'Notification',
        component: <Notification />,
    },
    {
        image: <img src={networkIcon} alt="network" className="me-2" />,
        name: 'Network',
        component: <Network />,
    },
    {
        image: <img src={storageIcon} alt="storage" className="me-2" />,
        name: 'Storage',
        component: <Storage />,
    },
];
