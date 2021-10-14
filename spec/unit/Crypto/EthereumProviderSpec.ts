import "jasmine";
import { Wallet, utils as ethersUtils } from "ethers";

import EthereumProvider from "../../../src/Crypto/EthereumProvider";
import Schema from "../../../src/Schema";

const soliditySha3 = (str: string) =>
  ethersUtils.solidityKeccak256(["string"], [str]);

const buildHashTree = () => {
  const properties = {
    name: "Foo",
    age: 20,
  };
  const hashTree = EthereumProvider.buildHashTree(properties);

  return { hashTree, properties };
};

const buildRootHash = () => {
  const owner = "0x0";
  const { hashTree } = buildHashTree();

  const rootHash = EthereumProvider.calculateRootHash(hashTree, owner);

  return {
    rootHash,
    hashTree,
    owner,
  };
};

const buildSchemaWithProperties = () => {
  const kycLevel = "plus+liveness+wallet";
  const subject = Wallet.createRandom();

  const properties = {
    place_of_birth: "New Zealand",
    residential_address_country: "NZ",
    residential_address: "Fake St.",
    date_of_birth: "1990-01-01",
    full_name: "JOHN CITIZEN",
    identification_document_country: "NZ",
    identification_document_number: "00000000",
    identification_document_type: "passport",
    liveness: true,
    wallet_currency: "ETH",
    wallet_address: subject.address,
  };

  const schema = Schema.build(kycLevel);

  return { schema, properties };
};

describe("buildHashTree", () => {
  it("generates a hash tree", () => {
    const { properties } = buildSchemaWithProperties();

    const hashTree = EthereumProvider.buildHashTree(properties);

    Object.keys(properties).forEach((key: string) => {
      expect(hashTree[key].hash).toBeDefined();
      expect(hashTree[key].nonce).toBeDefined();
    });
  });

  it("generates verifiable hashes", () => {
    const { properties } = buildSchemaWithProperties();

    const hashTree = EthereumProvider.buildHashTree(properties);

    Object.entries(properties).forEach(([key, value]: [string, any]) => {
      const hashable = JSON.stringify({ [key]: value });
      const { nonce, hash } = hashTree[key];

      const { hash: expectedHash } = EthereumProvider.hashWithNonce(
        hashable,
        nonce
      );

      expect(hash).toEqual(expectedHash);
    });
  });
});

describe("calculateRootHash", () => {
  it("correctly calculates the soliditySha3 of the hash tree", () => {
    const hashTree = {
      fieldA: {
        hash: "0x0",
        nonce: "0x0",
      },
      fieldB: {
        hash: "0x1",
        nonce: "0x1",
      },
    };

    const owner = "0x2";
    const expectedHash = soliditySha3("0x00x10x2");

    const hash = EthereumProvider.calculateRootHash(hashTree, owner);

    expect(hash).toEqual(expectedHash);
  });

  it("outputs the same value for computationally equivalent hash trees", () => {
    const hashTree1 = {
      fieldA: {
        hash: "0x0",
        nonce: "0x0",
      },
      fieldB: {
        hash: "0x1",
        nonce: "0x1",
      },
    };

    const hashTree2 = {
      fieldB: {
        hash: "0x1",
        nonce: "0x1",
      },
      fieldA: {
        nonce: "0x0",
        hash: "0x0",
      },
    };

    const owner = "0x2";

    const hash1 = EthereumProvider.calculateRootHash(hashTree1, owner);
    const hash2 = EthereumProvider.calculateRootHash(hashTree2, owner);

    expect(hash1).toEqual(hash2);
  });
});

