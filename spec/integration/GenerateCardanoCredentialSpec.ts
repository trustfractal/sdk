import "jasmine";

// @ts-ignore
import Cardano from "cardano-crypto.js";

import Credential from "../../src/Credential";

const TESTNET_PROTOCOL_MAGIC = 42;

const deriveWallet = async (mnemonic: string) => {
  const keypair = await Cardano.mnemonicToRootKeypair(mnemonic, 1);
  const publicKey = keypair.slice(64, 96);
  const extendedPublicKey = keypair.slice(64, 128);
  const hdPassphrase = await Cardano.xpubToHdPassphrase(extendedPublicKey);

  const packedAddress = Cardano.packBootstrapAddress(
    [1, 1],
    extendedPublicKey,
    hdPassphrase,
    1,
    TESTNET_PROTOCOL_MAGIC
  );

  const address = Cardano.base58.encode(packedAddress);

  return {
    keypair,
    publicKey,
    extendedPublicKey,
    hdPassphrase,
    packedAddress,
    address,
  };
};

const signMessage = (message: string, keypair: Buffer) =>
  Cardano.sign(Buffer.from(message), keypair);

describe("generate a credential", () => {
  it("results in a valid Credential instance", async () => {
    const issuerMnemonic =
      "high property jaguar ahead this cat simple lottery exist need baby feed";

    const issuer = await deriveWallet(issuerMnemonic);

    const subjectMnemonic =
      "outer sort mad inhale print airport video document two express butter stuff";

    const subject = await deriveWallet(subjectMnemonic);

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
    const credential = Credential.Cardano.build(properties, kycLevel);

    // Generate the hash and sign it
    const hashToSign = credential.generateHash();

    const signature = signMessage(hashToSign, issuer.keypair);

    credential.setSignature(signature, issuer.publicKey);

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
