import { utils as ethersUtils } from "ethers";
import FractalError from "../FractalError";
import { BuildProvider } from "./builder";

import { Signature, Address, Hash } from "../types";

const hash = (str: string, nonce: string = ""): string => {
  const value = ethersUtils.solidityKeccak256(
    ["string", "string"],
    [nonce, str]
  );

  if (value === null) throw FractalError.invalidHashing(str);

  return value;
};

const verifySignature = (
  signature: Signature,
  message: Hash,
  expectedSigner: Address
): boolean =>
  ethersUtils.verifyMessage(ethersUtils.arrayify(message), signature) ===
  expectedSigner;

const generateCredentialHash = (
  subjectAddress: string,
  kycType: number,
  countryOfResidence: number,
  countryOfIDIssuance: number,
  rootHash: string
): Hash =>
  ethersUtils.solidityKeccak256(
    ["address", "uint8", "uint8", "uint8", "bytes32"],
    [subjectAddress, kycType, countryOfResidence, countryOfIDIssuance, rootHash]
  );

export default BuildProvider(hash, verifySignature, generateCredentialHash);
