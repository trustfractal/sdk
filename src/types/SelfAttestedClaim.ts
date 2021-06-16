import { Address, Hash, Signature, HashWithNonce, HashTree } from "./base";

import { Byte } from "./Byte";
import { IClaim } from "./Claim";

export interface ISelfAttestedClaim {
  claim: IClaim;
  claimTypeHash: HashWithNonce;
  claimHashTree: HashTree;
  rootHash: Hash;
  claimerAddress: Address;
  attesterAddress: Address;
  attesterSignature: Signature | null;
  countryOfIDIssuance: Byte;
  countryOfResidence: Byte;
  kycType: Byte;
}
