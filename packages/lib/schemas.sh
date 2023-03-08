yarn ts-json-schema-generator -f tsconfig.json --path src/lib/Messaging.ts --type Message -o src/schema.json --no-type-check \
&& yarn ts-json-schema-generator -f tsconfig.json --path lib/src/delivery/Messages.ts --type Acknoledgment -o src/delivery/schema/Acknoledgment.schema.json --no-type-check \
&& yarn ts-json-schema-generator -f tsconfig.json --path lib/src/delivery/Messages.ts --type MessageSubmission -o src/delivery/schema/MessageSubmission.schema.json --no-type-check \
&& yarn ts-json-schema-generator -f tsconfig.json --path lib/src/messaging/Messaging.ts --type EncryptionEnvelop -o src/messaging/schema/EncryptionEnvelop.schema.json --no-type-check -i EncryptionEnvelop.schema.json\
&& yarn ts-json-schema-generator -f tsconfig.json --path lib/src/delivery/Delivery.ts --type DeliveryServiceProperties -o src/delivery/schema/DeliveryServiceProperties.schema.json --no-type-check \
&& yarn ts-json-schema-generator -f tsconfig.json --path lib/src/delivery/Delivery.ts --type DeliveryServiceProfile -o src/delivery/schema/DeliveryServiceProfile.schema.json --no-type-check \
&& yarn ts-json-schema-generator -f tsconfig.json --path lib/src/delivery/Session.ts --type Session -o src/delivery/schema/Session.schema.json --no-type-check \
