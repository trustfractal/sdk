import type { IClaimPseudoSchema, IClaimType } from "../types";

import Crypto from "../Crypto";

import {
  LivenessSchema,
  BasicSchema,
  PlusSchema,
  WalletSchema,
  CountryOfIDIssuanceKey,
  CountryOfResidenceKey,
} from "./schemas";

const DEFAULT_SCHEMA_VERSION = "https://json-schema.org/draft/2020-12/schema";

export default class ClaimType implements IClaimType {
  public static LivenessSchema = LivenessSchema;
  public static BasicSchema = BasicSchema;
  public static PlusSchema = PlusSchema;
  public static WalletSchema = WalletSchema;

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

    const fullSchema = levels.reduce((memo, level) => {
      switch (level) {
        case "liveness":
          return { ...memo, ...ClaimType.LivenessSchema };
        case "basic":
          return { ...memo, ...ClaimType.BasicSchema };
        case "plus":
          return { ...memo, ...ClaimType.PlusSchema };
        case "wallet":
          return { ...memo, ...ClaimType.WalletSchema };
        default:
          return memo;
      }
    }, {});

    const schema = ClaimType.buildSchema(levels.join("+"), fullSchema);
    return ClaimType.fromSchema(schema);
  }
}
