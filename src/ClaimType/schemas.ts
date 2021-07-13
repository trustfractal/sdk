export const LivenessSchema = {
  liveness: { type: "boolean" },
};

export const BasicSchema = {
  residential_address_country: { type: "string" },
  date_of_birth: { type: "string" },
  full_name: { type: "string" },
  identification_document_country: { type: "string" },
  identification_document_number: { type: "string" },
  identification_document_type: { type: "string" },
};

export const PlusSchema = {
  place_of_birth: { type: ["string", "null"] },
  residential_address: { type: "string" },
  residential_address_country: { type: "string" },
  date_of_birth: { type: "string" },
  full_name: { type: "string" },
  identification_document_country: { type: "string" },
  identification_document_number: { type: "string" },
  identification_document_type: { type: "string" },
};

export const WalletSchema = {
  wallet_address: { type: "string" },
  wallet_currency: { type: "string" },
};

// The selfie KYC doesn't really add any new fields,
// just a proof file which we don't care about.
// However, for now we should include it in the schemas
// to be merged, since that is a supported KYC type.
export const SelfieSchema = {};

export const SoWSchema = {
  sow_estimated_net_worth_currency: { type: "string" },
  sow_estimated_net_worth_value: { type: "string" },
  sow_type: { type: "string" },
};

export const AccreditationSchema = {
  accredited_investor: { type: ["boolean", "null"] },
};

export const CountryOfIDIssuanceKey = "identification_document_country";
export const CountryOfResidenceKey = "residential_address_country";
