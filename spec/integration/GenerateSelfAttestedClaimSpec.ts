import "jasmine";
import { Wallet } from "ethers";

import AttestationRequest from "../../src/AttestationRequest";
import Claim from "../../src/Claim";
import ClaimType from "../../src/ClaimType";
import SelfAttestedClaim from "../../src/SelfAttestedClaim";

describe("generate a self attested claim", () => {
  it("results in a valid SelfAttestedClaim", async () => {
    const attester = Wallet.createRandom();
    const claimer = Wallet.createRandom();
    const kycLevel = "basic+liveness";

    // Generate a claim type
    const claimType = ClaimType.build(kycLevel);

    // Create a claim with our data
    const properties = {
      residential_address_country: "NZ",
      date_of_birth: "1990-01-01",
      full_name: "JOHN CITIZEN",
      identification_document_country: "NZ",
      identification_document_number: "00000000",
      identification_document_type: "passport",
      liveness: true,
    };

    const claim = new Claim(claimType, properties, claimer.address);

    // Generate an AttestationRequest
    const request = AttestationRequest.fromClaim(claim);

    // Run the expectations: all fields are defined && valid
    expect(request.claim).toBeDefined();
    expect(request.claimHashTree).toBeDefined();
    expect(request.claimTypeHash).toBeDefined();
    expect(request.rootHash).toBeDefined();
    expect(request.validateWithoutSignature()).toBeTrue();

    // Generate the self attested claim from the request
    const selfAttestedClaim = SelfAttestedClaim.fromRequest(
      request,
      attester.address,
      kycLevel
    );

    // Generate the hash and sign it
    const hashToSign = selfAttestedClaim.generateHash();
    selfAttestedClaim.attesterSignature = await attester.signMessage(
      hashToSign
    );

    // Run the expectations: the claim has complete integrity and is correctly
    // signed
    expect(selfAttestedClaim.verifyIntegrity()).toBeTrue();
    expect(selfAttestedClaim.verifySignature()).toBeTrue();

    // Remove the property from the selfAttestedClaim
    selfAttestedClaim.removeProperty("full_name");

    expect(selfAttestedClaim.getProperty("residential_address_country"));
    expect(selfAttestedClaim.getProperty("date_of_birth"));
    expect(selfAttestedClaim.getProperty("full_name"));
    expect(selfAttestedClaim.getProperty("identification_document_country"));
    expect(selfAttestedClaim.getProperty("identification_document_number"));
    expect(selfAttestedClaim.getProperty("identification_document_type"));
    expect(selfAttestedClaim.getProperty("liveness"));
    expect(selfAttestedClaim.getProperty("full_name")).not.toBeDefined();

    // Ensure the integrity of data
    expect(selfAttestedClaim.verifyIntegrity()).toBeTrue();
  });
});
