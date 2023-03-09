yarn ts-json-schema-generator -f tsconfig.json --path src/lib/Messaging.ts --type Message -o src/schema.json --no-type-check \
&& yarn ts-json-schema-generator -f tsconfig.json --path lib/src/messaging/Messaging.ts --type EncryptionEnvelop -o src/messaging/schema/EncryptionEnvelop.schema.json --no-type-check -i EncryptionEnvelop.schema.json\

