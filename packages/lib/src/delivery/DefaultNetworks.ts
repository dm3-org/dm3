export const DefaultNetworks: Networks = {
    eth: {
        ensAddress: '',
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
