import { EthereumProvider } from "../Crypto";

import Credential from ".";
import Blockchain from "./Blockchain";

import { Properties } from "../types";

const ETHEREUM_BLOCKCHAIN_CODE = Blockchain.fromName("ethereum");

const build = (properties: Properties, kycLevel: string) =>
  Credential.build(
    ETHEREUM_BLOCKCHAIN_CODE,
    EthereumProvider,
    properties,
    kycLevel
  );

export default { build };
