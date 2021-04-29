import "jasmine";

import ClaimType from "../../../src/ClaimType";

describe(".fromSchema", () => {
  it("generates a hash", () => {
    const schema = ClaimType.buildSchema("ID Card", {
      first_name: {
        type: "string",
      },
      last_name: {
        type: "string",
      },
    });

    const claimType = ClaimType.fromSchema(schema, "0x0");

    expect(claimType.hash).toBeDefined();
  });

  it("generates an id for the schema", () => {
    const schema = ClaimType.buildSchema("ID Card", {
      first_name: {
        type: "string",
      },
      last_name: {
        type: "string",
      },
    });

    const { schema: claimSchema } = ClaimType.fromSchema(schema, "0x0");

    expect(claimSchema.$id).toBeDefined();
  });
});

describe(".build", () => {
  it("builds a pre-defined claim type", () => {
    const {
      schema: { title, properties },
    } = ClaimType.build("basic");

    expect(title).toEqual("basic");
    expect(properties).toEqual(ClaimType.BasicSchema);
  });

  it("allows composable claim types", () => {
    const {
      schema: { title, properties },
    } = ClaimType.build("basic+liveness");

    expect(title).toEqual("basic+liveness");
    expect(properties).toEqual({
      ...ClaimType.BasicSchema,
      ...ClaimType.LivenessSchema,
    });
  });

  it("composes claim types regardless of the order", () => {
    const {
      schema: { title: title1, properties: properties1 },
    } = ClaimType.build("basic+liveness");

    const {
      schema: { title: title2, properties: properties2 },
    } = ClaimType.build("liveness+basic");

    expect(title1).toEqual(title2);
    expect(properties1).toEqual(properties2);
  });
});
