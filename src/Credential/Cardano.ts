import { CardanoProvider } from "../Crypto";

import Credential from ".";
import Blockchain from "./Blockchain";

import { Properties } from "../types";

const CARDANO_BLOCKCHAIN_CODE = Blockchain.fromName("cardano");

const build = (properties: Properties, kycLevel: string) =>
  Credential.build(
    CARDANO_BLOCKCHAIN_CODE,
    CardanoProvider,
    properties,
    kycLevel
  );

export default { build };
