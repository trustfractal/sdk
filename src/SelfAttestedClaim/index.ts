import AttestationRequest from "../AttestationRequest";
import ClaimType from "../ClaimType";
import Crypto from "../Crypto";
import FractalError from "../FractalError";

import CountryTiers from "./CountryTiers";
import KYCTypes from "./KYCTypes";

import { utils as ethersUtils } from "ethers";

import {
  IClaim,
  ISelfAttestedClaim,
  Hash,
  Address,
  Signature,
  HashWithNonce,
  HashTree,
  Byte,
} from "../types";

export default class SelfAttestedClaim implements ISelfAttestedClaim {
  public static fromRequest(
    request: AttestationRequest,
    attesterAddress: string,
    kycLevel: string
  ) {
    if (!request.claim.owner || !request.validateWithoutSignature())
      throw FractalError.attestedClaimFromInvalidRequest(request);

    const { hash: expectedClaimTypeHash } = ClaimType.build(kycLevel);
    const { claim, claimTypeHash, claimHashTree, rootHash } = request;

    if (expectedClaimTypeHash !== claim.claimTypeHash)
      throw FractalError.attestedClaimFromInvalidRequest(request);

    const { owner, properties } = claim;
    const claimerAddress = owner as string;

    const countryOfIDIssuance = CountryTiers.ToTier(
      properties[ClaimType.CountryOfIDIssuanceKey] as string
    );

    const countryOfResidence = CountryTiers.ToTier(
      properties[ClaimType.CountryOfResidenceKey] as string
    );

    const kycType = KYCTypes.ToByte(kycLevel);

    return new SelfAttestedClaim({
      claim,
      claimTypeHash,
      claimHashTree,
      rootHash,
      claimerAddress,
      attesterAddress,
      attesterSignature: null,
      countryOfIDIssuance,
      countryOfResidence,
      kycType,
    });
  }

  public claim: IClaim;
  public claimTypeHash: HashWithNonce;
  public claimHashTree: HashTree;
  public rootHash: Hash;
  public claimerAddress: Address;
  public attesterAddress: Address;
  public attesterSignature: Signature | null;
  public countryOfIDIssuance: Byte;
  public countryOfResidence: Byte;
  public kycType: Byte;

  public constructor({
    claim,
    claimTypeHash,
    claimHashTree,
    rootHash,
    claimerAddress,
    attesterAddress,
    attesterSignature,
    countryOfIDIssuance,
    countryOfResidence,
    kycType,
  }: ISelfAttestedClaim) {
    this.claim = claim;
    this.claimTypeHash = claimTypeHash;
    this.claimHashTree = claimHashTree;
    this.rootHash = rootHash;
    this.claimerAddress = claimerAddress;
    this.attesterAddress = attesterAddress;
    this.attesterSignature = attesterSignature;
    this.countryOfIDIssuance = countryOfIDIssuance;
    this.countryOfResidence = countryOfResidence;
    this.kycType = kycType;
  }

  public generateHash(): Hash {
    return ethersUtils.solidityKeccak256(
      ["string", "uint8", "uint8", "uint8", "string"],
      [
        this.claimerAddress,
        this.kycType.value,
        this.countryOfResidence.value,
        this.countryOfIDIssuance.value,
        this.rootHash,
      ]
    );
  }

  public verifyIntegrity(): boolean {
    return (
      this.verifyClaimHashTree() &&
      this.verifyClaimTypeHash() &&
      this.verifyClaimerAddress() &&
      this.verifyRootHash()
    );
  }

  public verifySignature(): boolean {
    if (!this.attesterSignature || !this.attesterAddress) return false;

    return Crypto.verifySignature(
      this.attesterSignature,
      this.generateHash(),
      this.attesterAddress
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

  private verifyRootHash() {
    return Crypto.verifyRootHash(
      this.claimHashTree,
      this.claimTypeHash.hash,
      this.claimerAddress,
      this.rootHash
    );
  }
}
