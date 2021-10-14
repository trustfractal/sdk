import { Blockchain } from "../types";
import FractalError from "../FractalError";

const BlockchainList: Record<string, number> = {
  ethereum: 1,
  cardano: 2,
};

const fromName = (name: string): Blockchain => {
  const blockchain = BlockchainList[name];

  if (!blockchain) throw FractalError.unsupportedBlockchain(name);

  return blockchain as Blockchain;
};

export default {
  fromName,
};
