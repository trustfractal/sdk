import { Contract, providers, utils as ethersUtils } from "ethers";

import AttestedClaim from "../AttestedClaim";
import ContractData from "./Contract.js";

export default class DIDContract {
  public static ABI = ContractData.abi;

  public static toBuffer(str: string) {
    return ethersUtils.arrayify(str);
  }

  public address: string;
  public contract: Contract;

  public constructor(
    address: string,
    {
      provider,
      providerUrl,
    }: { provider?: providers.Provider; providerUrl?: string }
  ) {

    if (!address) throw new Error(`Invalid address ${address}`);

    if (!provider && !providerUrl)
      throw new Error("Missing either provider or provider URL");

    const rpcProvider =
      provider ||
      (new providers.JsonRpcProvider(providerUrl) as providers.Provider);

    this.address = address;
    this.contract = new Contract(address, DIDContract.ABI, rpcProvider);
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
