import { useMemo } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "./useWeb3";
import { CONTRACT_ADDRESSES } from "@/contracts/addresses";

// 🔴 重要：部署合约后，需要将 ABI 文件放到 src/contracts/abis/ 目录
// 然后在这里导入 ABI
// 示例：
// import MockTokenABI from "@/contracts/abis/MockToken.json";
// import SheAidRolesABI from "@/contracts/abis/SheAidRoles.json";
// ... 其他合约 ABI

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
    // 🔴 TODO: 导入 ABI 后取消注释以下代码
    
    // return {
    //   mockToken: createContract(CONTRACT_ADDRESSES.MockToken, MockTokenABI),
    //   sheAidRoles: createContract(CONTRACT_ADDRESSES.SheAidRoles, SheAidRolesABI),
    //   platformAdmin: createContract(CONTRACT_ADDRESSES.PlatformAdmin, PlatformAdminABI),
    //   ngoRegistry: createContract(CONTRACT_ADDRESSES.NGORegistry, NGORegistryABI),
    //   merchantRegistry: createContract(CONTRACT_ADDRESSES.MerchantRegistry, MerchantRegistryABI),
    //   marketplace: createContract(CONTRACT_ADDRESSES.Marketplace, MarketplaceABI),
    //   beneficiaryModule: createContract(CONTRACT_ADDRESSES.BeneficiaryModule, BeneficiaryModuleABI),
    //   projectVaultManager: createContract(CONTRACT_ADDRESSES.ProjectVaultManager, ProjectVaultManagerABI),
    // };

    // 临时返回空对象，等待 ABI 配置
    return {
      mockToken: null,
      sheAidRoles: null,
      platformAdmin: null,
      ngoRegistry: null,
      merchantRegistry: null,
      marketplace: null,
      beneficiaryModule: null,
      projectVaultManager: null,
    };
  }, [signer, provider]);

  return contracts;
};
