# 智能合约部署与配置指南（初学者版）

## 📝 第一步：在 Remix 上部署合约

### 1. 准备工作
- 打开 [Remix IDE](https://remix.ethereum.org)
- 确保 MetaMask 已连接到 Sepolia 测试网
- 确保钱包里有 Sepolia ETH（可以从 [水龙头](https://sepoliafaucet.com/) 获取）

### 2. 复制合约代码
将项目根目录下的 8 个 `.sol` 文件复制到 Remix：
- MockToken.sol
- SheAidRoles.sol
- PlatformAdmin.sol
- NGORegistry.sol
- MerchantRegistry.sol
- Marketplace.sol
- BeneficiaryModule.sol
- ProjectVaultManager.sol

### 3. 编译合约
- 在 Remix 左侧点击 "Solidity Compiler"
- 选择编译器版本 `0.8.20`
- 点击 "Compile" 编译所有合约

### 4. 按顺序部署（重要！）

#### 🔴 部署顺序很重要，必须按以下顺序：

**① 部署 MockToken**
```
合约: MockToken
构造函数参数: 
  - initialSupply: 1000000000000000000000000 (1百万代币，18位小数)
  
部署后记录地址 → 填入 src/contracts/addresses.ts 的 MockToken
```

**② 部署 SheAidRoles**
```
合约: SheAidRoles
构造函数参数:
  - superAdmin: [你的钱包地址] (从 MetaMask 复制)
  
部署后记录地址 → 填入 src/contracts/addresses.ts 的 SheAidRoles
```

**③ 部署 PlatformAdmin**
```
合约: PlatformAdmin
构造函数参数:
  - _roles: [SheAidRoles 的地址]
  - _platformToken: [MockToken 的地址]
  
部署后记录地址 → 填入 src/contracts/addresses.ts 的 PlatformAdmin
```

**④ 部署 NGORegistry**
```
合约: NGORegistry
构造函数参数:
  - _roles: [SheAidRoles 的地址]
  - _stakeToken: [MockToken 的地址]
  
部署后记录地址 → 填入 src/contracts/addresses.ts 的 NGORegistry
```

**⑤ 部署 MerchantRegistry**
```
合约: MerchantRegistry
构造函数参数:
  - _roles: [SheAidRoles 的地址]
  - _stakeToken: [MockToken 的地址]
  
部署后记录地址 → 填入 src/contracts/addresses.ts 的 MerchantRegistry
```

**⑥ 部署 Marketplace**
```
合约: Marketplace
构造函数参数:
  - _roles: [SheAidRoles 的地址]
  - _settlementToken: [MockToken 的地址]
  
部署后记录地址 → 填入 src/contracts/addresses.ts 的 Marketplace
```

**⑦ 部署 BeneficiaryModule**
```
合约: BeneficiaryModule
构造函数参数:
  - _roles: [SheAidRoles 的地址]
  - _platformAdmin: [PlatformAdmin 的地址]
  - _marketplace: [Marketplace 的地址]
  
部署后记录地址 → 填入 src/contracts/addresses.ts 的 BeneficiaryModule
```

**⑧ 部署 ProjectVaultManager**
```
合约: ProjectVaultManager
构造函数参数:
  - _roles: [SheAidRoles 的地址]
  - _settlementToken: [MockToken 的地址]
  - _beneficiaryModule: [BeneficiaryModule 的地址]
  
部署后记录地址 → 填入 src/contracts/addresses.ts 的 ProjectVaultManager
```

---

## 🔧 第二步：配置合约间关系

部署完成后，在 Remix 的 "Deployed Contracts" 区域，执行以下调用：

### 1. 配置 Marketplace
```javascript
// 找到 Marketplace 合约，调用：
setBeneficiaryModule([BeneficiaryModule 的地址])
```

### 2. 配置 BeneficiaryModule
```javascript
// 找到 BeneficiaryModule 合约，调用：
setProjectVaultManager([ProjectVaultManager 的地址])
```

### 3. 设置 NGO 押金要求（可选）
```javascript
// 找到 NGORegistry 合约，调用：
setRequiredNGOStake(1000000000000000000) // 1 个代币
```

---

## 📋 第三步：复制合约 ABI

对于每个已部署的合约：
1. 在 Remix 左侧点击 "Solidity Compiler"
2. 点击 "Compilation Details"
3. 找到 "ABI" 部分
4. 点击复制图标
5. 创建文件 `src/contracts/abis/[合约名].json` 并粘贴 ABI

需要复制的合约 ABI：
- MockToken.json
- SheAidRoles.json
- PlatformAdmin.json
- NGORegistry.json
- MerchantRegistry.json
- Marketplace.json
- BeneficiaryModule.json
- ProjectVaultManager.json

---

## ✅ 完成检查清单

- [ ] 所有 8 个合约已按顺序部署
- [ ] 所有合约地址已填入 `src/contracts/addresses.ts`
- [ ] 已调用 `Marketplace.setBeneficiaryModule()`
- [ ] 已调用 `BeneficiaryModule.setProjectVaultManager()`
- [ ] 所有合约 ABI 已复制到 `src/contracts/abis/` 目录
- [ ] MetaMask 已连接到 Sepolia 测试网

完成后，前端即可与智能合约交互！
