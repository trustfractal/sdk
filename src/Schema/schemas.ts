export const LivenessSchema = {
  properties: {
    liveness: { type: "boolean" },
  },
  required: ["liveness"],
};

export const BasicSchema = {
  properties: {
    residential_address_country: { type: "string" },
    date_of_birth: { type: "string" },
    full_name: { type: "string" },
    identification_document_country: { type: "string" },
    identification_document_number: { type: "string" },
    identification_document_type: { type: "string" },
  },
  required: [
    "residential_address_country",
    "date_of_birth",
    "full_name",
    "identification_document_type",
    "identification_document_number",
    "identification_document_type",
  ],
};

export const PlusSchema = {
  properties: {
    place_of_birth: { type: ["string", "null"] },
    residential_address: { type: "string" },
    residential_address_country: { type: "string" },
    date_of_birth: { type: "string" },
    full_name: { type: "string" },
    identification_document_country: { type: "string" },
    identification_document_number: { type: "string" },
    identification_document_type: { type: "string" },
  },
  required: [
    "residential_address",
    "residential_address_country",
    "date_of_birth",
    "full_name",
    "identification_document_type",
    "identification_document_number",
    "identification_document_country",
  ],
};

export const WalletSchema = {
  properties: {
    wallet_address: { type: "string" },
    wallet_currency: { type: "string" },
  },
  required: ["wallet_currency", "wallet_address"],
};

// The selfie KYC doesn't really add any new fields,
// just a proof file which we don't care about.
// However, for now we should include it in the schemas
// to be merged, since that is a supported KYC type.
export const SelfieSchema = { properties: {} };

export const SoWSchema = {
  properties: {
    sow_estimated_net_worth_currency: { type: "string" },
    sow_estimated_net_worth_value: { type: "string" },
    sow_type: { type: "string" },
  },
  required: [
    "sow_type",
    "sow_estimated_net_worth_value",
    "sow_estimated_net_worth_currency",
  ],
};

export const AccreditationSchema = {
  properties: {
    accredited_investor: { type: ["boolean", "null"] },
  },
};

export const CountryOfIDIssuanceKey = "identification_document_country";
export const CountryOfResidenceKey = "residential_address_country";
export const WalletAddressKey = "wallet_address";
