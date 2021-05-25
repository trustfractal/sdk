import { Contract, providers, utils as ethersUtils } from "ethers";

import AttestedClaim from "../AttestedClaim";
import ContractData from "./Contract.js";

enum Networks {
  ROPSTEN = "ropsten",
  MAINNET = "mainnet",
}

export default class DIDContract {
  public static ABI = ContractData.abi;

  public static CONTRACT_ADDRESSES: Record<string, string> = {
    [Networks.ROPSTEN]: "0x3FDC8245C0D167Ff3d8369615975cA2D8b391732",
    [Networks.MAINNET]: "0x1A5FA65E50d503a29Ec57cD102f2e7970a6963BB",
  };

  public static toBuffer(str: string) {
    return ethersUtils.arrayify(str);
  }

  public address: string;
  public contract: Contract;

  public constructor(
    { address, network }: { address?: string; network?: Networks },
    {
      provider,
      providerUrl,
    }: { provider?: providers.Provider; providerUrl?: string }
  ) {
    if (!address && !network)
      throw new Error("Missing either address or network");

    const contractAddress = address ?? DIDContract.CONTRACT_ADDRESSES[network!];

    if (!contractAddress) throw new Error(`Invalid network ${network}`);

    if (!provider && !providerUrl)
      throw new Error("Missing either provider or provider URL");

    const rpcProvider =
      provider ??
      (new providers.JsonRpcProvider(providerUrl) as providers.Provider);

    this.address = contractAddress;
    this.contract = new Contract(contractAddress, DIDContract.ABI, rpcProvider);
  }

  public computeSignableKey({ claimerAddress, rootHash }: AttestedClaim) {
    return this.contract.computeSignableKey(claimerAddress, rootHash);
  }

  public verifyClaim({
    claimerAddress,
    attesterAddress,
    attestedClaimSignature,
  }: AttestedClaim) {
    return this.contract.verifyClaim(
      claimerAddress,
      attesterAddress,
      attestedClaimSignature
    );
  }

  public setClaimWithSignature({
    claimerAddress,
    attesterAddress,
    rootHash,
    attestedClaimSignature,
  }: AttestedClaim) {
    const rootHashArray = DIDContract.toBuffer(rootHash);

    return this.contract.setClaimWithSignature(
      claimerAddress,
      attesterAddress,
      rootHashArray,
      attestedClaimSignature
    );
  }
}
