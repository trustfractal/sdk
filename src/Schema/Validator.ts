import { Validator as SchemaValidator } from "jsonschema";

import FractalError from "../FractalError";
import { ISchema, Properties } from "../types";

import { Metaschema } from "./meta";

const wrapSchema = ({ properties, required }: ISchema) => ({
  $id: "https://json-schema.org/draft/2020-12/schema",
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: { ...properties },
  required: required || [],
  additionalProperties: { type: "any" },
});

const isValid = (schema: object, values: any): boolean => {
  return new SchemaValidator().validate(values, schema).valid;
};

const isValidSchema = (schema: ISchema): boolean => {
  return isValid(Metaschema, schema);
};

const validate = (schema: ISchema, properties: Properties): boolean => {
  switch (true) {
    case !isValidSchema(schema):
      throw FractalError.invalidSchema(schema);
    case !isValid(wrapSchema(schema), properties):
      throw FractalError.propertyMismatch(properties, schema);
    default:
      return true;
  }
};

export default { validate, isValid, wrapSchema };
