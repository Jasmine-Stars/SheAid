import React, { useMemo } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "./useWeb3";
import { CONTRACT_ADDRESSES } from "@/contracts/addresses";

// 导入合约 ABI
import MockTokenABI from "@/contracts/abis/MockToken.json";
import ProjectVaultManagerABI from "@/contracts/abis/ProjectVaultManager.json";

export const useContracts = () => {
  const { signer, provider } = useWeb3();

  // 创建合约实例的辅助函数
  const createContract = (address: string, abi: any) => {
    if (!address || address === "0x...") {
      console.warn("合约地址未配置");
      return null;
    }
    
    try {
      return new ethers.Contract(
        address,
        abi,
        signer || provider
      );
    } catch (error) {
      console.error("创建合约实例失败:", error);
      return null;
    }
  };

  const contracts = useMemo(() => {
    return {
      mockToken: createContract(CONTRACT_ADDRESSES.MockToken, MockTokenABI),
      sheAidRoles: null,
      platformAdmin: null,
      ngoRegistry: null,
      merchantRegistry: null,
      marketplace: null,
      beneficiaryModule: null,
      projectVaultManager: createContract(CONTRACT_ADDRESSES.ProjectVaultManager, ProjectVaultManagerABI),
    };
  }, [signer, provider]);

  return contracts;
};
