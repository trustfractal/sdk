import { KycType } from "../types";

import FractalError from "../FractalError";

const sortKYCType = (type: string): string => type.split("+").sort().join("+");

/* Only append items to this array is possible, the order is important */
const SupportedKYCs = [
  "plus+liveness+wallet",
  "plus+liveness+wallet+sow",
  "plus+selfie+wallet",
  "plus+selfie+wallet+sow",
  "plus+liveness+accreditation+wallet",
  "plus+liveness+accreditation+wallet+sow",
  "plus+selfie+accreditation+wallet",
  "plus+selfie+accreditation+wallet+sow",
  "plus+liveness+wallet-eth",
  "plus+liveness+wallet-eth+sow",
  "plus+selfie+wallet-eth",
  "plus+selfie+wallet-eth+sow",
  "plus+liveness+accreditation+wallet-eth",
  "plus+liveness+accreditation+wallet-eth+sow",
  "plus+selfie+accreditation+wallet-eth",
  "plus+selfie+accreditation+wallet-eth+sow",
].map(sortKYCType);

const fromLevel = (level: string): KycType => {
  const index = SupportedKYCs.indexOf(sortKYCType(level));

  if (index < 0) throw FractalError.unsupportedKycType(level);

  return (index + 1) as KycType;
};

const isSupported = (level: string): boolean => {
  const index = SupportedKYCs.indexOf(sortKYCType(level));

  return index >= 0;
};

export default {
  fromLevel,
  isSupported,
};
