import { Address, Hash, Signature, Properties, HashTree } from "./base";

export type CountryTier = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type KycType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface ICredential {
  properties: Properties;
  hashTree: HashTree;
  rootHash: Hash;
  subjectAddress: Address;
  issuerAddress: Address | null;
  issuerSignature: Signature | null;
  countryOfIDIssuance: CountryTier;
  countryOfResidence: CountryTier;
  kycType: KycType;
}
