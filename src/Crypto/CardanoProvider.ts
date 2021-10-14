import { blake2bHex } from "blakejs";
// @ts-ignore
import Cardano from "cardano-crypto.js";

import FractalError from "../FractalError";

import { BuildProvider } from "./builder";

import { Signature, Address, Hash, PublicKey } from "../types";

const hash = (str: string, nonce: string = ""): string => {
  const value = blake2bHex([str, nonce].join(""));

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
    Buffer.from(expectedSigner),
    Buffer.from(signature)
  );

const generateCredentialHash = (
  subjectAddress: string,
  kycType: number,
  countryOfResidence: number,
  countryOfIDIssuance: number,
  rootHash: string
): Hash =>
  blake2bHex(
    [
      subjectAddress,
      kycType,
      countryOfResidence,
      countryOfIDIssuance,
      rootHash,
    ].join("")
  );

export default BuildProvider(hash, verifySignature, generateCredentialHash);
