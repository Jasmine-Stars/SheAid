import { ethers } from "ethers";
import { toast } from "sonner";

/**
 * 处理合约交易的通用函数
 */
export const executeTransaction = async (
  contractMethod: () => Promise<ethers.ContractTransaction>,
  successMessage: string = "交易成功",
  errorMessage: string = "交易失败"
) => {
  try {
    const tx = await contractMethod();
    toast.info("交易已提交，等待确认...");
    
    const receipt = await tx.wait();
    toast.success(successMessage);
    
    return { success: true, receipt };
  } catch (error: any) {
    console.error("交易失败:", error);
    
    let message = errorMessage;
    if (error.reason) {
      message += `: ${error.reason}`;
    } else if (error.message) {
      message += `: ${error.message}`;
    }
    
    toast.error(message);
    return { success: false, error };
  }
};

/**
 * 格式化以太坊地址（显示前6位和后4位）
 */
export const formatAddress = (address: string) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * 将代币数量转换为 Wei（最小单位）
 */
export const toWei = (amount: string | number, decimals: number = 18) => {
  return ethers.utils.parseUnits(amount.toString(), decimals);
};

/**
 * 将 Wei 转换为代币数量
 */
export const fromWei = (amount: ethers.BigNumber, decimals: number = 18) => {
  return ethers.utils.formatUnits(amount, decimals);
};

/**
 * 检查是否是有效的以太坊地址
 */
export const isValidAddress = (address: string) => {
  return ethers.utils.isAddress(address);
};

/**
 * 获取交易浏览器链接
 */
export const getExplorerLink = (txHash: string, type: "tx" | "address" = "tx") => {
  const baseUrl = "https://sepolia.etherscan.io";
  return type === "tx" ? `${baseUrl}/tx/${txHash}` : `${baseUrl}/address/${txHash}`;
};
