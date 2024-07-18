import {
    DeliveryServiceProperties,
    generateAuthJWT,
} from '@dm3-org/dm3-lib-delivery';
import { NotificationChannelType } from '@dm3-org/dm3-lib-shared';
import bodyParser from 'body-parser';
import express from 'express';
import request from 'supertest';
import notifications from './notifications';

const serverSecret = 'secret';

const keysA = {
    encryptionKeyPair: {
        publicKey: 'eHmMq29FeiPKfNPkSctPuZGXvV0sKeO/KZkX2nXvMgw=',
        privateKey: 'pMI77F2w3GK+omZCB4A61WDqISOOnWGXR2f/MTLbqbY=',
    },
    signingKeyPair: {
        publicKey: '+tkDQWZfv9ixBmObsf8tgTHTZajwAE9muTtFAUj2e9I=',
        privateKey:
            '+DpeBjCzICFoi743/466yJunsHR55Bhr3GnqcS4cuJX62QNBZl+/2LEGY5ux/y2BMdNlqPAAT2a5O0UBSPZ70g==',
    },
    storageEncryptionKey: '+DpeBjCzICFoi743/466yJunsHR55Bhr3GnqcS4cuJU=',
    storageEncryptionNonce: 0,
};

describe('Notifications', () => {
    // let db: IDatabase;
    // let web3Provider: ethers.providers.JsonRpcProvider;
    const deliveryServiceProperties: DeliveryServiceProperties = {
        messageTTL: 12345,
        sizeLimit: 456,
        notificationChannel: [],
    };

    // beforeEach(async () => {
    //     db = await getDatabase();
    // });

    describe('get NotificationChannels', () => {
        it('Returns empty array as global notification is turned off', async () => {
            const app = express();
            app.use(bodyParser.json());

            const db = {
                getAccount: async (ensName: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                        signedUserProfile: {
                            profile: {
                                publicSigningKey:
                                    keysA.signingKeyPair.publicKey,
                            },
                        },
                    }),
                setAccount: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                getUserStorage: async (addr: string) => {
                    return {};
                },
                getIdEnsName: async (ensName: string) => ensName,
                getGlobalNotification: async (ensName: string) =>
                    Promise.resolve({ isEnabled: false }),
                getUsersNotificationChannels: async (ensName: string) =>
                    Promise.resolve([]),
            };

            const web3Provider = {
                resolveName: async () =>
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
            };

            app.use(
                notifications(
                    deliveryServiceProperties,
                    db as any,
                    web3Provider as any,
                    serverSecret,
                ),
            );

            const token = generateAuthJWT('bob.eth', serverSecret);

            const { status, body } = await request(app)
                .get(`/bob.eth`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send();

            expect(status).toBe(200);
            expect(body).toEqual({
                notificationChannels: [],
            });
        });

        it('Returns 200 with empty notification channels as global notification is turned on', async () => {
            const app = express();
            app.use(bodyParser.json());
            const db = {
                getAccount: async (ensName: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                        signedUserProfile: {
                            profile: {
                                publicSigningKey:
                                    keysA.signingKeyPair.publicKey,
                            },
                        },
                    }),
                setAccount: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                getUserStorage: async (addr: string) => {
                    return {};
                },
                getIdEnsName: async (ensName: string) => ensName,
                getUsersNotificationChannels: async (ensName: string) =>
                    Promise.resolve([]),
                getGlobalNotification: async (ensName: string) =>
                    Promise.resolve({ isEnabled: true }),
            };

            const web3Provider = {
                resolveName: async () =>
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
            };

            app.use(
                notifications(
                    deliveryServiceProperties,
                    db as any,
                    web3Provider as any,
                    serverSecret,
                ),
            );

            const token = generateAuthJWT('bob.eth', serverSecret);

            const { status, body } = await request(app)
                .get(`/bob.eth`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send();

            expect(status).toBe(200);
            expect(body).toEqual({
                notificationChannels: [],
            });
        });
    });

    describe('Add Email as notification channel', () => {
        it('Returns 400 on setup email notifications as email ID is invalid', async () => {
            const app = express();
            app.use(bodyParser.json());
            const addUsersNotificationChannelMock = jest.fn();

            const db = {
                getAccount: async (ensName: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                    }),
                setAccount: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                setUserStorage: (_: string, __: string) => {},
                getIdEnsName: async (ensName: string) => ensName,
                addUsersNotificationChannel: addUsersNotificationChannelMock,
            };

            const web3Provider = {
                resolveName: async () =>
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
            };
            app.use(
                notifications(
                    deliveryServiceProperties,
                    db as any,
                    web3Provider as any,
                    serverSecret,
                ),
            );

            const token = generateAuthJWT('bob.eth', serverSecret);

            const { status } = await request(app)
                .post(`/bob.eth`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send({
                    recipientValue: 'bob.eth',
                    notificationChannelType: NotificationChannelType.EMAIL,
                });

            expect(status).toBe(400);
        });

        it('Returns 400 on setup email notifications as notificationChannelType is invalid', async () => {
            const app = express();
            app.use(bodyParser.json());
            const addUsersNotificationChannelMock = jest.fn();

            const db = {
                getAccount: async (ensName: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                    }),
                setAccount: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                setUserStorage: (_: string, __: string) => {},
                getIdEnsName: async (ensName: string) => ensName,
                addUsersNotificationChannel: addUsersNotificationChannelMock,
            };

            const web3Provider = {
                resolveName: async () =>
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
            };

            app.use(
                notifications(
                    deliveryServiceProperties,
                    db as any,
                    web3Provider as any,
                    serverSecret,
                ),
            );

            const token = generateAuthJWT('bob.eth', serverSecret);

            const { status } = await request(app)
                .post(`/bob.eth`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send({
                    recipientValue: 'bob@gamil.com',
                    notificationChannelType: '',
                });

            expect(status).toBe(400);
        });

        it('Returns 400 on setup email notifications as globalNotifications is turned off', async () => {
            const app = express();
            app.use(bodyParser.json());
            const addUsersNotificationChannelMock = jest.fn();

            const db = {
                getAccount: async (ensName: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                    }),
                setAccount: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                setUserStorage: (_: string, __: string) => {},
                getIdEnsName: async (ensName: string) => ensName,
                getGlobalNotification: async (ensName: string) =>
                    Promise.resolve({ isEnabled: false }),
                addUsersNotificationChannel: addUsersNotificationChannelMock,
            };

            const web3Provider = {
                resolveName: async () =>
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
            };
            app.use(
                notifications(
                    deliveryServiceProperties,
                    db as any,
                    web3Provider as any,
                    serverSecret,
                ),
            );

            const token = generateAuthJWT('bob.eth', serverSecret);

            const { status } = await request(app)
                .post(`/bob.eth`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send({
                    recipientValue: 'bob@gamil.com',
                    notificationChannelType: NotificationChannelType.EMAIL,
                });

            expect(status).toBe(400);
        });

        it('User can setup email notifications', async () => {
            const deliveryServiceProperties: DeliveryServiceProperties = {
                messageTTL: 12345,
                sizeLimit: 456,
                notificationChannel: [
                    {
                        type: NotificationChannelType.EMAIL,
                        config: {
                            smtpHost: 'smtp.gmail.com',
                            smtpPort: 587,
                            smtpEmail: 'abc@gmail.com',
                            smtpUsername: 'abc@gmail.com',
                            smtpPassword: 'abcd1234',
                        },
                    },
                ],
            };

            const app = express();
            app.use(bodyParser.json());

            const addNewNotificationChannelMock = jest.fn();
            const addUsersNotificationChannelMock = jest.fn();
            const setOtpMock = jest.fn();

            const db = {
                getAccount: async (ensName: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                    }),
                setAccount: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                setUserStorage: (_: string, __: string) => {},
                getIdEnsName: async (ensName: string) => ensName,
                getGlobalNotification: async (ensName: string) =>
                    Promise.resolve({ isEnabled: true }),
                getUsersNotificationChannels: async (ensName: string) =>
                    Promise.resolve([
                        {
                            type: NotificationChannelType.EMAIL,
                            config: {
                                recipientValue: 'bob@gmail.com',
                                isEnabled: true,
                                isVerified: false,
                            },
                        },
                    ]),
                addNewNotificationChannel: addNewNotificationChannelMock,
                addUsersNotificationChannel: addUsersNotificationChannelMock,
                setOtp: setOtpMock,
            };
            const web3Provider = {
                resolveName: async () =>
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
            };
            app.use(
                notifications(
                    deliveryServiceProperties,
                    db as any,
                    web3Provider as any,
                    serverSecret,
                ),
            );

            const token = generateAuthJWT('bob.eth', serverSecret);

            const { status, body } = await request(app)
                .post(`/bob.eth`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send({
                    recipientValue: 'bob@gmail.com',
                    notificationChannelType: NotificationChannelType.EMAIL,
                });

            expect(status).toBe(200);
        });

        it('Returns 400 as Email notification channel is not supported in delivery service', async () => {
            const app = express();
            app.use(bodyParser.json());

            const addNewNotificationChannelMock = jest.fn();
            const addUsersNotificationChannelMock = jest.fn();
            const setOtpMock = jest.fn();

            const db = {
                getAccount: async (ensName: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                    }),
                setAccount: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                setUserStorage: (_: string, __: string) => {},
                getIdEnsName: async (ensName: string) => ensName,
                getGlobalNotification: async (ensName: string) =>
                    Promise.resolve({ isEnabled: true }),
                getUsersNotificationChannels: async (ensName: string) =>
                    Promise.resolve([
                        {
                            type: NotificationChannelType.EMAIL,
                            config: {
                                recipientValue: 'bob@gmail.com',
                                isEnabled: true,
                                isVerified: false,
                            },
                        },
                    ]),
                addNewNotificationChannel: addNewNotificationChannelMock,
                addUsersNotificationChannel: addUsersNotificationChannelMock,
                setOtp: setOtpMock,
            };
            const web3Provider = {
                resolveName: async () =>
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
            };
            app.use(
                notifications(
                    deliveryServiceProperties,
                    db as any,
                    web3Provider as any,
                    serverSecret,
                ),
            );

            const token = generateAuthJWT('bob.eth', serverSecret);

            const { status, body } = await request(app)
                .post(`/bob.eth`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send({
                    recipientValue: 'bob@gmail.com',
                    notificationChannelType: NotificationChannelType.EMAIL,
                });
            expect(status).toBe(400);
            expect(body).toEqual({
                error: 'Notification channel EMAIL is currently not supported by the DS',
            });
        });
    });

    describe('Get Global Notification', () => {
        it('Returns 200 and false as global notification is not enabled', async () => {
            const app = express();
            app.use(bodyParser.json());
            const db = {
                getAccount: async (ensName: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                        signedUserProfile: {
                            profile: {
                                publicSigningKey:
                                    keysA.signingKeyPair.publicKey,
                            },
                        },
                    }),
                setAccount: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                getUserStorage: async (addr: string) => {
                    return {};
                },
                getIdEnsName: async (ensName: string) => ensName,
                getGlobalNotification: async (ensName: string) =>
                    Promise.resolve({
                        isEnabled: false,
                    }),
            };

            const web3Provider = {
                resolveName: async () =>
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
            };
            app.use(
                notifications(
                    deliveryServiceProperties,
                    db as any,
                    web3Provider as any,
                    serverSecret,
                ),
            );

            const token = generateAuthJWT('bob.eth', serverSecret);

            const { status, body } = await request(app)
                .get(`/global/bob.eth`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send();

            expect(status).toBe(200);
            expect(body).toEqual({
                isEnabled: false,
            });
        });
    });

    describe('Set Global Notification', () => {
        it('Enable global notifications', async () => {
            const app = express();
            app.use(bodyParser.json());
            const setGlobalNotificationMock = jest.fn();

            const db = {
                getAccount: async (ensName: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                    }),
                setAccount: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                setUserStorage: (_: string, __: string) => {},
                getIdEnsName: async (ensName: string) => ensName,
                setGlobalNotification: setGlobalNotificationMock,
            };
            const web3Provider = {
                resolveName: async () =>
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
            };

            app.use(
                notifications(
                    deliveryServiceProperties,
                    db as any,
                    web3Provider as any,
                    serverSecret,
                ),
            );

            const token = generateAuthJWT('bob.eth', serverSecret);

            const { status } = await request(app)
                .post(`/global/bob.eth`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send({
                    isEnabled: true,
                });

            expect(status).toBe(200);
            expect(setGlobalNotificationMock).toHaveBeenCalledWith(
                'bob.eth',
                true,
            );
        });

        it('Disable global notifications', async () => {
            const app = express();
            app.use(bodyParser.json());
            const setGlobalNotificationMock = jest.fn();

            const db = {
                getAccount: async (ensName: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                    }),
                setAccount: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                setUserStorage: (_: string, __: string) => {},
                getIdEnsName: async (ensName: string) => ensName,
                setGlobalNotification: setGlobalNotificationMock,
            };
            const web3Provider = {
                resolveName: async () =>
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
            };
            app.use(
                notifications(
                    deliveryServiceProperties,
                    db as any,
                    web3Provider as any,
                    serverSecret,
                ),
            );

            const token = generateAuthJWT('bob.eth', serverSecret);

            const { status } = await request(app)
                .post(`/global/bob.eth`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send({
                    isEnabled: false,
                });

            expect(status).toBe(200);
            expect(setGlobalNotificationMock).toHaveBeenCalledWith(
                'bob.eth',
                false,
            );
        });

        it('Returns 400 if req.body is invalid', async () => {
            const app = express();
            app.use(bodyParser.json());
            const setGlobalNotificationMock = jest.fn();

            const db = {
                getAccount: async (ensName: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                    }),
                setAccount: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                setUserStorage: (_: string, __: string) => {},
                getIdEnsName: async (ensName: string) => ensName,
                setGlobalNotification: setGlobalNotificationMock,
            };
            const web3Provider = {
                resolveName: async () =>
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
            };
            app.use(
                notifications(
                    deliveryServiceProperties,
                    db as any,
                    web3Provider as any,
                    serverSecret,
                ),
            );

            const token = generateAuthJWT('bob.eth', serverSecret);

            const { status } = await request(app)
                .post(`/global/bob.eth`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send({
                    isEnabled: '',
                });

            expect(status).toBe(400);
        });
    });

    describe('Resend OTP', () => {
        it('Returns 400 on resend email verification OTP as globalNotifications is turned off', async () => {
            const app = express();
            app.use(bodyParser.json());
            const resendOtpMock = jest.fn();

            const db = {
                getAccount: async (ensName: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                    }),
                setAccount: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                setUserStorage: (_: string, __: string) => {},
                getIdEnsName: async (ensName: string) => ensName,
                getGlobalNotification: async (ensName: string) =>
                    Promise.resolve({ isEnabled: false }),
                resendOtp: resendOtpMock,
            };

            const web3Provider = {
                resolveName: async () =>
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
            };
            app.use(
                notifications(
                    deliveryServiceProperties,
                    db as any,
                    web3Provider as any,
                    serverSecret,
                ),
            );

            const token = generateAuthJWT('bob.eth', serverSecret);

            const { status } = await request(app)
                .post(`/otp/bob.eth`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send({
                    notificationChannelType: NotificationChannelType.EMAIL,
                });

            expect(status).toBe(400);
        });

        it('Returns 400 on resend email verification OTP as notificationChannelType is invalid', async () => {
            const app = express();
            app.use(bodyParser.json());
            const resendOtpMock = jest.fn();

            const db = {
                getAccount: async (ensName: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                    }),
                setAccount: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                setUserStorage: (_: string, __: string) => {},
                getIdEnsName: async (ensName: string) => ensName,
                resendOtp: resendOtpMock,
            };

            const web3Provider = {
                resolveName: async () =>
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
            };

            app.use(
                notifications(
                    deliveryServiceProperties,
                    db as any,
                    web3Provider as any,
                    serverSecret,
                ),
            );

            const token = generateAuthJWT('bob.eth', serverSecret);

            const { status } = await request(app)
                .post(`/otp/bob.eth`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send({
                    notificationChannelType: '',
                });

            expect(status).toBe(400);
        });

        it('Resend email verification OTP', async () => {
            const deliveryServiceProperties: DeliveryServiceProperties = {
                messageTTL: 12345,
                sizeLimit: 456,
                notificationChannel: [
                    {
                        type: NotificationChannelType.EMAIL,
                        config: {
                            smtpHost: 'smtp.gmail.com',
                            smtpPort: 587,
                            smtpEmail: 'abc@gmail.com',
                            smtpUsername: 'abc@gmail.com',
                            smtpPassword: 'abcd1234',
                        },
                    },
                ],
            };

            const app = express();
            app.use(bodyParser.json());

            const resendOtpMock = jest.fn();
            const setOtpMock = jest.fn();
            const addUsersNotificationChannelMock = jest.fn();
            const getOtpMock = jest.fn();

            const db = {
                getAccount: async (ensName: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                    }),
                setAccount: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                setUserStorage: (_: string, __: string) => {},
                getIdEnsName: async (ensName: string) => ensName,
                getGlobalNotification: async (ensName: string) =>
                    Promise.resolve({ isEnabled: true }),
                getUsersNotificationChannels: async (ensName: string) =>
                    Promise.resolve([
                        {
                            type: NotificationChannelType.EMAIL,
                            config: {
                                recipientValue: 'bob@gmail.com',
                                isEnabled: true,
                                isVerified: false,
                            },
                        },
                    ]),
                resendOtp: resendOtpMock,
                addUsersNotificationChannel: addUsersNotificationChannelMock,
                setOtp: setOtpMock,
                getOtp: getOtpMock,
            };
            const web3Provider = {
                resolveName: async () =>
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
            };
            app.use(
                notifications(
                    deliveryServiceProperties,
                    db as any,
                    web3Provider as any,
                    serverSecret,
                ),
            );

            const token = generateAuthJWT('bob.eth', serverSecret);

            const { status, body } = await request(app)
                .post(`/otp/bob.eth`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send({
                    notificationChannelType: NotificationChannelType.EMAIL,
                });

            expect(status).toBe(200);
        });
    });

    describe('Verify OTP', () => {
        it('Returns 400 on verify email OTP as otp is not set in body', async () => {
            const app = express();
            app.use(bodyParser.json());
            const verifyOtpMock = jest.fn();

            const db = {
                getAccount: async (ensName: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                    }),
                setAccount: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                setUserStorage: (_: string, __: string) => {},
                getIdEnsName: async (ensName: string) => ensName,
                getGlobalNotification: async (ensName: string) =>
                    Promise.resolve({ isEnabled: true }),
                verifyOtp: verifyOtpMock,
            };

            const web3Provider = {
                resolveName: async () =>
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
            };
            app.use(
                notifications(
                    deliveryServiceProperties,
                    db as any,
                    web3Provider as any,
                    serverSecret,
                ),
            );

            const token = generateAuthJWT('bob.eth', serverSecret);

            const { status, body } = await request(app)
                .post(`/otp/verify/bob.eth`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send({
                    notificationChannelType: NotificationChannelType.EMAIL,
                });

            expect(status).toBe(400);
            expect(body).toStrictEqual({
                error: 'OTP is missing',
            });
        });

        it('Returns 400 on verify email OTP as notification channel is not set in body', async () => {
            const app = express();
            app.use(bodyParser.json());
            const verifyOtpMock = jest.fn();

            const db = {
                getAccount: async (ensName: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                    }),
                setAccount: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                setUserStorage: (_: string, __: string) => {},
                getIdEnsName: async (ensName: string) => ensName,
                getGlobalNotification: async (ensName: string) =>
                    Promise.resolve({ isEnabled: true }),
                verifyOtp: verifyOtpMock,
            };

            const web3Provider = {
                resolveName: async () =>
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
            };
            app.use(
                notifications(
                    deliveryServiceProperties,
                    db as any,
                    web3Provider as any,
                    serverSecret,
                ),
            );

            const token = generateAuthJWT('bob.eth', serverSecret);

            const { status, body } = await request(app)
                .post(`/otp/verify/bob.eth`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send({
                    otp: '17634',
                });

            expect(status).toBe(400);
            expect(body).toStrictEqual({
                error: 'Notification Channel Type is missing',
            });
        });

        it('Returns 400 on verify email OTP as notification channel is invalid', async () => {
            const app = express();
            app.use(bodyParser.json());
            const verifyOtpMock = jest.fn();

            const db = {
                getAccount: async (ensName: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                    }),
                setAccount: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                setUserStorage: (_: string, __: string) => {},
                getIdEnsName: async (ensName: string) => ensName,
                getGlobalNotification: async (ensName: string) =>
                    Promise.resolve({ isEnabled: true }),
                verifyOtp: verifyOtpMock,
            };

            const web3Provider = {
                resolveName: async () =>
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
            };
            app.use(
                notifications(
                    deliveryServiceProperties,
                    db as any,
                    web3Provider as any,
                    serverSecret,
                ),
            );

            const token = generateAuthJWT('bob.eth', serverSecret);

            const { status, body } = await request(app)
                .post(`/otp/verify/bob.eth`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send({
                    otp: '17634',
                    notificationChannelType: 'test',
                });

            expect(status).toBe(400);
            expect(body).toStrictEqual({
                error: 'Invalid notification channel type',
            });
        });

        it('Should verify email OTP', async () => {
            const deliveryServiceProperties: DeliveryServiceProperties = {
                messageTTL: 12345,
                sizeLimit: 456,
                notificationChannel: [
                    {
                        type: NotificationChannelType.EMAIL,
                        config: {
                            smtpHost: 'smtp.gmail.com',
                            smtpPort: 587,
                            smtpEmail: 'abc@gmail.com',
                            smtpUsername: 'abc@gmail.com',
                            smtpPassword: 'abcd1234',
                        },
                    },
                ],
            };

            const getUsersNotificationChannels = () =>
                Promise.resolve([
                    {
                        type: NotificationChannelType.EMAIL,
                        config: {
                            recipientValue: 'bob@gmail.com',
                            isVerified: false,
                            isEnabled: true,
                        },
                    },
                ]);

            const getOtp = () =>
                Promise.resolve({
                    otp: '12345',
                    type: NotificationChannelType.EMAIL,
                    generatedAt: new Date(),
                });

            const resetOtpMock = jest.fn();
            const setNotificationChannelAsVerifiedMock = jest.fn();

            const db = {
                getAccount: async (ensName: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                    }),
                setAccount: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                setUserStorage: (_: string, __: string) => {},
                getIdEnsName: async (ensName: string) => ensName,
                getGlobalNotification: async (ensName: string) =>
                    Promise.resolve({ isEnabled: true }),
                getOtp: getOtp,
                getUsersNotificationChannels: getUsersNotificationChannels,
                resetOtp: resetOtpMock,
                setNotificationChannelAsVerified:
                    setNotificationChannelAsVerifiedMock,
            };

            const web3Provider = {
                resolveName: async () =>
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
            };

            const app = express();
            app.use(bodyParser.json());
            app.use(
                notifications(
                    deliveryServiceProperties,
                    db as any,
                    web3Provider as any,
                    serverSecret,
                ),
            );

            const token = generateAuthJWT('bob.eth', serverSecret);

            const { status } = await request(app)
                .post(`/otp/verify/bob.eth`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send({
                    otp: '12345',
                    notificationChannelType: NotificationChannelType.EMAIL,
                });

            expect(status).toBe(200);
        });
    });

    describe('Enable/Disable Email notification channel', () => {
        it('Returns 400 as isEnabled is not set in body', async () => {
            const db = {
                getAccount: async (ensName: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                    }),
                setAccount: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                setUserStorage: (_: string, __: string) => {},
                getIdEnsName: async (ensName: string) => ensName,
                getGlobalNotification: async (ensName: string) =>
                    Promise.resolve({ isEnabled: true }),
            };

            const web3Provider = {
                resolveName: async () =>
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
            };
            const app = express();
            app.use(bodyParser.json());
            app.use(
                notifications(
                    deliveryServiceProperties,
                    db as any,
                    web3Provider as any,
                    serverSecret,
                ),
            );

            const token = generateAuthJWT('bob.eth', serverSecret);

            const { status, body } = await request(app)
                .post(`/channel/bob.eth`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send({
                    notificationChannelType: NotificationChannelType.EMAIL,
                });

            expect(status).toBe(400);
            expect(body).toStrictEqual({
                error: 'isEnabled value is missing',
            });
        });

        it('Returns 400 as isEnabled value is invalid in body', async () => {
            const db = {
                getAccount: async (ensName: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                    }),
                setAccount: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                setUserStorage: (_: string, __: string) => {},
                getIdEnsName: async (ensName: string) => ensName,
                getGlobalNotification: async (ensName: string) =>
                    Promise.resolve({ isEnabled: true }),
            };

            const web3Provider = {
                resolveName: async () =>
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
            };
            const app = express();
            app.use(bodyParser.json());
            app.use(
                notifications(
                    deliveryServiceProperties,
                    db as any,
                    web3Provider as any,
                    serverSecret,
                ),
            );

            const token = generateAuthJWT('bob.eth', serverSecret);

            const { status, body } = await request(app)
                .post(`/channel/bob.eth`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send({
                    isEnabled: 'test',
                    notificationChannelType: NotificationChannelType.EMAIL,
                });

            expect(status).toBe(400);
            expect(body).toStrictEqual({
                error: 'isEnabled must have boolean value',
            });
        });

        it('Returns 400 as notification channel type is not set in body', async () => {
            const db = {
                getAccount: async (ensName: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                    }),
                setAccount: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                setUserStorage: (_: string, __: string) => {},
                getIdEnsName: async (ensName: string) => ensName,
                getGlobalNotification: async (ensName: string) =>
                    Promise.resolve({ isEnabled: true }),
            };

            const web3Provider = {
                resolveName: async () =>
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
            };

            const app = express();
            app.use(bodyParser.json());
            app.use(
                notifications(
                    deliveryServiceProperties,
                    db as any,
                    web3Provider as any,
                    serverSecret,
                ),
            );

            const token = generateAuthJWT('bob.eth', serverSecret);

            const { status, body } = await request(app)
                .post(`/channel/bob.eth`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send({
                    isEnabled: true,
                });

            expect(status).toBe(400);
            expect(body).toStrictEqual({
                error: 'Notification Channel Type is missing',
            });
        });

        it('Returns 400 as notification channel type value is invalid in body', async () => {
            const db = {
                getAccount: async (ensName: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                    }),
                setAccount: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                setUserStorage: (_: string, __: string) => {},
                getIdEnsName: async (ensName: string) => ensName,
                getGlobalNotification: async (ensName: string) =>
                    Promise.resolve({ isEnabled: true }),
            };

            const web3Provider = {
                resolveName: async () =>
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
            };
            const app = express();
            app.use(bodyParser.json());
            app.use(
                notifications(
                    deliveryServiceProperties,
                    db as any,
                    web3Provider as any,
                    serverSecret,
                ),
            );

            const token = generateAuthJWT('bob.eth', serverSecret);

            const { status, body } = await request(app)
                .post(`/channel/bob.eth`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send({
                    isEnabled: true,
                    notificationChannelType: 'test',
                });

            expect(status).toBe(400);
            expect(body).toStrictEqual({
                error: 'Invalid notification channel type',
            });
        });

        it('Returns 400 as global notification channel is turned off', async () => {
            const db = {
                getAccount: async (ensName: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                    }),
                setAccount: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                setUserStorage: (_: string, __: string) => {},
                getIdEnsName: async (ensName: string) => ensName,
                getGlobalNotification: async (ensName: string) =>
                    Promise.resolve({ isEnabled: false }),
            };

            const web3Provider = {
                resolveName: async () =>
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
            };

            const app = express();
            app.use(bodyParser.json());
            app.use(
                notifications(
                    deliveryServiceProperties,
                    db as any,
                    web3Provider as any,
                    serverSecret,
                ),
            );

            const token = generateAuthJWT('bob.eth', serverSecret);

            const { status, body } = await request(app)
                .post(`/channel/bob.eth`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send({
                    isEnabled: true,
                    notificationChannelType: NotificationChannelType.EMAIL,
                });

            expect(status).toBe(400);
            expect(body).toStrictEqual({
                error: 'Global notifications is off',
            });
        });

        it('Should disable email notification channel', async () => {
            const deliveryServiceProperties: DeliveryServiceProperties = {
                messageTTL: 12345,
                sizeLimit: 456,
                notificationChannel: [
                    {
                        type: NotificationChannelType.EMAIL,
                        config: {
                            smtpHost: 'smtp.gmail.com',
                            smtpPort: 587,
                            smtpEmail: 'abc@gmail.com',
                            smtpUsername: 'abc@gmail.com',
                            smtpPassword: 'abcd1234',
                        },
                    },
                ],
            };

            const db = {
                getAccount: async (ensName: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                    }),
                setAccount: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                setUserStorage: (_: string, __: string) => {},
                getIdEnsName: async (ensName: string) => ensName,
                getGlobalNotification: async (ensName: string) =>
                    Promise.resolve({ isEnabled: true }),
                getUsersNotificationChannels: async (ensName: string) =>
                    Promise.resolve([
                        {
                            type: NotificationChannelType.EMAIL,
                            config: {
                                recipientValue: 'abc@gmail.com',
                                isEnabled: true,
                                isVerified: false,
                            },
                        },
                    ]),
                enableOrDisableNotificationChannel: jest.fn(),
            };

            const web3Provider = {
                resolveName: async () =>
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
            };

            const app = express();
            app.use(bodyParser.json());
            app.use(
                notifications(
                    deliveryServiceProperties,
                    db as any,
                    web3Provider as any,
                    serverSecret,
                ),
            );

            const token = generateAuthJWT('bob.eth', serverSecret);

            const { status, body } = await request(app)
                .post(`/channel/bob.eth`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send({
                    isEnabled: false,
                    notificationChannelType: NotificationChannelType.EMAIL,
                });

            expect(status).toBe(200);
        });

        it('Should enable email notification channel', async () => {
            const deliveryServiceProperties: DeliveryServiceProperties = {
                messageTTL: 12345,
                sizeLimit: 456,
                notificationChannel: [
                    {
                        type: NotificationChannelType.EMAIL,
                        config: {
                            smtpHost: 'smtp.gmail.com',
                            smtpPort: 587,
                            smtpEmail: 'abc@gmail.com',
                            smtpUsername: 'abc@gmail.com',
                            smtpPassword: 'abcd1234',
                        },
                    },
                ],
            };

            const db = {
                getAccount: async (ensName: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                    }),
                setAccount: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                setUserStorage: (_: string, __: string) => {},
                getIdEnsName: async (ensName: string) => ensName,
                getGlobalNotification: async (ensName: string) =>
                    Promise.resolve({ isEnabled: true }),
                getUsersNotificationChannels: async (ensName: string) =>
                    Promise.resolve([
                        {
                            type: NotificationChannelType.EMAIL,
                            config: {
                                recipientValue: 'abc@gmail.com',
                                isEnabled: false,
                                isVerified: false,
                            },
                        },
                    ]),
                enableOrDisableNotificationChannel: jest.fn(),
            };

            const web3Provider = {
                resolveName: async () =>
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
            };

            const app = express();
            app.use(bodyParser.json());
            app.use(
                notifications(
                    deliveryServiceProperties,
                    db as any,
                    web3Provider as any,
                    serverSecret,
                ),
            );

            const token = generateAuthJWT('bob.eth', serverSecret);

            const { status, body } = await request(app)
                .post(`/channel/bob.eth`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send({
                    isEnabled: true,
                    notificationChannelType: NotificationChannelType.EMAIL,
                });

            expect(status).toBe(200);
        });
    });

    describe('Remove Email notification channel', () => {
        it('Returns 400 on as channel type is invalid in params', async () => {
            const db = {
                getAccount: async (ensName: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                    }),
                setAccount: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                setUserStorage: (_: string, __: string) => {},
                getIdEnsName: async (ensName: string) => ensName,
                getGlobalNotification: async (ensName: string) =>
                    Promise.resolve({ isEnabled: true }),
            };

            const web3Provider = {
                resolveName: async () =>
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
            };

            const app = express();
            app.use(bodyParser.json());
            app.use(
                notifications(
                    deliveryServiceProperties,
                    db as any,
                    web3Provider as any,
                    serverSecret,
                ),
            );

            const token = generateAuthJWT('bob.eth', serverSecret);

            const { status, body } = await request(app)
                .delete(`/channel/test/bob.eth`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send();

            expect(status).toBe(400);
            expect(body).toStrictEqual({
                error: 'Invalid notification channel type',
            });
        });

        it('Returns 400 as global notifications is turned off', async () => {
            const db = {
                getAccount: async (ensName: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                    }),
                setAccount: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                setUserStorage: (_: string, __: string) => {},
                getIdEnsName: async (ensName: string) => ensName,
                getGlobalNotification: async (ensName: string) =>
                    Promise.resolve({ isEnabled: false }),
            };

            const web3Provider = {
                resolveName: async () =>
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
            };

            const app = express();
            app.use(bodyParser.json());
            app.use(
                notifications(
                    deliveryServiceProperties,
                    db as any,
                    web3Provider as any,
                    serverSecret,
                ),
            );

            const token = generateAuthJWT('bob.eth', serverSecret);

            const { status, body } = await request(app)
                .delete(`/channel/EMAIL/bob.eth`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send();

            expect(status).toBe(400);
            expect(body).toStrictEqual({
                error: 'Global notifications is off',
            });
        });

        it('Removes Email notification channel', async () => {
            const getUsersNotificationChannels = () =>
                Promise.resolve([
                    {
                        type: NotificationChannelType.EMAIL,
                        config: {
                            recipientValue: 'bob@gmail.com',
                            isVerified: false,
                            isEnabled: true,
                        },
                    },
                ]);

            const removeNotificationChannelMock = jest.fn();

            const db = {
                getAccount: async (ensName: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                    }),
                setAccount: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                setUserStorage: (_: string, __: string) => {},
                getIdEnsName: async (ensName: string) => ensName,
                getGlobalNotification: async (ensName: string) =>
                    Promise.resolve({ isEnabled: true }),
                getUsersNotificationChannels: getUsersNotificationChannels,
                removeNotificationChannel: removeNotificationChannelMock,
            };

            const web3Provider = {
                resolveName: async () =>
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
            };
            const app = express();
            app.use(bodyParser.json());
            app.use(
                notifications(
                    deliveryServiceProperties,
                    db as any,
                    web3Provider as any,
                    serverSecret,
                ),
            );

            const token = generateAuthJWT('bob.eth', serverSecret);

            const { status, body } = await request(app)
                .delete(`/channel/EMAIL/bob.eth`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send();

            expect(status).toBe(200);
            expect(removeNotificationChannelMock).toHaveBeenCalled();
        });
    });

    describe('Add Push notification channel', () => {
        const recipientValue = {
            endpoint: 'https://fcm.googleapis.com/fcm/send/fV_Q01aiMDA',
            expirationTime: null,
            keys: {
                p256dh: 'BHgo7M85NfnSSf1UlWh78dkuh79vEIjzGlF_EpBD4HEzrh9gnKO_A',
                auth: 'W2O_Dnhiv7Xy29dn6Djbfd57989kgkgkgjvjg',
            },
        };

        it("Returns 400 on setup push notifications as subscription data doesn't contain endpoint", async () => {
            const app = express();
            app.use(bodyParser.json());
            const addUsersNotificationChannelMock = jest.fn();

            const db = {
                getAccount: async (ensName: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                    }),
                setAccount: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                setUserStorage: (_: string, __: string) => {},
                getIdEnsName: async (ensName: string) => ensName,
                addUsersNotificationChannel: addUsersNotificationChannelMock,
            };

            const web3Provider = {
                resolveName: async () =>
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
            };
            app.use(
                notifications(
                    deliveryServiceProperties,
                    db as any,
                    web3Provider as any,
                    serverSecret,
                ),
            );

            const token = generateAuthJWT('bob.eth', serverSecret);

            const recipientValue = {
                expirationTime: null,
                keys: {
                    p256dh: 'BHgo7M85NfnSSf1UlWh78dkuh797878QMCGGxVrOOd0s8Tl041pTl6dR1mGmtRwoanw4PoaNjvEIjzGlF_EpBD4HEzrh9gnKO_A',
                    auth: 'W2O_Dnhiv7Xy29dn6Djbfd5t68tyu7989kgkgkgjvjg',
                },
            };

            const { status } = await request(app)
                .post(`/bob.eth`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send({
                    recipientValue: recipientValue,
                    notificationChannelType: NotificationChannelType.PUSH,
                });

            expect(status).toBe(400);
        });

        it("Returns 400 on setup push notifications as subscription data doesn't contain keys", async () => {
            const app = express();
            app.use(bodyParser.json());
            const addUsersNotificationChannelMock = jest.fn();

            const db = {
                getAccount: async (ensName: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                    }),
                setAccount: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                setUserStorage: (_: string, __: string) => {},
                getIdEnsName: async (ensName: string) => ensName,
                addUsersNotificationChannel: addUsersNotificationChannelMock,
            };

            const web3Provider = {
                resolveName: async () =>
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
            };
            app.use(
                notifications(
                    deliveryServiceProperties,
                    db as any,
                    web3Provider as any,
                    serverSecret,
                ),
            );

            const token = generateAuthJWT('bob.eth', serverSecret);

            const recipientValue = {
                endpoint:
                    'https://fcm.googleapis.com/fcm/send/fV_Q01aiMDA:APA91bGJx9DrtdrGmyM9QaFGOVMCr8i4qtDsb16yCA5smpBiRsdUwH7nro_CFSaRpoQJ7Gg' +
                    'A7qgkS5j27TRahfibryi7f4Fz9yDnGhCImmzk7mtPu9089080802iTrWJJVKzTGpgQqKqns0ifKEEietAGBO',
                expirationTime: null,
            };

            const { status } = await request(app)
                .post(`/bob.eth`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send({
                    recipientValue: recipientValue,
                    notificationChannelType: NotificationChannelType.PUSH,
                });

            expect(status).toBe(400);
        });

        it("Returns 400 on setup push notifications as subscription data doesn't contain p256dh", async () => {
            const app = express();
            app.use(bodyParser.json());
            const addUsersNotificationChannelMock = jest.fn();

            const db = {
                getAccount: async (ensName: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                    }),
                setAccount: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                setUserStorage: (_: string, __: string) => {},
                getIdEnsName: async (ensName: string) => ensName,
                addUsersNotificationChannel: addUsersNotificationChannelMock,
            };

            const web3Provider = {
                resolveName: async () =>
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
            };
            app.use(
                notifications(
                    deliveryServiceProperties,
                    db as any,
                    web3Provider as any,
                    serverSecret,
                ),
            );

            const token = generateAuthJWT('bob.eth', serverSecret);

            const recipientValue = {
                endpoint:
                    'https://fcm.googleapis.com/fcm/send/fV_Q01aiMDA:APA91bGJx9DrtdrGmyM9QaFGOVMCr8i4qtDsb16yCA5smpBiRsdUwH7nro_CFSaRpoQJ7Gg' +
                    'A7qgkS5j27TRahfibryi7f4Fz9yDnGhCImmzk7mtPu9089080802iTrWJJVKzTGpgQqKqns0ifKEEietAGBO',
                expirationTime: null,
                keys: {
                    auth: 'W2O_Dnhiv7Xy29dn6Djbfd5t68tyu7989kgkgkgjvjg',
                },
            };

            const { status } = await request(app)
                .post(`/bob.eth`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send({
                    recipientValue: recipientValue,
                    notificationChannelType: NotificationChannelType.PUSH,
                });

            expect(status).toBe(400);
        });

        it("Returns 400 on setup push notifications as subscription data doesn't contain auth", async () => {
            const app = express();
            app.use(bodyParser.json());
            const addUsersNotificationChannelMock = jest.fn();

            const db = {
                getAccount: async (ensName: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                    }),
                setAccount: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                setUserStorage: (_: string, __: string) => {},
                getIdEnsName: async (ensName: string) => ensName,
                addUsersNotificationChannel: addUsersNotificationChannelMock,
            };

            const web3Provider = {
                resolveName: async () =>
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
            };
            app.use(
                notifications(
                    deliveryServiceProperties,
                    db as any,
                    web3Provider as any,
                    serverSecret,
                ),
            );

            const token = generateAuthJWT('bob.eth', serverSecret);

            const recipientValue = {
                endpoint:
                    'https://fcm.googleapis.com/fcm/send/fV_Q01aiMDA:APA91bGJx9DrtdrGmyM9QaFGOVMCr8i4qtDsb16yCA5smpBiRsdUwH7nro_CFSaRpoQJ7Gg' +
                    'A7qgkS5j27TRahfibryi7f4Fz9yDnGhCImmzk7mtPu9089080802iTrWJJVKzTGpgQqKqns0ifKEEietAGBO',
                expirationTime: null,
                keys: {
                    p256dh: 'BHgo7M85NfnSSf1UlWh78dkuh797878QMCGGxVrOOd0s8Tl041pTl6dR1mGmtRwoanw4PoaNjvEIjzGlF_EpBD4HEzrh9gnKO_A',
                },
            };

            const { status } = await request(app)
                .post(`/bob.eth`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send({
                    recipientValue: recipientValue,
                    notificationChannelType: NotificationChannelType.PUSH,
                });

            expect(status).toBe(400);
        });

        it('Returns 400 on setup push notifications as subscription data is invalid', async () => {
            const app = express();
            app.use(bodyParser.json());
            const addUsersNotificationChannelMock = jest.fn();

            const db = {
                getAccount: async (ensName: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                    }),
                setAccount: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                setUserStorage: (_: string, __: string) => {},
                getIdEnsName: async (ensName: string) => ensName,
                addUsersNotificationChannel: addUsersNotificationChannelMock,
            };

            const web3Provider = {
                resolveName: async () =>
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
            };
            app.use(
                notifications(
                    deliveryServiceProperties,
                    db as any,
                    web3Provider as any,
                    serverSecret,
                ),
            );

            const token = generateAuthJWT('bob.eth', serverSecret);

            const { status } = await request(app)
                .post(`/bob.eth`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send({
                    recipientValue: 'bob.eth',
                    notificationChannelType: NotificationChannelType.PUSH,
                });

            expect(status).toBe(400);
        });

        it('Returns 400 on setup push notifications as notificationChannelType is invalid', async () => {
            const app = express();
            app.use(bodyParser.json());
            const addUsersNotificationChannelMock = jest.fn();

            const db = {
                getAccount: async (ensName: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                    }),
                setAccount: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                setUserStorage: (_: string, __: string) => {},
                getIdEnsName: async (ensName: string) => ensName,
                addUsersNotificationChannel: addUsersNotificationChannelMock,
            };

            const web3Provider = {
                resolveName: async () =>
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
            };

            app.use(
                notifications(
                    deliveryServiceProperties,
                    db as any,
                    web3Provider as any,
                    serverSecret,
                ),
            );

            const token = generateAuthJWT('bob.eth', serverSecret);

            const { status } = await request(app)
                .post(`/bob.eth`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send({
                    recipientValue: recipientValue,
                    notificationChannelType: '',
                });

            expect(status).toBe(400);
        });

        it('Returns 400 on setup push notifications as globalNotifications is turned off', async () => {
            const app = express();
            app.use(bodyParser.json());
            const addUsersNotificationChannelMock = jest.fn();

            const db = {
                getAccount: async (ensName: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                    }),
                setAccount: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                setUserStorage: (_: string, __: string) => {},
                getIdEnsName: async (ensName: string) => ensName,
                getGlobalNotification: async (ensName: string) =>
                    Promise.resolve({ isEnabled: false }),
                addUsersNotificationChannel: addUsersNotificationChannelMock,
            };

            const web3Provider = {
                resolveName: async () =>
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
            };
            app.use(
                notifications(
                    deliveryServiceProperties,
                    db as any,
                    web3Provider as any,
                    serverSecret,
                ),
            );

            const token = generateAuthJWT('bob.eth', serverSecret);

            const { status } = await request(app)
                .post(`/bob.eth`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send({
                    recipientValue: recipientValue,
                    notificationChannelType: NotificationChannelType.PUSH,
                });

            expect(status).toBe(400);
        });

        it('User can setup PUSH notifications', async () => {
            const deliveryServiceProperties: DeliveryServiceProperties = {
                messageTTL: 12345,
                sizeLimit: 456,
                notificationChannel: [
                    {
                        type: NotificationChannelType.PUSH,
                        config: {
                            vapidEmailId: 'test@gmail.com',
                            publicVapidKey: 'dbiwqeqwewqosa',
                            privateVapidKey: 'wqieyiwqeqwnsd',
                        },
                    },
                ],
            };

            const app = express();
            app.use(bodyParser.json());

            const addNewNotificationChannelMock = jest.fn();
            const addUsersNotificationChannelMock = jest.fn();
            const setNotificationChannelAsVerifiedMock = jest.fn();

            const db = {
                getAccount: async (ensName: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                    }),
                setAccount: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                setUserStorage: (_: string, __: string) => {},
                getIdEnsName: async (ensName: string) => ensName,
                getGlobalNotification: async (ensName: string) =>
                    Promise.resolve({ isEnabled: true }),
                getUsersNotificationChannels: async (ensName: string) =>
                    Promise.resolve([
                        {
                            type: NotificationChannelType.PUSH,
                            config: {
                                recipientValue: JSON.stringify(recipientValue),
                                isEnabled: true,
                                isVerified: true,
                            },
                        },
                    ]),
                setNotificationChannelAsVerified:
                    setNotificationChannelAsVerifiedMock,
                addNewNotificationChannel: addNewNotificationChannelMock,
                addUsersNotificationChannel: addUsersNotificationChannelMock,
            };
            const web3Provider = {
                resolveName: async () =>
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
            };
            app.use(
                notifications(
                    deliveryServiceProperties,
                    db as any,
                    web3Provider as any,
                    serverSecret,
                ),
            );

            const token = generateAuthJWT('bob.eth', serverSecret);

            const { status, body } = await request(app)
                .post(`/bob.eth`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send({
                    recipientValue: JSON.stringify(recipientValue),
                    notificationChannelType: NotificationChannelType.PUSH,
                });

            expect(status).toBe(200);
        });

        it('Returns 400 as Push notification channel is not supported in delivery service', async () => {
            const app = express();
            app.use(bodyParser.json());

            const addNewNotificationChannelMock = jest.fn();
            const addUsersNotificationChannelMock = jest.fn();

            const db = {
                getAccount: async (ensName: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                    }),
                setAccount: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                setUserStorage: (_: string, __: string) => {},
                getIdEnsName: async (ensName: string) => ensName,
                getGlobalNotification: async (ensName: string) =>
                    Promise.resolve({ isEnabled: true }),
                getUsersNotificationChannels: async (ensName: string) =>
                    Promise.resolve([
                        {
                            type: NotificationChannelType.PUSH,
                            config: {
                                recipientValue: JSON.stringify(recipientValue),
                                isEnabled: true,
                                isVerified: false,
                            },
                        },
                    ]),
                addNewNotificationChannel: addNewNotificationChannelMock,
                addUsersNotificationChannel: addUsersNotificationChannelMock,
            };
            const web3Provider = {
                resolveName: async () =>
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
            };

            app.use(
                notifications(
                    deliveryServiceProperties,
                    db as any,
                    web3Provider as any,
                    serverSecret,
                ),
            );

            const token = generateAuthJWT('bob.eth', serverSecret);

            const { status, body } = await request(app)
                .post(`/bob.eth`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send({
                    recipientValue: JSON.stringify(recipientValue),
                    notificationChannelType: NotificationChannelType.PUSH,
                });
            expect(status).toBe(400);
            expect(body).toEqual({
                error: 'Notification channel PUSH is currently not supported by the DS',
            });
        });
    });

    describe('Remove Push notification channel', () => {
        it('Returns 400 on as channel type is invalid in params', async () => {
            const db = {
                getAccount: async (ensName: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                    }),
                setAccount: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                setUserStorage: (_: string, __: string) => {},
                getIdEnsName: async (ensName: string) => ensName,
                getGlobalNotification: async (ensName: string) =>
                    Promise.resolve({ isEnabled: true }),
            };

            const web3Provider = {
                resolveName: async () =>
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
            };

            const app = express();
            app.use(bodyParser.json());
            app.use(
                notifications(
                    deliveryServiceProperties,
                    db as any,
                    web3Provider as any,
                    serverSecret,
                ),
            );

            const token = generateAuthJWT('bob.eth', serverSecret);

            const { status, body } = await request(app)
                .delete(`/channel/test/bob.eth`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send();

            expect(status).toBe(400);
            expect(body).toStrictEqual({
                error: 'Invalid notification channel type',
            });
        });

        it('Returns 400 as global notifications is turned off', async () => {
            const db = {
                getAccount: async (ensName: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                    }),
                setAccount: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                setUserStorage: (_: string, __: string) => {},
                getIdEnsName: async (ensName: string) => ensName,
                getGlobalNotification: async (ensName: string) =>
                    Promise.resolve({ isEnabled: false }),
            };

            const web3Provider = {
                resolveName: async () =>
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
            };

            const app = express();
            app.use(bodyParser.json());
            app.use(
                notifications(
                    deliveryServiceProperties,
                    db as any,
                    web3Provider as any,
                    serverSecret,
                ),
            );

            const token = generateAuthJWT('bob.eth', serverSecret);

            const { status, body } = await request(app)
                .delete(`/channel/PUSH/bob.eth`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send();

            expect(status).toBe(400);
            expect(body).toStrictEqual({
                error: 'Global notifications is off',
            });
        });

        it('Removes Push notification channel', async () => {
            const recipientValue = {
                endpoint: 'https://test.com',
                keys: {
                    auth: 'authkey',
                    p256dh: 'p256dh',
                },
            };

            const getUsersNotificationChannels = () =>
                Promise.resolve([
                    {
                        type: NotificationChannelType.PUSH,
                        config: {
                            recipientValue: recipientValue,
                            isVerified: false,
                            isEnabled: true,
                        },
                    },
                ]);

            const removeNotificationChannelMock = jest.fn();

            const db = {
                getAccount: async (ensName: string) =>
                    Promise.resolve({
                        challenge: '123',
                        token,
                    }),
                setAccount: async (_: string, __: any) => {
                    return (_: any, __: any, ___: any) => {};
                },
                setUserStorage: (_: string, __: string) => {},
                getIdEnsName: async (ensName: string) => ensName,
                getGlobalNotification: async (ensName: string) =>
                    Promise.resolve({ isEnabled: true }),
                getUsersNotificationChannels: getUsersNotificationChannels,
                removeNotificationChannel: removeNotificationChannelMock,
            };

            const web3Provider = {
                resolveName: async () =>
                    '0x71CB05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
            };
            const app = express();
            app.use(bodyParser.json());
            app.use(
                notifications(
                    deliveryServiceProperties,
                    db as any,
                    web3Provider as any,
                    serverSecret,
                ),
            );

            const token = generateAuthJWT('bob.eth', serverSecret);

            const { status, body } = await request(app)
                .delete(`/channel/PUSH/bob.eth`)
                .set({
                    authorization: `Bearer ${token}`,
                })
                .send();

            expect(status).toBe(200);
            expect(removeNotificationChannelMock).toHaveBeenCalled();
        });
    });
});
