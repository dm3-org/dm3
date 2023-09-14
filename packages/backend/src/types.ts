import { ethers } from 'ethers';
import express from 'express';
import { IDatabase } from './persistance/getDatabase';
import { DeliveryServiceProperties } from 'dm3-lib-delivery';
<<<<<<< HEAD
=======
import winston from 'winston';
>>>>>>> 4bdf0d7f5a0bb95b948c66e6c6ba098ec114ddec

export interface WithLocals {
    locals: Record<string, any> &
        Record<'db', IDatabase> &
        Record<'deliveryServicePrivateKey', string> &
        Record<'deliveryServiceProperties', DeliveryServiceProperties> &
        Record<'web3Provider', ethers.providers.JsonRpcProvider>;
}
