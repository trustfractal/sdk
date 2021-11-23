import crypto from "crypto";
import nacl from "tweetnacl";

import FractalError from "../FractalError";
import { BuildProvider } from "./builder";
import { Signature, Address, Hash, PublicKey } from "../types";

const sha256 = (words: any[]): string => {
  const digest = crypto
    .createHash("sha256")
    .update(words.join(""))
    .digest("hex");

  return `0x${digest}`;
};

const hash = (str: string, nonce: string = ""): string => {
  try {
    return sha256([str, nonce]);
  } catch {
    throw FractalError.invalidHashing(str);
  }
};

const verifySignature = (
  signature: Signature,
  message: Hash,
  expectedSigner: Address | PublicKey
): boolean => {
  try {
    return nacl.sign.detached.verify(
      Buffer.from(message),
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSigner, "hex")
    );
  } catch {
    return false;
  }
};

const generateCredentialHash = (
  subjectAddress: string,
  kycType: number,
  countryOfResidence: number,
  countryOfIDIssuance: number,
  rootHash: string
): Hash =>
  sha256([
    subjectAddress,
    kycType,
    countryOfResidence,
    countryOfIDIssuance,
    rootHash,
  ]);

export default BuildProvider(hash, verifySignature, generateCredentialHash);
