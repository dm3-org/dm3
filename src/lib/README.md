# First Sign In
```mermaid
sequenceDiagram
    UI->>+EnsMailLib: signIn()
    EnsMailLib->>+MetaMask: eth_getEncryptionPublicKey
    MetaMask-->>-EnsMailLib: encryptionPublicKey
    EnsMailLib->>EnsMailLib: createKeyPairs()
    EnsMailLib->>+MetaMask: personal_sign
    MetaMask-->>-EnsMailLib: signature
    EnsMailLib->>+ DeliveryService: POST submitPublicKeys()
    DeliveryService->> DeliveryService: checkSignature()
    DeliveryService-->>- EnsMailLib: token
    EnsMailLib-->>-UI: Messages
```

# Retrieve Messages
```mermaid
sequenceDiagram
    UI->>+MessagingHandler: getMessages()
    MessagingHandler->>+BackendAPILib: getNewMessages()
    BackendAPILib->>+DeliveryService: POST getMessages
    DeliveryService-->>-BackendAPILib: Messages
    Note right of MessagingHandler: "new" messages
    BackendAPILib-->>-MessagingHandler: Messages

    MessagingHandler->>MessagingHandler: decryptedMessages()

    MessagingHandler->>+StorageLib: storeMessages()
    StorageLib-->>-MessagingHandler: success

    MessagingHandler->>+StorageLib: getConversation()
    Note right of MessagingHandler: "new" + "old" messages
    StorageLib-->>-MessagingHandler: Messages
    MessagingHandler-->>-UI: Messages
```