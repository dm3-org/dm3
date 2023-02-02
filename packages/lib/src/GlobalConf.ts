export const USER_ENS_SUBDOMAIN = () => {
    if (!process.env.REACT_APP_USER_ENS_SUBDOMAIN) {
        throw Error('REACT_APP_USER_ENS_SUBDOMAIN not set');
    }
    return process.env.REACT_APP_USER_ENS_SUBDOMAIN;
};

export const ADDR_ENS_SUBDOMAIN = () => {
    if (!process.env.REACT_APP_ADDR_ENS_SUBDOMAIN) {
        throw Error('REACT_APP_ADDR_ENS_SUBDOMAIN not set');
    }

    return process.env.REACT_APP_ADDR_ENS_SUBDOMAIN;
};

export const DEFAULT_DELIVERY_SERVICE = () => {
    if (!process.env.REACT_APP_DEFAULT_DELIVERY_SERVICE) {
        throw Error('REACT_APP_DEFAULT_DELIVERY_SERVICE not set');
    }

    return process.env.REACT_APP_DEFAULT_DELIVERY_SERVICE;
};
