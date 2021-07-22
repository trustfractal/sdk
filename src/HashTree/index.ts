import Crypto from "../Crypto";
import Schema from "../Schema";

import { Properties, ISchema } from "../types";

const pruneProperties = (
  properties: Properties,
  { properties: schemaProperties }: ISchema
) => {
  const allowedKeys = Object.keys(schemaProperties);

  return Object.entries(properties)
    .filter(([key, _]) => allowedKeys.includes(key))
    .reduce((memo, [key, value]) => ({ ...memo, [key]: value }), {});
};

const build = (level: string, properties: Properties) => {
  const schema: ISchema = Schema.build(level);

  Schema.Validator.validate(schema, properties);

  const allowedProperties = pruneProperties(properties, schema) as Properties;

  const hashTree = Crypto.buildHashTree(allowedProperties);
  const owner = allowedProperties[Schema.WalletAddressKey] as string;
  const rootHash = Crypto.calculateRootHash(hashTree, owner);

  return { hashTree, rootHash, properties: allowedProperties, schema };
};

export default { build };
