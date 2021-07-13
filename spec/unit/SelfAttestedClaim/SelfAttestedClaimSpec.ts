import "jasmine";
import { Wallet, utils as ethersUtils } from "ethers";

import AttestationRequest from "../../../src/AttestationRequest";
import Claim from "../../../src/Claim";
import ClaimType from "../../../src/ClaimType";
import SelfAttestedClaim from "../../../src/SelfAttestedClaim";

import { Byte } from "../../../src/types";

const buildClaim = (address?: string) => {
  const kycLevel = "plus+liveness+wallet";

  const claimType = ClaimType.build(kycLevel);

  const properties = {
    place_of_birth: "New Zealand",
    residential_address_country: "NZ",
    date_of_birth: "1990-01-01",
    full_name: "JOHN CITIZEN",
    identification_document_country: "NZ",
    identification_document_number: "00000000",
    identification_document_type: "passport",
    liveness: true,
    wallet_address: "0x0",
    wallet_currency: "ETH",
  };

  return new Claim(claimType, properties, address);
};

const buildSelfAttestedClaim = (attesterAddress?: string) => {
  const kycLevel = "plus+liveness+wallet";
  const attester = attesterAddress || Wallet.createRandom().address;
  const claimerAddress = Wallet.createRandom().address;
  const claim = buildClaim(claimerAddress);
  const request = AttestationRequest.fromClaim(claim);

  return SelfAttestedClaim.fromRequest(request, attester, kycLevel);
};

describe("fromRequest", () => {
  it("requires a claim owner", () => {
    const kycLevel = "plus+liveness+wallet";
    const attesterAddress = Wallet.createRandom().address;
    const claim = buildClaim();
    const request = AttestationRequest.fromClaim(claim);

    const fn = () =>
      SelfAttestedClaim.fromRequest(request, attesterAddress, kycLevel);

    expect(fn).toThrowError();
  });

  it("requires a valid attestation request", () => {
    const kycLevel = "plus+liveness+wallet";
    const attesterAddress = Wallet.createRandom().address;
    const claimerAddress = Wallet.createRandom().address;
    const claim = buildClaim(claimerAddress);
    const request = AttestationRequest.fromClaim(claim);
    request.rootHash = "0x0";

    const fn = () =>
      SelfAttestedClaim.fromRequest(request, attesterAddress, kycLevel);

    expect(fn).toThrowError();
  });

  it("requires the claim type corresponding to the claim", () => {
    const kycLevel = "plus+liveness+wallet+sow";
    const attesterAddress = Wallet.createRandom().address;
    const claimerAddress = Wallet.createRandom().address;
    const claim = buildClaim(claimerAddress);
    const request = AttestationRequest.fromClaim(claim);

    const fn = () =>
      SelfAttestedClaim.fromRequest(request, attesterAddress, kycLevel);

    expect(fn).toThrowError();
  });

  it("converts the country of residence, country of ID issuance and KYC level", () => {
    const kycLevel = "plus+liveness+wallet";
    const attesterAddress = Wallet.createRandom().address;
    const claimerAddress = Wallet.createRandom().address;
    const claim = buildClaim(claimerAddress);
    const request = AttestationRequest.fromClaim(claim);

    const selfAttestedClaim = SelfAttestedClaim.fromRequest(
      request,
      attesterAddress,
      kycLevel
    );

    expect(selfAttestedClaim.countryOfResidence).toBeInstanceOf(Byte);
    expect(selfAttestedClaim.countryOfResidence.value).toBeInstanceOf(Number);
    expect(selfAttestedClaim.countryOfIDIssuance).toBeInstanceOf(Byte);
    expect(selfAttestedClaim.countryOfIDIssuance.value).toBeInstanceOf(Number);
    expect(selfAttestedClaim.kycType).toBeInstanceOf(Byte);
    expect(selfAttestedClaim.kycType.value).toBeInstanceOf(Number);
  });
});

