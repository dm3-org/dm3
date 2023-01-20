export const DefaultNetworks: Networks = {
    eth: {
        ensAddress: '0x4976fb03c32e5b8cfe2b6ccb31c09ba78ebaba41',
        chainId: 1,
    },
    bnb: {
        ensAddress: '0x08CEd32a7f3eeC915Ba84415e9C07a7286977956',
        chainId: 56,
    },
};
export type Networks = {
    [key: string]: {
        ensAddress: string;
        chainId: number;
    };
};
