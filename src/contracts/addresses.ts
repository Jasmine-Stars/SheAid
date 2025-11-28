// 🔴 重要：在 Remix 部署合约后，将获得的合约地址填入下方
// Sepolia 测试网合约地址配置

export const CONTRACT_ADDRESSES = {
  // 1. 首先部署 MockToken
  MockToken: "0xA3EC7a8038a9664C14cc6171Da7dA542b6e79d73", // 👈 替换为 MockToken 合约地址
  
  // 2. 然后部署 SheAidRoles（需要传入超级管理员地址，使用你的钱包地址）
  SheAidRoles: "0x0bf0d01b73819424B186f0C8657C351A3B49dc23", // 👈 替换为 SheAidRoles 合约地址
  
  // 3. 部署 PlatformAdmin（构造函数需要: SheAidRoles地址, MockToken地址）
  PlatformAdmin: "0xAF627d2B41c8E719EaF2988fda7313673C1914E7", // 👈 替换为 PlatformAdmin 合约地址
  
  // 4. 部署 NGORegistry（构造函数需要: SheAidRoles地址, MockToken地址）
  NGORegistry: "0x2950605552A9de420deB7Af849Ee39A2210167DF", // 👈 替换为 NGORegistry 合约地址
  
  // 5. 部署 MerchantRegistry（构造函数需要: SheAidRoles地址, MockToken地址）
  MerchantRegistry: "0xE61E8375502839779bD42c8149f2f3e2354c7041", // 👈 替换为 MerchantRegistry 合约地址
  
  // 6. 部署 Marketplace（构造函数需要: SheAidRoles地址, MockToken地址）
  Marketplace: "0x63561c8d02325e6c63514eBe627d718B2c0067be", // 👈 替换为 Marketplace 合约地址
  
  // 7. 部署 BeneficiaryModule（构造函数需要: SheAidRoles地址, PlatformAdmin地址, Marketplace地址）
  BeneficiaryModule: "0xB0ddE3F0b79fe36b97a4a070bd15a0F6f8ff204b", // 👈 替换为 BeneficiaryModule 合约地址
  
  // 8. 最后部署 ProjectVaultManager（构造函数需要: SheAidRoles地址, MockToken地址, BeneficiaryModule地址）
  ProjectVaultManager: "0x97e9D8d190fCCacc1DA7A228A0fbE6Cb1A19A3fc", // 👈 替换为 ProjectVaultManager 合约地址
};

// Sepolia 测试网配置
export const NETWORK_CONFIG = {
  chainId: 11155111, // Sepolia Chain ID
  chainName: "Sepolia Testnet",
  rpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY", // 或使用公共 RPC
  blockExplorer: "https://sepolia.etherscan.io",
};
