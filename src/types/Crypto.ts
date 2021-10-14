import { Properties } from "./base";

export type Address = string;

export type Hash = string;

export type HashWithNonce = {
  hash: string;
  nonce?: string;
};

export type Signature = string;

export type HashTree = Record<string, HashWithNonce>;

export type CryptoProvider = {
  hash: (hash: string, nonce?: string) => string;
  hashWithNonce: (term: any, nonce?: string) => { nonce: string; hash: string };
  buildHashTree: (properties: Properties) => HashTree;
  buildHashableTreeValue: (key: string, value: any) => string;
  calculateRootHash: (hashTree: HashTree, owner: Address) => string;
  verifySignature: (
    signature: Signature,
    message: Hash,
    expectedSigner: Address
  ) => boolean;
  verifyRootHash: (
    hashTree: HashTree,
    owner: Address,
    expectedHash: Hash
  ) => boolean;
  verifyHashTree: (hashTree: HashTree, properties: Properties) => boolean;
  verifyPartialHashTree: (hashTree: HashTree, properties: object) => boolean;
  generateCredentialHash: (
    subjectAddress: string,
    kycType: number,
    countryOfResidence: number,
    countryOfIDIssuance: number,
    rootHash: string
  ) => Hash;
};
