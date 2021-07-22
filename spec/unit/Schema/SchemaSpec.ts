import "jasmine";

import Schema from "../../../src/Schema";

describe(".build", () => {
  it("builds a pre-defined schema", () => {
    const { properties } = Schema.build("plus");

    expect(Object.keys(properties)).toEqual(
      Object.keys(Schema.PlusSchema.properties)
    );
  });

  it("allows composable schemas", () => {
    const { properties, required } = Schema.build("basic+liveness");

    const {
      properties: basicProperties,
      required: basicRequired,
    } = Schema.BasicSchema;

    const {
      properties: livenessProperties,
      required: livenessRequired,
    } = Schema.LivenessSchema;

    expect(properties).toEqual({
      ...basicProperties,
      ...livenessProperties,
    });

    expect(required).toEqual([...basicRequired, ...livenessRequired]);
  });

  it("composes schemas regardless of the order", () => {
    const { properties: properties1 } = Schema.build("basic+liveness");
    const { properties: properties2 } = Schema.build("liveness+basic");

    expect(properties1).toEqual(properties2);
  });

  it("errors if the KYC level is unsupported", () => {
    const fn = () => Schema.build("fake-level");

    expect(fn).toThrowError(Error, /Unsupported KYC level/);
  });
});
