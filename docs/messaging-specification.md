---
eip: // TODO
title: dm3 Messaging Protocol
author: Heiko Burkhardt
status: // TODO
type: Standards Track
category: ERC
created: // TODO
---


## Abstract
This EIP specifies a decentral messaging protocol. The specified protocol uses ENS text records in combination with a standardized API to build a federated system of delivery services.

## Motivation
// TODO

## Specification
The dm3 messaging protocol describes message signing, encryption, and delivery. The storage of persistence of delivered messages (see [dm3 storage](./storage-specification.md)) is not part of this specification. 

### Profile Registry
For the protocol to work, there needs to be one registry where the dm3 app can look up dm3 profiles of other users. dm3 uses ENS text records for this purpose. The text record named `eth.dm3.profile` contains a URL to the actual profile. It is essential to verify the integrity of the profile entry. For example, if the `eth.dm3.profile` text record contains a simple HTTP-URL, it would be possible to hijack the server and change the profile entry. Therefore, the URL must be an IPFS-URL or an URL containing a hash of the entry.

The profile contains:
* Public Signing Key: Key used to verify a message signature. 
* Public Encryption Key: Key used to encrypt a message.
* Delivery Service URL: Delivery service used by the account assosciated to the profile.
* Mutable Profile Extension URL: URL pointing to a document containing additional profile information (e.g. spam filter settings). It's possible to change these informations without sending an Ethereum transaction.

Example eth.dm3.profile text record entry:

`http://delivery.dm3.network/profile/0xbcd6de065fd7e889e3ec86aa2d2780d7553ab3cc?dm3Hash=0x84f89a7...278ca03e421ab50c8`

### Message Flow
1. Sender app signs message.
2. Sender app queries the `eth.dm3.profile` text record of the receiver's ENS name.
3. Sender app uses the URL contained in `eth.dm3.profile` to retrieve the profile document. 
4. Sender app uses the `dm3Hash` URL parameter to check if the profile document is valid. (Not necessary if it's an IPFS URL)
5. Sender app uses the public encryption key contained in the profile document to encrypt the message.
6. Sender app delivers the encrypted message to the delivery service defined in the profile document.
7. Receiver delivery service pushes the message to the receiver app. 
8. Receiver app decrypts the message using the private encryption key.
9. Receiver app validates the sender's message signature. Therefore, the receiver app looks up the public signing key defined in the sender profile.ses the URL contained in `eth.dm3.profile` to retrive the profile document.
10. Receiver can read the message

### Intra Delivery Service Messaging
Communication between accounts on the delivery service without an `eth.dm3.profile` text record is possible. 

Intra delivery service profile retrieval:
1. App doesn't find an `eth.dm3.profile` text record linked to the receiver's ENS name.
2. App queries its delivery service for the receiver profile.
3. App checks if the profile signature fits the receiver address.   

## Appendix 1: Messaging Delivery Service HTTP API
### POST `/auth/createChallenge/{address}`
Create a authentication challenge.

### POST `/auth/submitChallenge/{address}`
Submit a authentication challenge result.

### GET `/messages/{address}/contact/{contact_address}`
Get messages sent from `contact_address` to `address`. 

### POST `/messages/{address}/syncAcknoledgment/{last_message_pull}`
Notify the delivery service that all messages sent to `address` until `last_message_pull` are persisted. 
The Delivery service will delete all messages where `delivery_timestamp <= last_message_pull`.

### POST `/messages/{address}/pending` 
//TODO: remove? optional?

### GET `/profile/{address}`
Get the profile for account `address` (signing pulic key, encryption public key, delivery service URL).

### POST `/profile/{address}`
Sumbit the profile for account `address` (signing pulic key, encryption public key, delivery service URL).

### GET `/profile/mutable/{address}`
Get the mutable profile for account `address` (e.g. spam filter settings). 

### POST `/profile/mutable/{address}`
Set the mutable profile for account `address` (e.g. spam filter settings). The mutable profile can be changed without sending an Ethereum transaction. 

## Appendix 2: Messaging Delivery Service WebSocket API
### `submitMessage`
Submit a new message to the target delivery service.

### `pendingMessage`
//TODO: remove? optional?

### `message`
Push an incoming message to the receiver.

### `joined`
//TODO: remove? optional?

 ## Appendix 3: Example Profile Entry
 ```
 {
  "profileRegistryEntry": {
    "publicKeys": {
      "publicMessagingKey": "rF5wuvHX6...J6Eip2KG3lQ=",
      "publicSigningKey": "l11foFzMl1J.../btdg9oSdDU="
    },
    "mutableProfileExtensionUrl": "http://delivery.dm3.network/profile/mutable/0x...",
    "deliveryServiceUrl": "http://delivery.dm3.network/"
  },
  "signature": "0x9b2ba...a82abf1b"
}
```
 ## Appendix 4: Data Structures
Message
 ```
{
    to: string;
    from: string;
    timestamp: number;
    message: string;
}
```
Message Envelop
```
{
    message: Message;
    signature: string;
    id?: string; //optional
}
```
Encryption Envelop
```
{
    encryptionVersion: 'x25519-xsalsa20-poly1305';
    encryptedData: string;
    to: string;
    from: string;
    deliveryServiceIncommingTimestamp?: number; //optional
}
 ```
