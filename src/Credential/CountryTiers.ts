import { CountryTier } from "../types";
import FractalError from "../FractalError";

const TierList: Record<string, number> = {
  AT: 1,
  BE: 1,
  CH: 1,
  CZ: 1,
  DE: 1,
  DK: 1,
  ES: 1,
  FI: 1,
  FR: 1,
  GR: 1,
  HR: 1,
  IE: 1,
  IT: 1,
  JP: 1,
  LU: 1,
  MC: 1,
  NO: 1,
  PT: 1,
  SE: 1,
  NL: 1,
  PL: 2,
  RO: 2,
  RS: 2,
  SI: 2,
  SK: 2,
  TR: 2,
  AG: 2,
  AR: 2,
  BR: 2,
  MX: 2,
  AU: 2,
  HU: 2,
  AZ: 2,
  BG: 2,
  EE: 2,
  IS: 2,
  LI: 2,
  LT: 2,
  MD: 2,
  NF: 2,
  NC: 2,
  NZ: 2,
  RE: 2,
  SJ: 2,
  SX: 2,
  TF: 2,
  WF: 2,
  YT: 2,
  GB: 2,
  SG: 2,
  AM: 2,
  AD: 3,
  CA: 3,
  CY: 3,
  LV: 3,
  RU: 3,
  KR: 3,
  UY: 3,
  VN: 3,
  ZA: 3,
  TH: 3,
  SM: 3,
  SV: 3,
  VA: 3,
  IN: 3,
  AX: 3,
  BA: 3,
  BD: 3,
  CL: 3,
  CO: 3,
  CR: 3,
  CX: 3,
  EG: 3,
  EC: 3,
  GE: 3,
  GI: 3,
  GL: 3,
  GP: 3,
  GS: 3,
  HN: 3,
  ID: 3,
  IM: 3,
  IO: 3,
  JE: 3,
  LB: 3,
  MK: 3,
  MS: 3,
  MY: 3,
  NG: 3,
  PE: 3,
  PY: 3,
  PF: 3,
  PN: 3,
  TC: 3,
  BQ: 3,
  BV: 3,
  LC: 3,
  SH: 3,
  UA: 4,
  AE: 4,
  HK: 4,
  TW: 4,
  AO: 4,
  BH: 4,
  BY: 4,
  BZ: 4,
  CC: 4,
  DZ: 4,
  GF: 4,
  GT: 4,
  GY: 4,
  IL: 4,
  KG: 4,
  KZ: 4,
  ME: 4,
  MO: 4,
  QA: 4,
  UZ: 4,
  XK: 4,
  CU: 5,
  ET: 5,
  LY: 5,
  LK: 5,
  TN: 5,
  VG: 5,
  AI: 5,
  AQ: 5,
  AW: 5,
  BI: 5,
  BJ: 5,
  BL: 5,
  BN: 5,
  BO: 5,
  BT: 5,
  CD: 5,
  CF: 5,
  CG: 5,
  CI: 5,
  CK: 5,
  CM: 5,
  CV: 5,
  CW: 5,
  DJ: 5,
  DM: 5,
  DO: 5,
  EH: 5,
  ER: 5,
  FJ: 5,
  FK: 5,
  FM: 5,
  FO: 5,
  GA: 5,
  GD: 5,
  GG: 5,
  GM: 5,
  GN: 5,
  GQ: 5,
  GW: 5,
  HM: 5,
  JO: 5,
  KE: 5,
  KI: 5,
  KM: 5,
  KN: 5,
  KW: 5,
  LA: 5,
  LR: 5,
  LS: 5,
  MF: 5,
  MG: 5,
  MH: 5,
  ML: 5,
  MN: 5,
  MP: 5,
  MQ: 5,
  MR: 5,
  MV: 5,
  MW: 5,
  NA: 5,
  MZ: 5,
  NE: 5,
  NP: 5,
  NR: 5,
  NU: 5,
  OM: 5,
  PG: 5,
  PM: 5,
  PS: 5,
  PW: 5,
  RW: 5,
  SA: 5,
  SB: 5,
  SC: 5,
  SD: 5,
  SL: 5,
  SO: 5,
  SR: 5,
  ST: 5,
  SZ: 5,
  TD: 5,
  TG: 5,
  TK: 5,
  TL: 5,
  TJ: 5,
  TM: 5,
  TO: 5,
  TV: 5,
  TZ: 5,
  VC: 5,
  WS: 5,
  ZM: 5,
  VE: 5,
  AL: 6,
  BB: 6,
  BW: 6,
  BF: 6,
  KH: 6,
  KP: 6,
  KY: 6,
  HT: 6,
  IR: 6,
  JM: 6,
  MT: 6,
  MU: 6,
  MA: 6,
  MM: 6,
  NI: 6,
  PK: 6,
  PA: 6,
  PH: 6,
  SN: 6,
  SS: 6,
  SY: 6,
  UG: 6,
  YE: 6,
  ZW: 6,
  AF: 6,
  BS: 6,
  GH: 6,
  IQ: 6,
  TT: 6,
  VU: 6,
  US: 7,
  CN: 7,
  BM: 7,
  PR: 7,
  GU: 7,
  UM: 7,
  VI: 7,
  AS: 7,
};

const ToTier = (country: string): CountryTier => {
  const tier = TierList[country];

  if (!tier) throw FractalError.unsupportedCountry(country);

  return tier as CountryTier;
};

export default {
  ToTier,
};