describe("verifyIntegrity", () => {
  it("is true for valid selfAttestedClaims", () => {
    const selfAttestedClaim = buildSelfAttestedClaim();

    expect(selfAttestedClaim.verifyIntegrity()).toBeTrue();
  });

  it("requires a valid claimHashTree", () => {
    const selfAttestedClaim = buildSelfAttestedClaim();
    selfAttestedClaim.claimHashTree.full_name.hash = "0x0";

    expect(selfAttestedClaim.verifyIntegrity()).toBeFalse();
  });

  it("requires a valid claimTypeHash", () => {
    const selfAttestedClaim = buildSelfAttestedClaim();
    selfAttestedClaim.claimTypeHash.hash = "0x0";

    expect(selfAttestedClaim.verifyIntegrity()).toBeFalse();
  });

  it("requires a valid claimerAddress", () => {
    const selfAttestedClaim = buildSelfAttestedClaim();
    selfAttestedClaim.claimerAddress = "0x0";

    expect(selfAttestedClaim.verifyIntegrity()).toBeFalse();
  });

  it("requires a valid rootHash", () => {
    const selfAttestedClaim = buildSelfAttestedClaim();
    selfAttestedClaim.rootHash = "0x0";

    expect(selfAttestedClaim.verifyIntegrity()).toBeFalse();
  });
});

describe("verifySignature", () => {
  it("is true for a correctly signed selfAttestedClaim", async () => {
    const attester = Wallet.createRandom();
    const selfAttestedClaim = buildSelfAttestedClaim(attester.address);
    const hash = selfAttestedClaim.generateHash();
    selfAttestedClaim.attesterSignature = await attester.signMessage(
      ethersUtils.arrayify(hash)
    );

    expect(selfAttestedClaim.verifySignature()).toBeTrue();
  });

  it("requires a valid attesterSignature", async () => {
    const attester = Wallet.createRandom();
    const selfAttestedClaim = buildSelfAttestedClaim(attester.address);
    const hash = "0x0";
    selfAttestedClaim.attesterSignature = await attester.signMessage(hash);

    expect(selfAttestedClaim.verifySignature()).toBeFalse();
  });

  it("requires a valid attesterAddress", async () => {
    const attester = Wallet.createRandom();
    const selfAttestedClaim = buildSelfAttestedClaim("0x0");
    const hash = selfAttestedClaim.generateHash();
    selfAttestedClaim.attesterSignature = await attester.signMessage(hash);

    expect(selfAttestedClaim.verifySignature()).toBeFalse();
  });
});

describe("removeProperty", () => {
  it("deletes the property and the corresponding nonce", () => {
    const claimerAddress = "0x0";
    const attesterAddress = "0x1";
    const claimTypeHash = { hash: "0x123", nonce: "0x0" };

    const claimHashTree = {
      full_name: { hash: "0x1", nonce: "0x2" },
      date_of_birth: { hash: "0x3", nonce: "0x4" },
    };

    const claim = {
      claimTypeHash: claimTypeHash.hash,
      owner: claimerAddress,
      properties: {
        full_name: "JOHN CITIZEN",
        date_of_birth: "1990-01-01",
      },
    };

    const selfAttestedClaim = new SelfAttestedClaim({
      claim,
      claimTypeHash,
      claimHashTree,
      rootHash: "0x0",
      claimerAddress,
      attesterAddress,
      attesterSignature: null,
      countryOfIDIssuance: new Byte(1),
      countryOfResidence: new Byte(1),
      kycType: new Byte(1),
    });

    selfAttestedClaim.removeProperty("date_of_birth");

    expect(selfAttestedClaim.claim.properties).toEqual({
      full_name: "JOHN CITIZEN",
    });
    expect(selfAttestedClaim.claimHashTree).toEqual({
      full_name: { hash: "0x1", nonce: "0x2" },
      date_of_birth: { hash: "0x3" },
    });
  });
});
