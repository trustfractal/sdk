import Schema from "../Schema";
import Crypto from "../Crypto";
import FractalError from "../FractalError";
import CryptographicHashTree from "../HashTree";

import CountryTiers from "./CountryTiers";
import KYCTypes from "./KYCTypes";

import { utils as ethersUtils } from "ethers";

import {
  Properties,
  Hash,
  Address,
  Signature,
  HashTree,
  ICredential,
  CountryTier,
  KycType,
} from "../types";

export default class Credential implements ICredential {
  public properties: Properties;
  public hashTree: HashTree;
  public rootHash: Hash;
  public subjectAddress: Address;
  public issuerAddress: Address | null;
  public issuerSignature: Signature | null;
  public countryOfIDIssuance: CountryTier;
  public countryOfResidence: CountryTier;
  public kycType: KycType;

  public static build(properties: Properties, kycLevel: string) {
    let subjectAddress = properties[Schema.WalletAddressKey];

    if (!subjectAddress) throw FractalError.invalidProperties(properties);

    const {
      rootHash,
      hashTree,
      properties: schemaProperties,
    } = CryptographicHashTree.build(kycLevel, properties);

    const countryOfIDIssuance = CountryTiers.ToTier(
      schemaProperties[Schema.CountryOfIDIssuanceKey] as string
    );

    const countryOfResidence = CountryTiers.ToTier(
      schemaProperties[Schema.CountryOfResidenceKey] as string
    );

    const kycType = KYCTypes.fromLevel(kycLevel);

    const credential = new Credential({
      properties: schemaProperties,
      hashTree,
      rootHash,
      subjectAddress: subjectAddress as string,
      countryOfIDIssuance,
      countryOfResidence,
      kycType,
      issuerAddress: null,
      issuerSignature: null,
    });

    if (credential.verifyIntegrity()) return credential;
    else throw FractalError.invalidCredentialGeneration(credential);
  }

  public constructor({
    properties,
    hashTree,
    rootHash,
    subjectAddress,
    countryOfIDIssuance,
    countryOfResidence,
    kycType,
    issuerAddress,
    issuerSignature,
  }: ICredential) {
    this.properties = properties;
    this.hashTree = hashTree;
    this.rootHash = rootHash;
    this.subjectAddress = subjectAddress;
    this.issuerAddress = issuerAddress;
    this.issuerSignature = issuerSignature;
    this.countryOfIDIssuance = countryOfIDIssuance;
    this.countryOfResidence = countryOfResidence;
    this.kycType = kycType;
  }

  public generateHash(): Hash {
    return ethersUtils.solidityKeccak256(
      ["address", "uint8", "uint8", "uint8", "bytes32"],
      [
        this.subjectAddress,
        this.kycType,
        this.countryOfResidence,
        this.countryOfIDIssuance,
        this.rootHash,
      ]
    );
  }

  public setSignature(signature: Signature, signedBy: Address) {
    const hash = this.generateHash();
    const hashToSign = ethersUtils.arrayify(hash);
    const validSignature = Crypto.verifySignature(
      signature,
      hashToSign,
      signedBy
    );

    if (!validSignature)
      throw FractalError.invalidSignature(signature, hash, signedBy);

    this.issuerAddress = signedBy;
    this.issuerSignature = signature;
  }

  public removeProperty(property: string): void {
    delete this.properties[property];
    delete this.hashTree[property]["nonce"];
  }

  public getProperty(property: string): any {
    return this.properties[property];
  }

  public verifyIntegrity(): boolean {
    return this.verifyHashTree() && this.verifyRootHash();
  }

  public verifySignature(): boolean {
    if (!this.issuerSignature || !this.issuerAddress) return false;

    return Crypto.verifySignature(
      this.issuerSignature,
      ethersUtils.arrayify(this.generateHash()),
      this.issuerAddress
    );
  }

  private verifyHashTree() {
    return Crypto.verifyPartialHashTree(this.hashTree, this.properties);
  }

  private verifyRootHash() {
    return Crypto.verifyRootHash(
      this.hashTree,
      this.subjectAddress,
      this.rootHash
    );
  }
}
