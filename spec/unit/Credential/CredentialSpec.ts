import "jasmine";
import { Wallet, utils as ethersUtils } from "ethers";

import Credential from "../../../src/Credential";

const buildCredential = () => {
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

  return Credential.build(properties, kycLevel);
};

describe("build", () => {
  it("results in a valid Credential instance", async () => {
    const kycLevel = "plus+liveness+wallet";

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
      wallet_address: "0x123",
    };

    const credential = Credential.build(properties, kycLevel);

    expect(credential.verifyIntegrity()).toBeTrue();
  });

  it("converts the country tier", () => {
    const kycLevel = "plus+liveness+wallet";

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
      wallet_address: "0x123",
    };

    const credential = Credential.build(properties, kycLevel);

    expect(credential.countryOfResidence).toEqual(2);
    expect(credential.countryOfIDIssuance).toEqual(2);
  });

  it("converts the KYC type", () => {
    const kycLevel = "plus+liveness+wallet";

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
      wallet_address: "0x123",
    };

    const credential = Credential.build(properties, kycLevel);

    expect(credential.kycType).toEqual(1);
  });
});

describe("setSignature", () => {
  it("sets the issuerAddress and issuerSignature fields", async () => {
    const kycLevel = "plus+liveness+wallet";
    const issuer = Wallet.createRandom();
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

    const credential = Credential.build(properties, kycLevel);
    const hashToSign = credential.generateHash();

    const signature = await issuer.signMessage(
      ethersUtils.arrayify(hashToSign)
    );

    credential.setSignature(signature, issuer.address);

    expect(credential.issuerSignature).toEqual(signature);
    expect(credential.issuerAddress).toEqual(issuer.address);
  });

  it("requires a valid signature", async () => {
    const credential = buildCredential();
    const issuer = Wallet.createRandom();
    const hashToSign = issuer.address;
    const signature = await issuer.signMessage(hashToSign);

    const fn = () => credential.setSignature(signature, issuer.address);

    expect(fn).toThrowError(Error, /Invalid signature found/);
  });
});

describe("removeProperty", () => {
  it("deletes the property and the corresponding nonce", () => {
    const credential = buildCredential();

    credential.removeProperty("liveness");

    const {
      hashTree: { liveness },
      properties: credentialProperties,
    } = credential;

    expect(liveness.hash).toBeDefined();
    expect(liveness.nonce).not.toBeDefined();
    expect(credentialProperties.liveness).not.toBeDefined();
  });
});

describe("verifyIntegrity", () => {
  it("is true for valid credentials", () => {
    const credential = buildCredential();

    expect(credential.verifyIntegrity()).toBeTrue();
  });

  it("requires a valid hashTree", () => {
    const credential = buildCredential();

    credential.hashTree.full_name.hash = "0x0";

    expect(credential.verifyIntegrity()).toBeFalse();
  });

  it("requires a valid subjectAddress", () => {
    const credential = buildCredential();

    credential.subjectAddress = "0x0";

    expect(credential.verifyIntegrity()).toBeFalse();
  });

  it("requires a valid rootHash", () => {
    const credential = buildCredential();

    credential.rootHash = "0x0";

    expect(credential.verifyIntegrity()).toBeFalse();
  });
});

describe("verifySignature", () => {
  it("is true for a correctly signed credential", async () => {
    const credential = buildCredential();
    const issuer = Wallet.createRandom();
    const hash = credential.generateHash();
    const signature = await issuer.signMessage(ethersUtils.arrayify(hash));

    credential.setSignature(signature, issuer.address);

    expect(credential.verifySignature()).toBeTrue();
  });

  it("requires a valid issuerSignature", async () => {
    const credential = buildCredential();
    const issuer = Wallet.createRandom();
    const hash = "0x0";

    credential.issuerSignature = await issuer.signMessage(hash);
    credential.issuerAddress = issuer.address;

    expect(credential.verifySignature()).toBeFalse();
  });

  it("requires a valid issuer address", async () => {
    const credential = buildCredential();
    const issuer = Wallet.createRandom();
    const someone = Wallet.createRandom();
    const hash = credential.generateHash();

    credential.issuerSignature = await issuer.signMessage(hash);
    credential.issuerAddress = someone.address;

    expect(credential.verifySignature()).toBeFalse();
  });
});
