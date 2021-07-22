import "jasmine";

import Crypto from "../../../src/Crypto";
import HashTree from "../../../src/HashTree";

describe("build", () => {
  it("generates a verifiable hash tree", () => {
    const level = "wallet";

    const properties = {
      wallet_address: "0x123",
      wallet_currency: "ETH",
    };

    const { hashTree } = HashTree.build(level, properties);

    const validHashTree = Crypto.verifyHashTree(hashTree, properties);

    expect(validHashTree).toBeTrue;
  });

  it("generates a valid root hash", () => {
    const owner = "0x123";
    const level = "wallet";

    const properties = {
      wallet_address: owner,
      wallet_currency: "ETH",
    };

    const { rootHash, hashTree } = HashTree.build(level, properties);

    const validRootHash = Crypto.verifyRootHash(hashTree, owner, rootHash);

    expect(validRootHash).toBeTrue;
  });

  it("requires a valid level", () => {
    const level = "fake-level";

    const properties = {
      wallet_address: "0x123",
      wallet_currency: "ETH",
    };

    const fn = () => HashTree.build(level, properties);

    expect(fn).toThrowError(Error, /Unsupported KYC level/);
  });

  it("requires valid properties", () => {
    const level = "wallet";

    const properties = {
      wallet_currency: "ETH",
    };

    const fn = () => HashTree.build(level, properties);

    expect(fn).toThrowError(Error, /Properties do not match schema/);
  });

  it("requires valid property types", () => {
    const level = "wallet";

    const properties = {
      wallet_address: true,
      wallet_currency: "ETH",
    };

    const fn = () => HashTree.build(level, properties);

    expect(fn).toThrowError(Error, /Properties do not match schema/);
  });

  it("ignores keys not present in the schema", () => {
    const level = "wallet";

    const properties = {
      wallet_address: "0x123",
      wallet_currency: "ETH",
      fake_key: "123",
    };

    const { properties: schemaProperties } = HashTree.build(level, properties);

    expect(schemaProperties["wallet_address"]).toBeDefined();
    expect(schemaProperties["wallet_currency"]).toBeDefined();
    expect(schemaProperties["extra_key"]).not.toBeDefined();
  });
});
