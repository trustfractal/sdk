# Fractal DID SDK

![npm shield][npm-shield]

This is the SDK for interacting with Fractal's DID Credentials.

After a user performs KYC with Fractal, that data is processed and a DID
credential is generated.

## Table of Contents

- [Instalation](#instalation)
- [Usage](#usage)
- [Setup](#setup)
- [Testing](#testing)
- [License](#license)
- [About](#about)

## Instalation

To add the dependency to your project, simply do:

```sh
yarn add @trustfractal/sdk
```

## Usage

The Credentials are generated and signed by Fractal's server. Once your KYC is
approved, our servers will generate a credential. If you have the [Fractal
Wallet][fractal-wallet] installed, it should automatically sync.

You can find examples of integrating with Fractal DIDs [in our docs][did-docs].

Right now, two types of credentials are supported:

- Ethereum;
- Cardano.

### Generating and signing a credential

The credentials are generated for KYCs of one of the following types:

- `plus+liveness+wallet`
- `plus+liveness+wallet+sow`
- `plus+selfie+wallet`
- `plus+selfie+wallet+sow`
- `plus+liveness+accreditation+wallet`
- `plus+liveness+accreditation+wallet+sow`
- `plus+selfie+accreditation+wallet`
- `plus+selfie+accreditation+wallet+sow`

```typescript
import { Credential } from "@trustfractal/sdk";

const level = "plus+liveness+wallet";

// Your data
// Find the required fields for each KYC level at
// src/Schema/schemas.ts
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
  wallet_address: address,
};

// Builds an Ethereum credential
// To build a Cardano credential, ensure the wallet_currency field is ADA
// and call Credential.Cardano.build
const credential = Credential.Ethereum.build(properties, level);
```

The generate credential has the following format:

```typescript
Credential {
  properties,          // user raw data
  hashTree,            // tree of hashes containing a nonce and the hashed value
  rootHash,            // the hash of all hashes in the tree tree, identifies it
  subjectAddress,      // the user wallet address
  issuerAddress,       // the address of the Fractal signer
  issuerSignature,     // signature from Fractal verifying your data is correct
  countryOfIDIssuance, // coded tier of the country the user's ID document was issued
  countryOfResidence,  // coded tier of the country the user resides in
  kycType,             // coded KYC level
  blockchain,          // coded blockchain for the credential
}
```

#### Country Tiers

The `countryOfIDIssuance` and `countryOfResidence` fields are numeric fields.
They represent a tier of countries the user belongs to, instead of a specific
country. Some verifiers require stricter rules and restrict the countries of a
user to a certain group. However, the user might not be comfortable with
providing that information.

This tiered solution is a compromise on both sides: by verifying a numeric field
not bound to a specific country, the verifiers can ensure the credential is
valid and from a supported country and the user can safely provide that
information without disclosing their own country.

The country tiers are made available in [the following
spreadsheet][country-tiers].

See [selective disclosure](#selective-disclosure) if you require access to the
data to check a specific country.

#### KYC Levels

Similarly to the country tiers, the KYC level is also a numeric field. It
represents the type of KYC in our system. The following types are supported,
followed by their KYC level code:

- `plus+liveness+wallet`: 1
- `plus+liveness+wallet+sow`: 2
- `plus+selfie+wallet`: 3
- `plus+selfie+wallet+sow`: 4
- `plus+liveness+accreditation+wallet`: 5
- `plus+liveness+accreditation+wallet+sow`: 6
- `plus+selfie+accreditation+wallet`: 7
- `plus+selfie+accreditation+wallet+sow`: 8

#### Hash Tree and Root Hash

When a credential is built, a hash tree is generated. This tree is created by
hasing the key-value pair with a random nonce. The nonce ensures us no one can
figure out the data value from the hash.

The hash of all hashes (+ the owner address) is called the root hash. This root
hash acts as a validator that the data hasn't been compromised or tampered with
(if somone altered the data, the root hash would not match the hash tree).

#### Subject Address

Currently, all the accepted Fractal KYC levels require a wallet, which means
that the subject address is automatically infered when building a claim, based
on the schema of the KYCs they are creating the credential for.

#### Issuer Signature

After the credential is generated, it must be signed by Fractal. This is done
internally in the following manner:

```typescript
import { utils as ethersUtils } from "ethers";
import { Credential } from "@trustfractal/sdk";

const credential = Credential.Ethereum.build(properties, kycLevel);

// Generate the hash and sign it
const hashToSign = credential.generateHash();

// The fractal variable is our private signer wallet.
const signature = await fractal.signMessage(ethersUtils.arrayify(hashToSign));

credential.setSignature(signature, issuer.address);
```

The Fractal signature is a classic signature over the Solidity Keccak256 of the
subject address, the KYC type, country of residence, country of ID issuance and
the root hash:

```typescript
// The internal hash generation
public generateHash(): Hash {
  return ethersUtils.solidityKeccak256(
    ["address", "uint8", "uint8", "uint8", "bytes32"],
    [
      this.subjectAddress,
      this.kycType,
      this.countryOfResidence,
      this.countryOfIDIssuance,
      this.rootHash,
    ]
  );
}
```

Once that signature is generated and set in the credential, you can be confident
that the data in there is valid.

#### Supported Blockchains

Currently, supported blockchains are:

1. Ethereum - available via `Cardano.Ethereum`.
2. Cardano - available via `Cardano.Cardano`.
3. Solana - available via `Cardano.Solana`.

The credential has a special numeric field called `blockchain`, specifying which
of the three blockchains the credential refers to.

### Verifying a credential

You can verify if a credential is by calling the `verifyIntegrity` and
`verifySignature` methods.

`verifyIntegrity` runs the verification to ensure the hash tree is intact and
the root hash matches the corresponding hash tree.

`verifySignature` ensures the `issuerSignature` and `issuerAddress` fields are
set, verifying if they match.

#### On-chain verification

The idea behind this type of credentials is that they can be perform on-chain
without accessing any user data.

To do that, we recommend the following:

- Request the user the empty credential (not containing any data) - this can
  be done via Fractal OAuth or by interacting with the [Fractal
  Wallet][fractal-wallet].
- Submit the `kycType`, `countryOfIDIssuance`, `countryOfResidence`, `rootHash`
  and `issuerSignature` fields to a `verify` function.
- In the smart contract: generate the expected signable hash (see [Issuer
  Signature](#issuer-signature)) and verify the signature.

Our recommended implementation is:

```solidity
  function verify(
    uint8 kycType,
    uint8 countryOfIDIssuance,
    uint8 countryOfResidence,
    bytes32 rootHash,
    bytes calldata issuerSignature
  ) external pure returns (bool) {
    bytes32 signable = computeKey(
      sender,
      kycType,
      countryOfIDIssuance,
      countryOfResidence,
      rootHash
    );

    // FRACTAL_SIGNER is a hard-coded address for valid Fractal Signatures
    return verifyWithPrefix(signable, issuerSignature, FRACTAL_SIGNER);
  }

  function computeKey(
    address sender,
    uint8 kycType,
    uint8 countryOfIDIssuance,
    uint8 countryOfResidence,
    bytes32 rootHash
  ) public pure returns (bytes32) {
    return keccak256(
      abi.encodePacked(
        sender,
        kycType,
        countryOfResidence,
        countryOfIDIssuance,
        rootHash
      )
    );
  }

  function verifyWithPrefix(
    bytes32 hash,
    bytes calldata sig,
    address signer
  ) internal pure returns (bool) {
    return _verify(addPrefix(hash), sig, signer);
  }

  function addPrefix(bytes32 hash) private pure returns (bytes32) {
    bytes memory prefix = "\x19Ethereum Signed Message:\n32";

    return keccak256(abi.encodePacked(prefix, hash));
  }

  function _verify(
    bytes32 hash,
    bytes calldata sig,
    address signer
  ) internal pure returns (bool) {
    return recover(hash, sig) == signer;
  }
```

#### Active signing keys

The current active signing keys (`FRACTAL_SIGNER` in the previous example) are:

- **Staging:** `0xa372CA5A906f7FAD480C49bBc73453672d4d375d`
- **Production:** `0xa3015543Ce7da7B9708076C1171E242C36452F10`

### Selective Disclosure

The users can provide access to only specific data:
`credential.removeProperty("myProperty")` will remove that same property from
the `properties` field, meaning the receiver won't have access to it.

Internally, it also removes the nonce from the hash tree: this allows anyone to
use the hash to compute the root hash and validate the integrity of the data
and, consequently, the Fractal signature, without compromising the data:

```typescript
const credential = Credential.Ethereum.build(properties, level);

credential.removeProperty("full_name");

console.log(credential.verifyIntegrity()); // true
```

## Development

### Setup

First, clone & setup the repository:

```sh
git clone git@github.com:trustfractal/sdk.git
cd sdk
yarn install
```

### Testing

To run the tests you can simply do:

```sh
yarn test
```

## License

Wallet is copyright &copy; 2021 Trust Fractal GmbH.

It is open-source, made available for free, and is subject to the terms in its [license].

## About

Fractal Wallet was created and is maintained with :heart: by [Fractal Protocol][fractal].

[npm-shield]: https://img.shields.io/npm/v/@trustfractal/sdk?style=flat-square
[license]: ./LICENSE
[fractal]: https://protocol.fractal.id/
[fractal-wallet]: https://github.com/trustfractal/wallet
[country-tiers]: https://docs.google.com/spreadsheets/d/1Ot9YEpasZ3qVSnoZqQs2iEqgHUyYAAn2Q17d113PQZc/edit?usp=sharing
[did-docs]: https://docs.developer.fractal.id/did-credentials
