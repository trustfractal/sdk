import type { IClaimPseudoSchema, IClaimType } from "../types";

import Crypto from "../Crypto";

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
} from "./schemas";

const DEFAULT_SCHEMA_VERSION = "https://json-schema.org/draft/2020-12/schema";

export default class ClaimType implements IClaimType {
  public static LivenessSchema = LivenessSchema;
  public static BasicSchema = BasicSchema;
  public static PlusSchema = PlusSchema;
  public static WalletSchema = WalletSchema;
  public static SelfieSchema = SelfieSchema;
  public static SoWSchema = SoWSchema;
  public static AccreditationSchema = AccreditationSchema;

  public static SupportedSchemas: Record<string, object> = {
    liveness: ClaimType.LivenessSchema,
    basic: ClaimType.BasicSchema,
    plus: ClaimType.PlusSchema,
    wallet: ClaimType.WalletSchema,
    selfie: ClaimType.SelfieSchema,
    sow: ClaimType.SoWSchema,
    accreditation: ClaimType.AccreditationSchema,
  };

  public static CountryOfIDIssuanceKey = CountryOfIDIssuanceKey;
  public static CountryOfResidenceKey = CountryOfResidenceKey;

  public hash: IClaimType["hash"];
  public owner: IClaimType["owner"];
  public schema: IClaimType["schema"];

  public constructor({ hash, owner, schema }: IClaimType) {
    this.hash = hash;
    this.owner = owner;
    this.schema = schema;
  }

  public static fromSchema(
    schema: IClaimPseudoSchema,
    owner?: IClaimType["owner"]
  ) {
    const hash = Crypto.hash(schema);

    return new ClaimType({
      hash,
      owner: owner || null,
      schema: {
        ...schema,
        $id: `fractal:ctype:${hash}`,
      },
    });
  }

  public static buildSchema(
    title: string,
    properties: Record<string, object>,
    schema?: string
  ): IClaimPseudoSchema {
    return {
      $schema: schema || DEFAULT_SCHEMA_VERSION,
      title,
      properties,
      type: "object",
    };
  }

  public static build(level: string) {
    const levels = level.split("+").sort();

    const fullSchema = levels.reduce((memo, level: string) => {
      const schema = ClaimType.SupportedSchemas[level] || {};

      return { ...memo, ...schema };
    }, {});

    const schema = ClaimType.buildSchema(levels.join("+"), fullSchema);
    return ClaimType.fromSchema(schema);
  }
}
