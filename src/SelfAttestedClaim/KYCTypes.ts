import { Byte } from "../types/Byte";

import FractalError from "../FractalError";

const TypesList = [
  "plus+liveness+wallet",
  "plus+liveness+wallet+sow",
  "plus+selfie+wallet",
  "plus+selfie+wallet+sow",
  "light+selfie+wallet",
  "light+selfie+wallet+sow",
  "plus+liveness+accreditation+wallet",
  "plus+liveness+accreditation+wallet+sow",
  "plus+selfie+accreditation+wallet",
  "plus+selfie+accreditation+wallet+sow",
  "light+selfie+accreditation+wallet",
];

const ToByte = (type: string): Byte => {
  const index = TypesList.indexOf(type);

  if (index < 0) throw FractalError.unsupportedKycType(type);

  return new Byte(index + 1);
};

export default {
  ToByte,
};
