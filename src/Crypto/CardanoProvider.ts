import { blake2bHex } from "blakejs";
// @ts-ignore
import Cardano from "cardano-crypto.js";

import FractalError from "../FractalError";

import { BuildProvider } from "./builder";

import { Signature, Address, Hash, PublicKey } from "../types";

const blake2b_256 = (words: any[]): string =>
  blake2bHex(words.join(""), undefined, 32);

const hash = (str: string, nonce: string = ""): string => {
  const value = blake2b_256([str, nonce]);

  if (value === null) throw FractalError.invalidHashing(str);

  return value;
};

const verifySignature = (
  signature: Signature,
  message: Hash,
  expectedSigner: Address | PublicKey
): boolean =>
  Cardano.verify(
    Buffer.from(message),
    Buffer.from(expectedSigner, "hex"),
    Buffer.from(signature, "hex")
  );

const generateCredentialHash = (
  subjectAddress: string,
  kycType: number,
  countryOfResidence: number,
  countryOfIDIssuance: number,
  rootHash: string
): Hash =>
  blake2b_256([
    subjectAddress,
    kycType,
    countryOfResidence,
    countryOfIDIssuance,
    rootHash,
  ]);

export default BuildProvider(hash, verifySignature, generateCredentialHash);