describe("verifySignature", async () => {
  const wallet = Wallet.createRandom();
  const otherWallet = Wallet.createRandom();

  it("is true for valid signatures", async () => {
    const message = ethersUtils.solidityKeccak256(["string"], ["foo"]);
    const signature = await wallet.signMessage(ethersUtils.arrayify(message));

    const result = EthereumProvider.verifySignature(
      signature,
      message,
      wallet.address
    );

    expect(result).toBeTrue();
  });

  it("is false for other messages", async () => {
    const message = ethersUtils.solidityKeccak256(["string"], ["foo"]);
    const signature = await wallet.signMessage(ethersUtils.arrayify(message));
    const otherMessage = ethersUtils.solidityKeccak256(["string"], ["bar"]);

    const result = EthereumProvider.verifySignature(
      signature,
      otherMessage,
      wallet.address
    );

    expect(result).not.toBeTrue();
  });

  it("is false for tampered signatures", async () => {
    const message = ethersUtils.solidityKeccak256(["string"], ["foo"]);
    const signature = await otherWallet.signMessage(
      ethersUtils.arrayify(message)
    );

    const result = EthereumProvider.verifySignature(
      signature,
      message,
      wallet.address
    );

    expect(result).not.toBeTrue();
  });

  it("is false for tampered addresses", async () => {
    const message = ethersUtils.solidityKeccak256(["string"], ["foo"]);
    const signature = await wallet.signMessage(ethersUtils.arrayify(message));

    const result = EthereumProvider.verifySignature(
      signature,
      message,
      otherWallet.address
    );

    expect(result).not.toBeTrue();
  });
});

describe("verifyHashTree", () => {
  it("is true for valid hash trees", () => {
    const { hashTree, properties } = buildHashTree();

    const result = EthereumProvider.verifyHashTree(hashTree, properties);

    expect(result).toBeTrue();
  });

  it("is false for tampered hash trees", () => {
    const { hashTree, properties } = buildHashTree();
    const [key, ..._rest] = Object.keys(properties);

    hashTree[key].hash = "tampered";

    const result = EthereumProvider.verifyHashTree(hashTree, properties);

    expect(result).not.toBeTrue();
  });

  it("is false for tampered hash trees nonces", () => {
    const { hashTree, properties } = buildHashTree();
    const [key, ..._rest] = Object.keys(properties);

    hashTree[key].nonce = "tampered";

    const result = EthereumProvider.verifyHashTree(hashTree, properties);

    expect(result).not.toBeTrue();
  });

  it("is false for tampered hash trees nodes", () => {
    const { hashTree, properties } = buildHashTree();
    const [[key, value], ..._rest] = Object.entries(properties);

    const hashable = EthereumProvider.buildHashableTreeValue(
      key,
      value + "tampered"
    );

    hashTree[key] = EthereumProvider.hashWithNonce(hashable);

    const result = EthereumProvider.verifyHashTree(hashTree, properties);

    expect(result).not.toBeTrue();
  });

  it("is false for added hash trees nodes", () => {
    const { hashTree, properties } = buildHashTree();

    const hashable = EthereumProvider.buildHashableTreeValue(
      "tampered",
      "value"
    );
    hashTree["tampered"] = EthereumProvider.hashWithNonce(hashable);

    const result = EthereumProvider.verifyHashTree(hashTree, properties);

    expect(result).not.toBeTrue();
  });

  it("is false for missing hash trees nodes", () => {
    const { hashTree, properties } = buildHashTree();
    const [key, ..._rest] = Object.keys(properties);

    delete hashTree[key];

    const result = EthereumProvider.verifyHashTree(hashTree, properties);

    expect(result).not.toBeTrue();
  });

  it("is false for tampered properties", () => {
    const { hashTree, properties } = buildHashTree();
    const [key, ..._rest] = Object.keys(properties);

    // @ts-ignore
    properties[key] = "tampered";

    const result = EthereumProvider.verifyHashTree(hashTree, properties);

    expect(result).not.toBeTrue();
  });

  it("is false for added properties", () => {
    const { hashTree, properties } = buildHashTree();

    // @ts-ignore
    properties["tampered"] = "value";

    const result = EthereumProvider.verifyHashTree(hashTree, properties);

    expect(result).not.toBeTrue();
  });

  it("is false for missing properties", () => {
    const { hashTree, properties } = buildHashTree();
    const [key, ..._rest] = Object.keys(properties);

    // @ts-ignore
    delete properties[key];

    const result = EthereumProvider.verifyHashTree(hashTree, properties);

    expect(result).not.toBeTrue();
  });
});

