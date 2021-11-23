import { SolanaProvider } from "../Crypto";

import Credential from ".";
import Blockchain from "./Blockchain";

import { Properties } from "../types";

const SOLANA_BLOCKCHAIN_CODE = Blockchain.fromName("solana");

const build = (properties: Properties, kycLevel: string) =>
  Credential.build(
    SOLANA_BLOCKCHAIN_CODE,
    SolanaProvider,
    properties,
    kycLevel
  );

export default { build };
