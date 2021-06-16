import Validator from "../ClaimType/Validator";
import type { Address, IClaim, IClaimProperties, IClaimType } from "../types";

export default class Claim implements IClaim {
  public claimTypeHash: IClaim["claimTypeHash"];
  public owner: IClaim["owner"];
  public properties: IClaim["properties"];

  public constructor(
    claimType: IClaimType,
    properties: IClaimProperties,
    owner?: Address
  ) {
    Validator.validate(claimType.schema, properties);

    this.claimTypeHash = claimType.hash;
    this.owner = owner || null;
    this.properties = Claim.pruneProperties(properties, claimType);
  }

  private static pruneProperties(
    properties: Record<string, any>,
    { schema: { properties: schemaProperties } }: IClaimType
  ) {
    const allowedKeys = Object.keys(schemaProperties);

    return Object.entries(properties)
      .filter(([key, _]) => allowedKeys.includes(key))
      .reduce((memo, [key, value]) => ({ ...memo, [key]: value }), {});
  }
}
