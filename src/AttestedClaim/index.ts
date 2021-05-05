import Crypto from "../Crypto";
import AttestationRequest from "../AttestationRequest";
import FractalError from "../FractalError";
import DIDContract from "../DIDContract";

import {
  IClaim,
  IAttestedClaim,
  Hash,
  Address,
  Signature,
  HashWithNonce,
  HashTree,
} from "../types";

export default class AttestedClaim implements IAttestedClaim {
  public static fromRequest(request: AttestationRequest) {
    if (!request.claimerSignature || !request.claim.owner)
      throw FractalError.attestedClaimFromUnsignedRequest(request);

    if (!request.validate())
      throw FractalError.attestedClaimFromInvalidRequest(request);

    return new AttestedClaim({
      claim: request.claim,
      rootHash: request.rootHash,
      attesterAddress: null,
      attesterSignature: null,
      attestedClaimHash: null,
      attestedClaimSignature: null,
      claimerAddress: request.claim.owner,
      claimerSignature: request.claimerSignature,
      claimTypeHash: request.claimTypeHash,
      claimHashTree: request.claimHashTree,
    });
  }

  public claim: IClaim;
  public rootHash: Hash;
  public attesterAddress: Address | null;
  public attesterSignature: Signature | null;
  public attestedClaimHash: Hash | null;
  public attestedClaimSignature: Signature | null;
  public claimerAddress: Address;
  public claimerSignature: Signature;
  public claimTypeHash: HashWithNonce;
  public claimHashTree: HashTree;

  public constructor({
    claim,
    rootHash,
    attesterAddress,
    attesterSignature,
    attestedClaimHash,
    attestedClaimSignature,
    claimerAddress,
    claimerSignature,
    claimTypeHash,
    claimHashTree,
  }: IAttestedClaim) {
    this.claim = claim;
    this.rootHash = rootHash;
    this.attesterAddress = attesterAddress;
    this.attesterSignature = attesterSignature;
    this.attestedClaimHash = attestedClaimHash;
    this.attestedClaimSignature = attestedClaimSignature;
    this.claimerAddress = claimerAddress;
    this.claimerSignature = claimerSignature;
    this.claimTypeHash = claimTypeHash;
    this.claimHashTree = claimHashTree;
  }

  public removeProperty(property: string): void {
    delete this.claim.properties[property];
    delete this.claimHashTree[property]["nonce"];
  }

  public getProperty(property: string): any {
    return this.claim.properties[property];
  }

  public verifyIntegrity(): boolean {
    return (
      this.verifyClaimHashTree() &&
      this.verifyClaimTypeHash() &&
      this.verifyClaimerAddress() &&
      this.verifyClaimerSignature() &&
      this.verifyAttesterSignature() &&
      this.verifyRootHash()
    );
  }

  // check if it is present on the blockchain
  // and the attested hash matches the one from the contract
  public async verifyNetwork(contract: DIDContract): Promise<boolean> {
    return (
      this.verifyAttestedClaimHashIntegrity() &&
      this.verifyAttestedClaimHash(contract) &&
      this.verifyStorage(contract)
    );
  }

  private verifyClaimHashTree() {
    return Crypto.verifyPartialClaimHashTree(
      this.claimHashTree,
      this.claim.properties,
      this.claim.claimTypeHash
    );
  }

  private verifyClaimTypeHash() {
    return Crypto.verifyHashWithNonce(
      this.claimTypeHash,
      this.claim.claimTypeHash
    );
  }

  private verifyClaimerAddress() {
    return this.claim.owner === this.claimerAddress;
  }

  private verifyClaimerSignature() {
    return Crypto.verifySignature(
      this.claimerSignature,
      this.rootHash,
      this.claimerAddress
    );
  }

  private verifyAttesterSignature() {
    if (!this.attesterSignature || !this.attesterAddress) return false;

    return Crypto.verifySignature(
      this.attesterSignature,
      this.rootHash,
      this.attesterAddress
    );
  }

  private verifyRootHash() {
    return Crypto.verifyRootHash(
      this.claimHashTree,
      this.claimTypeHash.hash,
      this.claimerAddress,
      this.rootHash
    );
  }

  public verifyAttestedClaimHashIntegrity() {
    if (
      !this.attestedClaimSignature ||
      !this.attestedClaimHash ||
      !this.attesterAddress
    )
      return false;

    return Crypto.verifySignature(
      this.attestedClaimSignature,
      DIDContract.toBuffer(this.attestedClaimHash),
      this.attesterAddress
    );
  }

  private async verifyAttestedClaimHash(contract: DIDContract) {
    const expectedHash = await contract.computeSignableKey(this);

    return expectedHash === this.attestedClaimHash;
  }

  private async verifyStorage(contract: DIDContract) {
    return contract.verifyClaim(this);
  }
}
