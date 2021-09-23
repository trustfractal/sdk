import "jasmine";

import KYCTypes from "../../../src/Credential/KYCTypes";

describe("fromLevel", () => {
  it("returns the expected KYC type", () => {
    const type1 = KYCTypes.fromLevel("plus+liveness+wallet");
    const type2 = KYCTypes.fromLevel("plus+selfie+wallet");

    expect(type1).toEqual(1);
    expect(type2).toEqual(3);
  });

  it("ignores the KYC Type order", () => {
    const type1 = KYCTypes.fromLevel("plus+liveness+wallet");
    const type2 = KYCTypes.fromLevel("wallet+plus+liveness");

    expect(type1).toEqual(type2);
  });

  it("errors when the KYC level is unsupported", () => {
    const fn = () => KYCTypes.fromLevel("fake+level");

    expect(fn).toThrowError(/Unsupported KYC Type/);
  });
});

describe("isSupported", () => {
  it("is true for supported levels", () => {
    const isSupported = KYCTypes.isSupported("plus+liveness+wallet");

    expect(isSupported).toBeTrue();
  });

  it("ignores level ordering", () => {
    const isSupported = KYCTypes.isSupported("wallet+liveness+plus");

    expect(isSupported).toBeTrue();
  });

  it("is false for unsupported types", () => {
    const isSupported = KYCTypes.isSupported("not+supported");

    expect(isSupported).toBeFalse();
  });
});
