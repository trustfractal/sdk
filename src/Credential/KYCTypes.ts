import { KycType } from "../types";

import FractalError from "../FractalError";

const sortKYCType = (type: string): string => type.split("+").sort().join("+");

const SupportedKYCs = [
  "plus+liveness+wallet",
  "plus+liveness+wallet+sow",
  "plus+selfie+wallet",
  "plus+selfie+wallet+sow",
  "plus+liveness+accreditation+wallet",
  "plus+liveness+accreditation+wallet+sow",
  "plus+selfie+accreditation+wallet",
  "plus+selfie+accreditation+wallet+sow",
].map(sortKYCType);

const fromLevel = (level: string): KycType => {
  const index = SupportedKYCs.indexOf(sortKYCType(level));

  if (index < 0) throw FractalError.unsupportedKycType(level);

  return (index + 1) as KycType;
};

export default {
  fromLevel,
};
