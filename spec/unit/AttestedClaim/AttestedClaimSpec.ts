import "jasmine";

import AttestedClaim from "../../../src/AttestedClaim";

describe("removeProperty", () => {
  it("deletes the property and the corresponding nonce", () => {
    const claimerAddress = "0x0";
    const claimTypeHash = { hash: "0x123", nonce: "0x0" };

    const claimHashTree = {
      age: { hash: "0x1", nonce: "0x2" },
      name: { hash: "0x3", nonce: "0x4" },
    };

    const claim = {
      claimTypeHash: claimTypeHash.hash,
      owner: claimerAddress,
      properties: { age: 20, name: "Foo" },
    };

    const attestedClaim = new AttestedClaim({
      rootHash: "0x0",
      attesterAddress: null,
      attesterSignature: null,
      attestedClaimHash: null,
      attestedClaimSignature: null,
      claimerSignature: "0x0",
      claimerAddress,
      claimTypeHash,
      claimHashTree,
      claim,
    });

    attestedClaim.removeProperty("age");

    expect(attestedClaim.claim.properties).toEqual({ name: "Foo" });
    expect(attestedClaim.claimHashTree).toEqual({
      name: { hash: "0x3", nonce: "0x4" },
      age: { hash: "0x1" },
    });
  });
});
