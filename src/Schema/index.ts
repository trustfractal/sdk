import FractalError from "../FractalError";
import type { ISchema } from "../types";

import {
  LivenessSchema,
  BasicSchema,
  PlusSchema,
  WalletSchema,
  SelfieSchema,
  SoWSchema,
  AccreditationSchema,
  CountryOfIDIssuanceKey,
  CountryOfResidenceKey,
  WalletAddressKey,
} from "./schemas";

import Validator from "./Validator";

const SupportedSchemas: Record<string, ISchema> = {
  liveness: LivenessSchema,
  basic: BasicSchema,
  plus: PlusSchema,
  wallet: WalletSchema,
  "wallet-eth": WalletSchema,
  selfie: SelfieSchema,
  sow: SoWSchema,
  accreditation: AccreditationSchema,
};

const build = (level: string): ISchema => {
  const schema = level
    .split("+")
    .sort()
    .reduce(
      ({ properties, required }: any, level: string) => {
        const {
          properties: schemaProperties,
          required: schemaRequired,
        } = SupportedSchemas[level] || {
          properties: {},
        };

        const requiredFields = schemaRequired || [];

        return {
          properties: { ...properties, ...schemaProperties },
          required: [...required, ...requiredFields],
        };
      },
      { properties: {}, required: [] }
    );

  if (Object.keys(schema.properties).length === 0) {
    throw FractalError.unsupportedKycLevel(level);
  }

  return schema;
};

export default {
  build,
  LivenessSchema,
  BasicSchema,
  PlusSchema,
  WalletSchema,
  SelfieSchema,
  SupportedSchemas,
  CountryOfIDIssuanceKey,
  CountryOfResidenceKey,
  WalletAddressKey,
  Validator,
};
