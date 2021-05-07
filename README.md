# Fractal DID SDK

![][npm-shield]

This is the SDK for creating, attesting and revoking claims using the [Fractal
Wallet][fractal-wallet].

**Table of Contents**

- [Instalation](#instalation)
- [Setup](#setup)
- [Testing](#testing)
- [Contribution Guidelines](#contribution-guidelines)
- [License](#license)
- [About](#about)

## Instalation

To add the dependency to your project, simply do:

```
yarn add @trustfractal/sdk
```

### Usage

#### Claimer's Perspective

To start the attestation flow, you need to build a claim.

Fractal, by default, supports `basic+liveness`, `plus+liveness` and
`plus+liveness+wallet` claims. Start by building a claim type and then the
corresponding claim by providing your properties:

```js
const claimType = ClaimType.build("basic+liveness");
```

Alternatively, you can also build your own claim type using your own schema:

```js
const schema = ClaimType.buildSchema("my-claim-type", {
  name: { type: "string" },
  age: { type: "number" },
});

const claimType = ClaimType.fromSchema(schema);
```

ClaimType schemas are defined in JSON Schema. You can find the [metaschema
here][code-metaschema].

After creating a claim type, you can now create a claim. For the
`basic+liveness` example:

```js
const properties = {
  residential_address_country: "NZ",
  date_of_birth: "1990-01-01",
  full_name: "JOHN CITIZEN",
  identification_document_country: "NZ",
  identification_document_number: "00000000",
  identification_document_type: "passport",
  liveness: true,
};

const claim = new Claim(claimType, properties);
```

Finally, you need to generate an attestation request.

```js
const attestationRequest = AttestationRequest.fromClaim(claim);
```

This attestation request should now be sent to the attester. We leave it to the
developers the best way to broadcast it but it could be as simple as:

```js
/*
 * Claimer side
 */
const json = JSON.stringify(attestationRequest);

// Encrypt the message through your preferred crypto lib
const encrypted = mycryptolib.encrypt(json);

/*
 * Attester side
 */

const json = JSON.parse(mycryptolib.decrypt(encrypted));

const attestationRequest = new AttestationRequest(json);
```

#### Attester's Perspective

An attestation request needs now to be attested by a trusted entity. The
attestation request generates the hashes necessary for verification by
publishers.

The claim contains a `rootHash` generated from the contents. Attesting a claim
adds the attester signature to the root hash, certifying the validity of the
claim.

Having received an attestation request, the attester should determine its
validity:

```js
const validity = attestationRequest.validate(); // validity is a boolean

if (!validity) return new Error("Invalid attestation request");

const attestedClaim = AttestedClaim.fromRequest(attestationRequest);
```

This regenerates the hashes to ensure the claim hasn't been tempered with.
However, as an attester, **it is always recommended to check if the claim matches
the expected contents**.

After checking the validity of the claim, the attester should now sign the
`rootHash` and include it in the claim:

```js
const attesterSignature = await wallet.signMessage(attestedClaim.rootHash);

attestedClaim.attesterAddress = wallet.address;
attestedClaim.attesterSignature = attesterSignature;
```

There is one final step required to consider the claim as attested: request the
`attestedClaimHash` from the Fractal Claims Registry smart contract and sign it:

```js
const providerUrl = ...; // use an RPC provider like Alchemy

// Use "ropsten" for the testnet.
// Alternatively, you can also instantiate an ethers provider and pass it using
// the `provider` option, instead of `providerUrl`.
const contract = new DIDContract("mainnet", { providerUrl: providerUrl });

const attestedClaimHash = await contract.computeSignableKey(attestedClaim);

// the attestedClaimHash is returned as a string. However, to sign it, you
// should convert it to a buffer using the `DIDContract.toBuffer` function
const buffer = DIDContract.toBuffer(attestedClaimHash);

const attestedClaimSignature = await wallet.signMessage(buffer);

attestedClaim.attestedClaimHash = attestedClaimHash;
attestedClaim.attestedClaimSignature = attestedClaimSignature;
```

Now you can send the `attestedClaim` to the claimer for safe storage.

#### Verifier's Perspective

When a claimer wants to provide data to the verifier, they can choose what
properties to give access to. For example, if the user wants to remove the
`"full_name"` property:

```js
attestedClaim.removeProperty("full_name");
```

The verifier can access the other properties:

```js
attestedClaim.getProperty("date_of_birth");
```

This removes the given property from the claim but the verifications are still
valid. From the verifier's side, to verify a claim contains truthful data and
matches the data on the Fractal Claims Registry smart contract, they should do
the following:

```js
const providerUrl = ...; // use an RPC provider like Alchemy

// Use "ropsten" for the testnet.
// Alternatively, you can also instantiate an ethers provider and pass it using
// the `provider` option, instead of `providerUrl`.
const contract = new DIDContract("mainnet", { providerUrl: providerUrl });

const valid = attestedClaim.verifyIntegrity() && await attestedClaim.verifyNetwork(contract)
```

`verifyIntegrity` checks if the hashes and signatures are properly generated and
signed. `verifyNetwork` requires a `DIDContract` instance to check the presence
and the validity of the `attestedClaimHash` property against the smart contract.

And that's it! You have now generated a claim, attested it and verified it.

## Development

### Setup

First, clone & setup the repository:

```
git clone git@github.com:trustfractal/fractal-sdk.git
cd fractal-sdk
yarn install
```

### Testing

To run the tests you can simply do:

```
yarn test
```

## Contribution Guidelines

Contributions must follow [Subvisual's guides](https://github.com/subvisual/guides).

## License

Wallet is copyright &copy; 2021 Trust Fractal GmbH.

It is open-source, made available for free, and is subject to the terms in its [license].

## About

Fractal Wallet was created and is maintained with :heart: by [Fractal Protocol][fractal].

[npm-shield]: https://img.shields.io/npm/v/@trustfractal/sdk?style=flat-square
[license]: ./LICENSE
[fractal]: https://protocol.fractal.id/
[fractal-wallet]: https://github.com/trustfractal/wallet
[code-metaschema]: https://github.com/trustfractal/sdk/blob/main/src/ClaimType/meta.ts
