import "jasmine";

import Schema from "../../../src/Schema/";
import Validator from "../../../src/Schema/Validator";

describe("validate", () => {
  it("errors for invalid schemas", () => {
    const schema = Schema.build("basic");

    const properties = {
      place_of_birth: "New Zealand",
      residential_address_country: "NZ",
      residential_address: "Fake St.",
      date_of_birth: "1990-01-01",
      full_name: "JOHN CITIZEN",
      identification_document_country: "NZ",
      identification_document_number: "00000000",
      identification_document_type: "passport",
    };

    // @ts-ignore
    delete schema["properties"];

    const fn = () => Validator.validate(schema, properties);

    expect(fn).toThrowError(Error, /Invalid schema/);
  });

  it("errors for properties not matching the schema", () => {
    const schema = Schema.build("basic");

    const properties = {
      place_of_birth: "New Zealand",
      residential_address_country: "NZ",
      residential_address: "Fake St.",
      date_of_birth: "1990-01-01",
      full_name: "JOHN CITIZEN",
      identification_document_country: "NZ",
      identification_document_number: 0,
      identification_document_type: "passport",
    };

    const fn = () => Validator.validate(schema, properties);

    expect(fn).toThrowError(Error, /Properties do not match/);
  });

  it("is true for valid properties and schemas", () => {
    const schema = Schema.build("basic");

    const properties = {
      place_of_birth: "New Zealand",
      residential_address_country: "NZ",
      residential_address: "Fake St.",
      date_of_birth: "1990-01-01",
      full_name: "JOHN CITIZEN",
      identification_document_country: "NZ",
      identification_document_number: "00000000",
      identification_document_type: "passport",
    };

    const result = Validator.validate(schema, properties);

    expect(result).toBeTrue();
  });
});
