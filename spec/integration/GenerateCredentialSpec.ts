import "jasmine";
import { Wallet, utils as ethersUtils } from "ethers";

import Credential from "../../src/Credential";

describe("generate a credential", () => {
  it("results in a valid Credential instance", async () => {
    const issuer = Wallet.createRandom();
    const subject = Wallet.createRandom();
    const kycLevel = "plus+liveness+wallet";

    // Create map of our data
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

    // Generate the credential
    const credential = Credential.build(properties, kycLevel);

    // Generate the hash and sign it
    const hashToSign = credential.generateHash();
    const signature = await issuer.signMessage(
      ethersUtils.arrayify(hashToSign)
    );

    credential.setSignature(signature, issuer.address);

    // Run the expectations: the credential must have:
    // 1. Complete integrity
    // 2. Verifiable signature
    expect(credential.verifyIntegrity()).toBeTrue();
    expect(credential.verifySignature()).toBeTrue();

    // Remove a property from the credential
    credential.removeProperty("full_name");

    // Ensure all other properties remain
    expect(credential.getProperty("residential_address_country"));
    expect(credential.getProperty("date_of_birth"));
    expect(credential.getProperty("full_name"));
    expect(credential.getProperty("identification_document_country"));
    expect(credential.getProperty("identification_document_number"));
    expect(credential.getProperty("identification_document_type"));
    expect(credential.getProperty("liveness"));
    expect(credential.getProperty("wallet_currency"));
    expect(credential.getProperty("wallet_address"));
    expect(credential.getProperty("full_name")).not.toBeDefined();

    // Verify selective disclosure by keeping the data and signature integrity
    expect(credential.verifyIntegrity()).toBeTrue();
    expect(credential.verifySignature()).toBeTrue();
  });
});
