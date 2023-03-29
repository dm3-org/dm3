yarn ts-json-schema-generator -f tsconfig.json --path Envelop.ts --type EncryptionEnvelop -o ./src/schema/EncryptionEnvelop.schema.json --no-type-check -i EncryptionEnvelop.schema.json\
&& yarn ts-json-schema-generator -f tsconfig.json --path ./Message.ts --type Message -o src/schema/Message.schema.json --no-type-check 
