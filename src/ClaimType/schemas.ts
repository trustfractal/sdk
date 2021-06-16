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
  wallet_currency: { type: "string" },
};

export const CountryOfIDIssuanceKey = "identification_document_country";
export const CountryOfResidenceKey = "residential_address_country";
