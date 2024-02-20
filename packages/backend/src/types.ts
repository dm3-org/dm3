import { ethers } from 'ethers';
import express from 'express';
import { IDatabase } from './persistance/getDatabase';
import { DeliveryServiceProperties } from '@dm3-org/dm3-lib-delivery';
import winston from 'winston';

export interface WithLocals {
    locals: Record<string, any> &
        Record<'db', IDatabase> &
        Record<'deliveryServicePrivateKey', string> &
        Record<'deliveryServiceProperties', DeliveryServiceProperties> &
        Record<'web3Provider', ethers.providers.JsonRpcProvider>;
}
