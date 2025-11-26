# 🚀 合约部署与前端集成指南（初学者版）

## 📌 快速开始

### 第一步：在 Remix 部署合约

1. **打开 Remix**：https://remix.ethereum.org
2. **复制合约文件**：将 8 个 `.sol` 文件复制到 Remix
3. **编译合约**：选择编译器版本 `0.8.20`，点击编译
4. **连接钱包**：确保 MetaMask 已连接到 Sepolia 测试网

### 第二步：按顺序部署（非常重要！）

请严格按照以下顺序部署，记录每个合约地址：

#### 1️⃣ MockToken
- 构造参数：`1000000000000000000000000`
- 📝 记录地址 → 

#### 2️⃣ SheAidRoles  
- 构造参数：`[你的钱包地址]`
- 📝 记录地址 →

#### 3️⃣ PlatformAdmin
- 构造参数：`[SheAidRoles地址], [MockToken地址]`
- 📝 记录地址 →

#### 4️⃣ NGORegistry
- 构造参数：`[SheAidRoles地址], [MockToken地址]`
- 📝 记录地址 →

#### 5️⃣ MerchantRegistry
- 构造参数：`[SheAidRoles地址], [MockToken地址]`
- 📝 记录地址 →

#### 6️⃣ Marketplace
- 构造参数：`[SheAidRoles地址], [MockToken地址]`
- 📝 记录地址 →

#### 7️⃣ BeneficiaryModule
- 构造参数：`[SheAidRoles地址], [PlatformAdmin地址], [Marketplace地址]`
- 📝 记录地址 →

#### 8️⃣ ProjectVaultManager
- 构造参数：`[SheAidRoles地址], [MockToken地址], [BeneficiaryModule地址]`
- 📝 记录地址 →

---

### 第三步：配置合约关系

在 Remix 的 "Deployed Contracts" 区域执行：

1. **Marketplace 合约**，调用 `setBeneficiaryModule([BeneficiaryModule地址])`
2. **BeneficiaryModule 合约**，调用 `setProjectVaultManager([ProjectVaultManager地址])`

---

### 第四步：填入前端配置

#### 🔴 填入合约地址
打开 `src/contracts/addresses.ts`，将所有合约地址替换 `0x...`

#### 🔴 复制合约 ABI
对于每个合约：
1. Remix 左侧 → "Solidity Compiler"
2. 点击 "Compilation Details"
3. 找到 "ABI" 部分，点击复制
4. 创建文件 `src/contracts/abis/[合约名].json`
5. 粘贴 ABI 内容

需要创建的 ABI 文件：
- `src/contracts/abis/MockToken.json`
- `src/contracts/abis/SheAidRoles.json`
- `src/contracts/abis/PlatformAdmin.json`
- `src/contracts/abis/NGORegistry.json`
- `src/contracts/abis/MerchantRegistry.json`
- `src/contracts/abis/Marketplace.json`
- `src/contracts/abis/BeneficiaryModule.json`
- `src/contracts/abis/ProjectVaultManager.json`

#### 🔴 更新 useContracts.tsx
打开 `src/hooks/useContracts.tsx`：

1. 在文件顶部添加 ABI 导入：
```typescript
import MockTokenABI from "@/contracts/abis/MockToken.json";
import SheAidRolesABI from "@/contracts/abis/SheAidRoles.json";
import PlatformAdminABI from "@/contracts/abis/PlatformAdmin.json";
import NGORegistryABI from "@/contracts/abis/NGORegistry.json";
import MerchantRegistryABI from "@/contracts/abis/MerchantRegistry.json";
import MarketplaceABI from "@/contracts/abis/Marketplace.json";
import BeneficiaryModuleABI from "@/contracts/abis/BeneficiaryModule.json";
import ProjectVaultManagerABI from "@/contracts/abis/ProjectVaultManager.json";
```

2. 找到 `contracts` 对象，取消注释并替换：
```typescript
return {
  mockToken: createContract(CONTRACT_ADDRESSES.MockToken, MockTokenABI),
  sheAidRoles: createContract(CONTRACT_ADDRESSES.SheAidRoles, SheAidRolesABI),
  platformAdmin: createContract(CONTRACT_ADDRESSES.PlatformAdmin, PlatformAdminABI),
  ngoRegistry: createContract(CONTRACT_ADDRESSES.NGORegistry, NGORegistryABI),
  merchantRegistry: createContract(CONTRACT_ADDRESSES.MerchantRegistry, MerchantRegistryABI),
  marketplace: createContract(CONTRACT_ADDRESSES.Marketplace, MarketplaceABI),
  beneficiaryModule: createContract(CONTRACT_ADDRESSES.BeneficiaryModule, BeneficiaryModuleABI),
  projectVaultManager: createContract(CONTRACT_ADDRESSES.ProjectVaultManager, ProjectVaultManagerABI),
};
```

---

## ✅ 完成检查

- [ ] 8 个合约已部署完成
- [ ] 所有地址已填入 `src/contracts/addresses.ts`
- [ ] 已调用 `Marketplace.setBeneficiaryModule()`
- [ ] 已调用 `BeneficiaryModule.setProjectVaultManager()`
- [ ] 8 个 ABI 文件已创建在 `src/contracts/abis/`
- [ ] `src/hooks/useContracts.tsx` 已更新

完成后，前端就能与智能合约交互了！🎉

---

## 🆘 常见问题

**Q: 部署时提示 gas 不足？**  
A: 到 https://sepoliafaucet.com/ 获取测试 ETH

**Q: 找不到 ABI 在哪里？**  
A: Remix 左侧 "Solidity Compiler" → "Compilation Details" → 找到 "ABI" 部分

**Q: 如何在前端使用合约？**  
A: 使用 `useWeb3()` 和 `useContracts()` hooks，详见 `src/contracts/README.md`
