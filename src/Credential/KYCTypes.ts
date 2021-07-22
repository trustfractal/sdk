import { KycType } from "../types";

import FractalError from "../FractalError";

const SupportedKYCs = [
  "plus+liveness+wallet",
  "plus+liveness+wallet+sow",
  "plus+selfie+wallet",
  "plus+selfie+wallet+sow",
  "plus+liveness+accreditation+wallet",
  "plus+liveness+accreditation+wallet+sow",
  "plus+selfie+accreditation+wallet",
  "plus+selfie+accreditation+wallet+sow",
];

const fromLevel = (type: string): KycType => {
  const index = SupportedKYCs.indexOf(type);

  if (index < 0) throw FractalError.unsupportedKycType(type);

  return (index + 1) as KycType;
};

export default {
  fromLevel,
};
