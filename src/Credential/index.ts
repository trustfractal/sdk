import Schema from "../Schema";
import FractalError from "../FractalError";
import CryptographicHashTree from "../HashTree";

import CountryTiers from "./CountryTiers";
import KYCTypes from "./KYCTypes";
import EthereumCredential from "./Ethereum";
import CardanoCredential from "./Cardano";
import SolanaCredential from "./Solana";

import {
  Properties,
  Hash,
  Address,
  Signature,
  HashTree,
  ICredential,
  CountryTier,
  KycType,
  Blockchain,
  CryptoProvider,
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
  public blockchain: Blockchain;
  public cryptoProvider: CryptoProvider;

  public static Ethereum = EthereumCredential;
  public static Cardano = CardanoCredential;
  public static Solana = SolanaCredential;

  public static build(
    blockchain: Blockchain,
    cryptoProvider: CryptoProvider,
    properties: Properties,
    kycLevel: string
  ) {
    let subjectAddress = properties[Schema.WalletAddressKey];

    if (!subjectAddress) throw FractalError.invalidProperties(properties);

    const {
      rootHash,
      hashTree,
      properties: schemaProperties,
    } = CryptographicHashTree.build(cryptoProvider, kycLevel, properties);

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
      blockchain,
      cryptoProvider,
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
    blockchain,
    cryptoProvider,
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
    this.blockchain = blockchain;
    this.cryptoProvider = cryptoProvider;
  }

  public generateHash(): Hash {
    return this.cryptoProvider.generateCredentialHash(
      this.subjectAddress,
      this.kycType,
      this.countryOfResidence,
      this.countryOfIDIssuance,
      this.rootHash
    );
  }

  public setSignature(signature: Signature, signedBy: Address) {
    const hash = this.generateHash();

    const validSignature = this.cryptoProvider.verifySignature(
      signature,
      hash,
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

    return this.cryptoProvider.verifySignature(
      this.issuerSignature,
      this.generateHash(),
      this.issuerAddress
    );
  }

  private verifyHashTree() {
    return this.cryptoProvider.verifyPartialHashTree(
      this.hashTree,
      this.properties
    );
  }

  private verifyRootHash() {
    return this.cryptoProvider.verifyRootHash(
      this.hashTree,
      this.subjectAddress,
      this.rootHash
    );
  }
}
