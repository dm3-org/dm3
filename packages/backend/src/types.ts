import { ethers } from 'ethers';
import express from 'express';
import { IDatabase } from './persistance/getDatabase';
import { DeliveryServiceProperties } from 'dm3-lib-delivery/dist.backend';

export interface WithLocals {
    locals: Record<string, any> &
        Record<'db', IDatabase> &
        Record<'deliveryServicePrivateKey', string> &
        Record<'deliveryServiceProperties', DeliveryServiceProperties> &
        Record<'web3Provider', ethers.providers.JsonRpcProvider>;
}
