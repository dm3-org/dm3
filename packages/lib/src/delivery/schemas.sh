yarn ts-json-schema-generator -f tsconfig.json --path Delivery.ts --type DeliveryServiceProperties -o ./schema/DeliveryServiceProperties.schema.json --no-type-check \
&& yarn ts-json-schema-generator -f tsconfig.json --path Delivery.ts --type DeliveryServiceProfile -o ./schema/DeliveryServiceProfile.schema.json --no-type-check \
&& yarn ts-json-schema-generator -f tsconfig.json --path Messages.ts --type Acknoledgment -o ./schema/Acknoledgment.schema.json --no-type-check \
&& yarn ts-json-schema-generator -f tsconfig.json --path Messages.ts --type MessageSubmission -o ./schema/MessageSubmission.schema.json --no-type-check \
&& yarn ts-json-schema-generator -f tsconfig.json --path Session.ts --type Session -o ./schema/Session.schema.json --no-type-check \