describe("verifyPartialHashTree", () => {
  it("is true for valid hash trees", () => {
    const { hashTree, properties } = buildHashTree();

    const result = EthereumProvider.verifyPartialHashTree(hashTree, properties);

    expect(result).toBeTrue();
  });

  it("is true for hash trees with nonces removed", () => {
    const { hashTree, properties } = buildHashTree();
    const [key, ..._rest] = Object.keys(properties);

    // @ts-ignore
    delete properties[key];
    delete hashTree[key].nonce;

    const result = EthereumProvider.verifyPartialHashTree(hashTree, properties);

    expect(result).toBeTrue();
  });

  it("is false for tampered hash trees", () => {
    const { hashTree, properties } = buildHashTree();
    const [key, ..._rest] = Object.keys(properties);

    hashTree[key].hash = "tampered";

    const result = EthereumProvider.verifyPartialHashTree(hashTree, properties);

    expect(result).not.toBeTrue();
  });

  it("is false for tampered hash trees nonces", () => {
    const { hashTree, properties } = buildHashTree();
    const [key, ..._rest] = Object.keys(properties);

    hashTree[key].nonce = "tampered";

    const result = EthereumProvider.verifyPartialHashTree(hashTree, properties);

    expect(result).not.toBeTrue();
  });

  it("is false for tampered hash trees nodes", () => {
    const { hashTree, properties } = buildHashTree();
    const [[key, value], ..._rest] = Object.entries(properties);

    const hashable = EthereumProvider.buildHashableTreeValue(
      key,
      value + "tampered"
    );

    hashTree[key] = EthereumProvider.hashWithNonce(hashable);

    const result = EthereumProvider.verifyPartialHashTree(hashTree, properties);

    expect(result).not.toBeTrue();
  });

  it("is false for missing hash trees nodes", () => {
    const { hashTree, properties } = buildHashTree();
    const [key, ..._rest] = Object.keys(properties);

    delete hashTree[key];

    const result = EthereumProvider.verifyPartialHashTree(hashTree, properties);

    expect(result).not.toBeTrue();
  });

  it("is false for tampered properties", () => {
    const { hashTree, properties } = buildHashTree();
    const [key, ..._rest] = Object.keys(properties);

    // @ts-ignore
    properties[key] = "tampered";

    const result = EthereumProvider.verifyPartialHashTree(hashTree, properties);

    expect(result).not.toBeTrue();
  });

  it("is false for added properties", () => {
    const { hashTree, properties } = buildHashTree();

    // @ts-ignore
    properties["tampered"] = "value";

    const result = EthereumProvider.verifyPartialHashTree(hashTree, properties);

    expect(result).not.toBeTrue();
  });
});

describe("validateRootHash", () => {
  it("is true for valid root hashes", () => {
    const { rootHash, owner, hashTree } = buildRootHash();

    const result = EthereumProvider.verifyRootHash(hashTree, owner, rootHash);

    expect(result).toBeTrue();
  });

  it("is falsed for tampered owners", () => {
    const { rootHash, owner, hashTree } = buildRootHash();

    const result = EthereumProvider.verifyRootHash(
      hashTree,
      owner + "tampered",
      rootHash
    );

    expect(result).not.toBeTrue();
  });

  it("is false for tampered hash trees", () => {
    const { rootHash, owner, hashTree } = buildRootHash();
    const [key, _rest] = Object.keys(hashTree);
    hashTree[key].hash = "tampered";

    const result = EthereumProvider.verifyRootHash(hashTree, owner, rootHash);

    expect(result).not.toBeTrue();
  });
});
