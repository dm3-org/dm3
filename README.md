# Packages
* [dm3-react](packages/react): dm3 UI components 
* [dm3-web](packages/web): dm3 web app
* [dm3-backend](packages/backend): The delivery and storage service
* [dm3-lib](packages/lib): Basic dm3 functionality

# Protocol
## Simple Summary
dm3 Protocol enables decentral, open, and secure messaging based on established web3 services like ENS and IPFS.

## Principles 
* **Decentral**: An dm3 client must be realizable as a real decentral application and the messages must also be stored in a decentral way. 
* **Open**: All parts of dm3 are open source and the protocol is permissionless. Everyone should be able to write an dm3 client.
* **Secure**: All messages are end-to-end encrypted and the encryption keys are only under the control of the user. 

## Terminology
* **Ethereum Account Key**: The private key linked to an [Externally Owned Account](https://ethereum.org/en/whitepaper/#ethereum-accounts).
* **Message Encryption Key Pair**: The key pair used to encrypt/decrypt messages.
* **Signing Key Pair**: The key pair used to sign/verify messages.
* **Storage Encryption Key**: Synchronous key to encrypt the user storage.  `keccak256(personalSignWithEthAccount(salt))`
* **Delivery Service**: The service that buffers messages until they are delivered.
* **Registry**: A decentral service (e.g. ENS) mapping Ethereum accounts to profile registry entry URLs (e.g. using text records). 
* **Profile Registry Entry**: A resource containing properties linked to an Ethereum account that is using dm3. E.g. public keys, the delivery service URL and spam filter configuration.

## Accounts & Keys
### Keys
```mermaid
flowchart TD

subgraph w[Wallet e.g. Metamask]
    
    ea[Ethereum Account Private Key]:::pk
    
   end
   w-- signs salt -->
  sek[Storage Encryption Key]:::pk
  sek-- encrypts / decrypts -->eus

  subgraph us[User Storage]
   
    subgraph eus[Encrypted User Storage]
    
      sk[Signing Private Key]:::pk
      mek[Message Encryptioin Private Key]:::pk
      d["Data (e.g. messages)"]:::data
   end
    Salt
  end
   subgraph r[Public Registry Entry]
    
    sk-.-pubSK[Signing Public Key]
    mek-.-pubMEK[Message Encryptioin Public Key]
    pd[Profile data]:::data
   end
   w-- signs / sends as tx-->r
   style r fill:#e0ffdb,stroke:#128c00
   style us fill:#e0ffdb,stroke:#128c00
   classDef pk fill:#f2d0d0,stroke:#bc0000;
   classDef data fill:#e8e8e8,stroke:#939393;
   classDef reg fill:#e8e8e8,stroke:#939393;
```

### Sign In 
To be compliant with the secure principle dm3 should never control an Ethereum account's private key. Therefore new key pairs need to be created to encrypt and sign messages. These key pairs need to be associated with an Ethereum account. 

There are two possibilities to associate an Ethereum account with newly created key pairs:

1. **Sign a profile registry entry containing the public keys with the Ethereum account private key.** The signature and the public keys need to be submitted to the default delivery service. 
2. **Send a transaction to an onchain registry.** This transaction should store a URL (e.g. IPFS link) onchain that points to a profile registry entry containing the public keys 

The first option is good to start with because it doesn't require paying for an onchain transaction. Nevertheless, the user should be encouraged to register the public keys onchain as soon as possible because the onchain registry serves as single point of truth and makes it easy to revoke compromised keys. It also allows the user to use another delivery service as the default one.

**Reference sequence for the first sign in:**
```mermaid
  sequenceDiagram
    UI->>+dm3Lib: signIn()
    dm3Lib->>+MetaMask: eth_getEncryptionPublicKey
    MetaMask-->>-dm3Lib: encryptionPublicKey

    dm3Lib->>dm3Lib: createMessageEncryptionKeyPair()
    dm3Lib->>dm3Lib: createSigningKeyPair()
    dm3Lib->>dm3Lib: createStorageEncryptionKey()
  
    dm3Lib->>+MetaMask: personal_sign
    MetaMask-->>-dm3Lib: signature
    dm3Lib->>+ IPFS : PUBLISH ProfileRegistryEntry
    IPFS-->>- dm3Lib: Response
    opt register onchain
      dm3Lib->>+ ENSContract : setText()
      ENSContract-->>- dm3Lib: TransactionResponse
    end
    dm3Lib->>+ DeliveryService: POST submitProfileRegistryEntry()
    alt register onchain
      DeliveryService->> DeliveryService: getProfileRegistryEntryFromChain()
    else register offchain
      DeliveryService->> DeliveryService: checkSubmissionNonce()
      DeliveryService->> DeliveryService: checkSignature()
    end
    DeliveryService-->>- dm3Lib: token


    dm3Lib-->>-UI: 
```

### Contacts
To get a profile registry entry URL for a specific account the dm3 Dapp must at first try to retrieve the profile registry entry URL from the chain. The dm3 Dapp can fallback to the delivery service registry if there hasn't been an onchain profile registry entry registered for the queried account. 

**Reference sequence for retrieving a profile registry entry:**
```mermaid
  sequenceDiagram
    UI->>+dm3Lib: getContact()
    dm3Lib->>+ ENSContract : CALL text()
    ENSContract-->>- dm3Lib: ProfileRegistryEntry URL
    opt Account has no ProfileRegistryEntry URL onchain
        dm3Lib->>+ DeliveryService: getProfileRegistryEntry()
        DeliveryService-->>- dm3Lib: ProfileRegistryEntry URL
    end
    dm3Lib->>+ IPFS : GET ProfileRegistryEntry
    IPFS-->>- dm3Lib: ProfileRegistryEntry
    dm3Lib-->>-UI: 
```

## Message Creation & Delivery
A message must be signed and encrypted before it can be sent. The signature is created using the private signing key of the sending account. The message is encrypted with the public message encryption key of the receiving account. The signature must be validated by the receiving side. A message is directly sent from the dm3 Dapp to the delivery service URL defined in the profile registry entry of the receiving account. 

The sending dm3 Dapp keeps the message in storage but doesn't send it if the receiving account hasn't joined dm3 yet (no onchain or offchain profile registry entry). The message is encrypted and sent as soon as the receiving account joins dm3.

```mermaid
flowchart TB
    subgraph Alice
    id1[Write message for Bob] --> id2[Sign message using signature private key]
    id2 --> id3[Encrypt message using Bob's public encryption key]
    id3 --> id9[Send message to the delivery service used by Bob]
    end
   id9 --> b
    subgraph d[Delivery Service]
       b[Buffer message] --> p[Push message to receiver]
      dm[Delete message after sync ack from Bob]
    end
    p --> id5
    subgraph Bob
    id5[Decrypt message using Bob's private encryption key]
    id5 --> id10[Store message]
    id10 -->id11[Send storage sync ack]
    id11 --> dm
    id10 --> id6[Verify Alice's signature]
    id6 --> id7[Read message]
    end
```

## Storage
The following list gives an overview of the possible storage locations for the encrypted user storage: 
* **Local file system**: The user must always download the encrypted user storage file after using the dm3 Dapp but the user has full control over the data.  
* **IPFS using web3.storage (own account)**: The user has to provide a web3.storage token to store the encrypted user storage file on IPFS. Everyone could read the conversations if the encryption is broken and the file is still pinned.
 * **IPFS using web3.storage (dm3 account)**:  Same as above besides that the user hasn't to provide a token and that the user loses control over the pinned state of the encrypted user storage file. 
 * **Cloud (e.g. google drive)**: The user stores the encrypted user storage file using a personal account on some central proprietary cloud.



# Architecture 
```mermaid
graph TD
    subgraph sg0[Alice]
        id7[(UserDB)]
        id0(Dapp)
        id10[Profile Data]
        
        
    end
    id0 --> id9[Chain]
    
    id0 --> id7
    id0 --- id1[dm3 Home Delivery Service] 


    id4[Bob] --- id1
    id6[Max]-.-id2
    id1 -.- id2[Other Delivery Service] 
    id1 --- id3[Bridges] 
   
   

    id1 --> id9
    id2 --> id9
    id9 ---> id10
     

   classDef green fill:#9f6,stroke:#333
   classDef lightgreen fill:#eaffe0,stroke:#333
   classDef orange fill:#f96,stroke:#333
   class id0,id7,id8,id10,sg0 green
   class id4,id6,sg0 lightgreen
   class id1,id3 orange
```