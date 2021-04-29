import type { IClaimPseudoSchema, IClaimType } from "../types";

import Crypto from "../Crypto";

// TODO: what to do about schema versioning?
const DEFAULT_SCHEMA_VERSION = "http://kilt-protocol.org/draft-01/ctype#";

export default class ClaimType implements IClaimType {
  public static LivenessSchema = {
    liveness: { type: "boolean" },
  };

  public static BasicSchema = {
    residential_address_country: { type: "string" },
    date_of_birth: { type: "string" },
    full_name: { type: "string" },
    identification_document_country: { type: "string" },
    identification_document_number: { type: "string" },
    identification_document_type: { type: "string" },
  };

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
        default:
          return memo;
      }
    }, {});

    const schema = ClaimType.buildSchema(levels.join("+"), fullSchema);
    return ClaimType.fromSchema(schema);
  }
}
