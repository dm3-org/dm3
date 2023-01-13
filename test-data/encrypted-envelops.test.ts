/* eslint-disable max-len */
export const testData = {
    // see EncryptedEnvelop (packages/lib/src/messaging/Messaging.ts)
    envelopA: {
        message: '',
        metadata: {
            // For the encryption format see EncryptedPayload (packages/lib/crypto/Encryption.ts).
            deliveryInformation:
                '{"ciphertext":"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","nonce":"0x5f564ab2e955e921e131621e","ephemPublicKey":"yhl5dtz+xbvMczZtysmFiQ5Mi30cJcitqiz33cIAPy4="}',
            signature: '',
            encryptedMessageHash: '',
            version: '',
            encryptionScheme: 'x25519-chacha20-poly1305',
        },
    },
    envelopB: {
        message: '',
        metadata: {
            deliveryInformation:
                '{"ciphertext":"TR8l/5eOwKzsrED5+pUzVHhXtqnsmpZ71kBsONzcnb5XGnBUtMH+TX5lfgKcNVTIgdji6QXVjy1MPMQgOMfLoQEGGZ4Z7+oTVNwdOztjOEDJ0oETTtpj/ZNZ57PXdNj2g82CA3cTU/V1USSHTTxuDNsvvFhr+WYnlL/NewZMAVmSgKgdIEEgp6RIm+eUAVuZlqUHDZu/BSc9WRKyznaXL48ziR0cKhV8rIo5cBve2C5FTRO1fsIPPYc57c+8iSTvON5stjIV0WbCQjOuCoO6L66+1RsaROCW1IFyZfPOcI2K3KfGuxIJISAtle4XWKFcGmpEuLwZIgudqh6eLXD/bfP3MSTGsJBMSWHjesHqqvokldA9n1REo6DzR3SG8EaLQCWFGIKXVhVkjyNBoyRituY8iVrWxCcx4wrL5PbsurOOhiS2Rd6YZQMiyVMm7pjnnAB4oRF3fHhTwMIUg5GwlQhybMpTOJ3db11kCZYAM+LiTX4JHG8B78xOjWDLq5S0IT43jxE0q9Dn/WklN3xCB7YrX4HMLkz/qXBg02A6n54SL4S+6F43I87B5wKVOTzT+WzUcSnXAxFsn1oqgN1YhyVy8J3GHUEQoe6GeFtyv2sCXExEPeoOuHc0gVnbmz5m3dErT5a9CJxlGRLO89y2vLRaOtAG9Ax64zSle3uXPwnKYhQODMhbaTw1LjenM3ABMzDyW2VOp1rGZO3xlf/rX3cfoNB9xjjpyrfLalmdgf93tW4Zw/frefiJAas8lNSit0xly1wrfUrD81+ppx+yk4crmVi7PvRlDyXzfa8qkIxp5MEjdNYjdu3adVryqYi72/ztp9zniQVLx0iy6q1vLqnosGLV8tuxdRYk/dUl0JrdgjLgGprfxAOgs78EFnUbsKj1xdVWo+AyhKPLHtmcU7aONdTrIBHCxnnkZV3atgY+9/SXkUbOCZj+AeFlXEmIBcJSeMp/G/Ro2bQ1bem5mPnRFnB4MBBQ36ZUC3OratZg6gaV/7iyy1uv7xLT8WFlJ3VhyyWO+MSM8wo2hfigBHYNIAyrxM/GHHWeWoznPJFkCykHEGogxGwAh4amSmDYDfGTGQW4j4BjWpu1Mm0vmuNO6Rg5U6xSDzidOylBvBNt0B+IHyPj2sr6JHh29EMHeb6BQOdgi3/Cmun0JLzg5Woy0tNfBvIcYkLWEFX0mtg0zCq/tW2oh/+/3V6fQNDU6Y0eCCbMJJjIVbTJn6mxqk8/wvSLZ6Si8czFzyGoF5qrxUsRHSosjb9AcRLMMxXH3LWRmrN4DZajH28Xk0etCsE035vQq6xUuSewx+puSOHgXDtF5oA0u7Yog6YgROh4sj79rqK725XZ7VFkq4ZWFQ22VcOxTMkeghj+7GYTdmDgJ3+zExkOajqFA3WZxDNNDFrDsOSpOa8jWgtQ5RmiO82EqWnCrcKjzUH0YlXpzT3j/NspVOSUyC6/XxDZnm0HQc46gFW8Ecbjy9C0dpvRF4Tme4GLgjDg2zsuZsoDGJsmoEu1ROM+bD1i5ZkX9EXkpEk19W3rHpOmALDmo/dk/6t2sZA1+rim12IT2cd2s06aPu+ioWbG9pcyabMZ+TPkvwKJNtDFvbPGqPxIthUpYRXEaiSzzt7RokB3fxRBmtdwRh21JbVJOLc34l6VTtg19eemKTUKGb7GB5N6kh0GSelu7rqodBiZLA6T5hZATiF4OJqZLdhBQk08DUls3pHlrKfm9SFFn1ziQW04RnYVTOFxhPvpZR4jxQdBpnUsTP8uELN5xAP5wvUFxwI2yV/BG6/3eUcPbIPoq+sNXx5/EYn9yVAvTFL1acjSLCqaAFUGjgIT0KUYG4CaKfXmrpiw8v46/Zj9+O9MtNay/5cpRLNTLI60wVktgv8VjLK55joZgXigOHlh158XPtmuXrTmSogqDsxe4a5LrrEqUTiKvcdfugLNWT94aj+8k4eijKlPuMJ1H1nfqgbit0F9h9EpiH3gYDO/El5lDE85Uiil7c6b7qIWILSv5vsVMvmRZjWgdF85L5I+OrIH4918qPhONDIswBQPwHFcbyAuNqpUagY3xN6DcGCPNqfOSaQlEfHaHxQbCkgvJkghl1Qm3GuKcvDKd6X3nWK4kA9NHNWX//02CgDYki70f/uRS/x2uk9wV6+33Cq27X0xzmH0MT0o8eI3cbQAIcLwJR030qfmPNs6fWMMNJFPuzHaEXTesKCUhHhbfTdf1M3zZPRXxU7F8Yv9IytfWZ35fxAbdIkgYmA+EtVBNHaNB75C479fkyOTBmHq5JkV4mPFZ61kwb+eMy9h/NC+5bhL1APrQdOWNSCmBmddLnuejTmEAlynF3ZUNPL6g8h6ktFNVDbXuPQtjIdRXZmlY/ruZRMhqDdAJ+BzDYXogeyGiJM9o4HPnpU3tO1yKcQdFcKoKPLifHIKbelV6UPHaiA8fFeMDwGwFsT045GWeMp/0fvrK5ZeuqGl+SCLfgyN9IS4Li2Ntjue9X4ChOyfbMnR54IpGQ97KGRjmvKtD80qd6wHWbY8MRGkrp7Elqdc9c1o1Q1sF0Sx4x0Am1wneqZc2kkL7xVSHaXHKN44sM1E6qpDzFBxIMgm4IiuBY1Tf7xEbJReX5B9LvYEvunjouuzPQ1qbtbRLcagRfZoimIpxAsE0nth6wYmSZshr9jGEmWIo4mEC9u6DcjN3VACPc7Rvk0gcl5Dssf61ph7EVQ+SND6KF9KOklyfJEcMwNyVvOrizWVaj5o","nonce":"0x55d8d963b4712d3b74a1c3f7","ephemPublicKey":"JswCtQ84+mfSYSE8+MzzUsjYG4aSZIBZIvA0IIvUGn4="}',
            signature: '',
            encryptedMessageHash: '',
            version: '',
            encryptionScheme: 'x25519-chacha20-poly1305',
        },
    },
    deliveryInformationUnecrypted: {
        from: 'alice.eth',
        to: 'bob.eth',
    },
    // encrypted with for eHmMq29FeiPKfNPkSctPuZGXvV0sKeO/KZkX2nXvMgw=
    deliveryInformation: {
        // contains the stringified, encrypted and base64 encoded DeliveryInfromation (packages/lib/src/messaging/Messaging.ts) object.
        ciphertext:
            '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',
        // random nonce
        nonce: '0x1ca3668f468a0d2069dc163c',
        // base64 encoded ephemeral public key
        ephemPublicKey: 'p20BWfrTH20osbChhvFaEgg8//51vhy412QAN3z8RWA=',
    },
    delvieryInformationBUnecrypted: {
        from: 'alice.eth',
        to: 'joe.eth',
    },
    // encrypted with for eHmMq29FeiPKfNPkSctPuZGXvV0sKeO/KZkX2nXvMgw=
    deliveryInformationB: {
        ciphertext:
            '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',
        nonce: '0x40f7fe6e2d14def690778dd4',
        ephemPublicKey: 'RpQjn48cLvMgivfhLCgzUD/bMjdA3DDo1fDQYcX83iM=',
    },
    // deliveryInformationB: {
    //     ciphertext:
    //         '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',
    //     nonce: '0x55d8d963b4712d3b74a1c3f7',
    //     ephemPublicKey: 'JswCtQ84+mfSYSE8+MzzUsjYG4aSZIBZIvA0IIvUGn4=',
    // },
};
