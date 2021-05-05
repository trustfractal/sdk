import { Address, Hash, Signature, HashWithNonce, HashTree } from "./base";
import { IClaim } from "./Claim";

export interface IAttestedClaim {
  claim: IClaim;
  rootHash: Hash;
  attestedClaimHash: Hash | null;
  attestedClaimSignature: Address | null;
  attesterAddress: Address | null;
  attesterSignature: Signature | null;
  claimerAddress: Address;
  claimerSignature: Signature;
  claimTypeHash: HashWithNonce;
  claimHashTree: HashTree;
}
