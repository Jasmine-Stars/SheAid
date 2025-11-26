// 🔴 重要：在 Remix 部署合约后，将获得的合约地址填入下方
// Sepolia 测试网合约地址配置

export const CONTRACT_ADDRESSES = {
  // 1. 首先部署 MockToken
  MockToken: "0x...", // 👈 替换为 MockToken 合约地址
  
  // 2. 然后部署 SheAidRoles（需要传入超级管理员地址，使用你的钱包地址）
  SheAidRoles: "0x...", // 👈 替换为 SheAidRoles 合约地址
  
  // 3. 部署 PlatformAdmin（构造函数需要: SheAidRoles地址, MockToken地址）
  PlatformAdmin: "0x...", // 👈 替换为 PlatformAdmin 合约地址
  
  // 4. 部署 NGORegistry（构造函数需要: SheAidRoles地址, MockToken地址）
  NGORegistry: "0x...", // 👈 替换为 NGORegistry 合约地址
  
  // 5. 部署 MerchantRegistry（构造函数需要: SheAidRoles地址, MockToken地址）
  MerchantRegistry: "0x...", // 👈 替换为 MerchantRegistry 合约地址
  
  // 6. 部署 Marketplace（构造函数需要: SheAidRoles地址, MockToken地址）
  Marketplace: "0x...", // 👈 替换为 Marketplace 合约地址
  
  // 7. 部署 BeneficiaryModule（构造函数需要: SheAidRoles地址, PlatformAdmin地址, Marketplace地址）
  BeneficiaryModule: "0x...", // 👈 替换为 BeneficiaryModule 合约地址
  
  // 8. 最后部署 ProjectVaultManager（构造函数需要: SheAidRoles地址, MockToken地址, BeneficiaryModule地址）
  ProjectVaultManager: "0x...", // 👈 替换为 ProjectVaultManager 合约地址
};

// Sepolia 测试网配置
export const NETWORK_CONFIG = {
  chainId: 11155111, // Sepolia Chain ID
  chainName: "Sepolia Testnet",
  rpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY", // 或使用公共 RPC
  blockExplorer: "https://sepolia.etherscan.io",
};
