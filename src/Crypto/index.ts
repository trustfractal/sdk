import { v4 as uuidv4 } from "uuid";
import { utils as ethersUtils } from "ethers";

import {
  isArray,
  isPlainObject,
  deepSortObject,
  deepSortArray,
} from "../utils";

import FractalError from "../FractalError";
import { Properties, HashTree, Signature, Address, Hash } from "../types";

const doHash = (str: string, nonce: string = ""): string => {
  const value = ethersUtils.solidityKeccak256(
    ["string", "string"],
    [nonce, str]
  );

  if (value === null) throw FractalError.invalidHashing(str);

  return value;
};

const hashObject = (obj: Record<string, any>, nonce: string = "") =>
  doHash(nonce + JSON.stringify(deepSortObject(obj)));

const hashArray = (obj: Array<any>, nonce: string = "") =>
  doHash(nonce + JSON.stringify(deepSortArray(obj)));

// web3.utils.solidityHash supports, by default, String|Number|Bool|BN To
// support objects or arrays, we need to convert them to string first
const hash = (term: any): string => {
  switch (true) {
    case isArray(term):
      return hashArray(term);
    case isPlainObject(term):
      return hashObject(term);
    default:
      return doHash(term);
  }
};

const hashWithNonce = (
  term: any,
  nonce?: string
): { nonce: string; hash: string } => {
  nonce = nonce || uuidv4();

  switch (true) {
    case isArray(term):
      return { nonce, hash: hashArray(term, nonce) };
    case isPlainObject(term):
      return { nonce, hash: hashObject(term, nonce) };
    default:
      return { nonce, hash: doHash(term, nonce) };
  }
};

const buildHashableTreeValue = (key: string, value: any): string =>
  JSON.stringify({ [key]: value });

const buildHashTree = (properties: Properties): HashTree =>
  Object.entries(properties).reduce(
    (memo: HashTree, [key, value]: [string, any]) => {
      const hashable = buildHashableTreeValue(key, value);
      memo[key] = hashWithNonce(hashable);

      return memo;
    },
    {}
  );

const calculateRootHash = (hashTree: HashTree, owner: Address): string => {
  const sortedHashes = Object.values(hashTree)
    .map(({ hash }) => hash)
    .sort();

  const hashable = [...sortedHashes, owner].join("");

  return hash(hashable);
};

const verifySignature = (
  signature: Signature,
  message: string | Uint8Array,
  expectedSigner: Address
) => ethersUtils.verifyMessage(message, signature) === expectedSigner;

const verifyHashTree = (hashTree: HashTree, properties: Properties) => {
  const validHashes = Object.entries(properties).every(([key, value]) => {
    const hashable = buildHashableTreeValue(key, value);
    const node = hashTree[key];

    if (!node) return false;

    const { hash, nonce } = node;
    const { hash: expectedHash } = hashWithNonce(hashable, nonce);

    return hash === expectedHash;
  });

  const sameKeys =
    JSON.stringify(Object.keys(properties).sort()) ===
    JSON.stringify(Object.keys(hashTree).sort());

  return validHashes && sameKeys;
};

const verifyPartialHashTree = (hashTree: HashTree, properties: object) =>
  Object.entries(properties).every(([key, value]) => {
    const hashable = buildHashableTreeValue(key, value);
    const node = hashTree[key];

    if (!node) return false;

    const { hash, nonce } = hashTree[key];

    if (!nonce) return true;

    const { hash: expectedHash } = hashWithNonce(hashable, nonce);
    return hash === expectedHash;
  });

const verifyRootHash = (
  hashTree: HashTree,
  owner: Address,
  expectedHash: Hash
) => calculateRootHash(hashTree, owner) === expectedHash;

export default {
  hash,
  hashWithNonce,
  buildHashTree,
  buildHashableTreeValue,
  calculateRootHash,
  verifySignature,
  verifyRootHash,
  verifyHashTree,
  verifyPartialHashTree,
};
