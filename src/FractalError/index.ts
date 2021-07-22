export default class FractalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FractalError";
  }

  public static invalidSchema(schema: object): FractalError {
    return new FractalError(`Invalid schema ${JSON.stringify(schema)}`);
  }

  public static invalidProperties(properties: object): FractalError {
    return new FractalError(
      `Invalid properties (did you forget to include the owner address?): ${JSON.stringify(
        properties
      )}`
    );
  }

  public static invalidCredentialGeneration(credential: object): FractalError {
    return new FractalError(
      `Invalid credential generated: ${JSON.stringify(credential)}`
    );
  }

  public static propertyMismatch(
    properties: object,
    schema: object
  ): FractalError {
    return new FractalError(`Properties do not match schema
        Properties: ${JSON.stringify(properties)}
        Schema: ${JSON.stringify(schema)}`);
  }

  public static invalidHashing(term: any) {
    return new FractalError(
      `Invalid term to be hashed: ${JSON.stringify(term)}`
    );
  }

  public static invalidSignature(
    signature: string,
    message: string,
    signer: string
  ) {
    return new FractalError(
      `Invalid signature found.
        Signature: ${signature}
        Message: ${message}
        Signer: ${signer}`
    );
  }

  public static unsupportedCountry(country: string) {
    return new FractalError(`Unsupported Country: ${country}`);
  }

  public static unsupportedKycType(kycType: string) {
    return new FractalError(`Unsupported KYC Type: ${kycType}`);
  }

  public static unsupportedKycLevel(level: string) {
    return new FractalError(`Unsupported KYC level: ${level}`);
  }
}
