yarn ts-json-schema-generator -f tsconfig.json --path Profile.ts --type SignedUserProfile -o ./src/schema/SignedUserProfile.schema.json --no-type-check \
&& yarn ts-json-schema-generator -f tsconfig.json --path ./ProfileExtension/ProfileExtension.ts --type ProfileExtension -o ./src/schema/ProfileExtension.schema.json --no-type-check \
&& yarn ts-json-schema-generator -f tsconfig.json --path ./deliveryServiceProfile/Delivery.ts --type DeliveryServiceProfile -o ./src/schema/DeliveryServiceProfile.schema.json --no-type-check \