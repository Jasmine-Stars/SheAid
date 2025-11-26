# 合约 ABI 文件目录

## 📋 需要放置的 ABI 文件

从 Remix 复制每个合约的 ABI，创建对应的 JSON 文件：

1. **MockToken.json** - MockToken 合约 ABI
2. **SheAidRoles.json** - SheAidRoles 合约 ABI
3. **PlatformAdmin.json** - PlatformAdmin 合约 ABI
4. **NGORegistry.json** - NGORegistry 合约 ABI
5. **MerchantRegistry.json** - MerchantRegistry 合约 ABI
6. **Marketplace.json** - Marketplace 合约 ABI
7. **BeneficiaryModule.json** - BeneficiaryModule 合约 ABI
8. **ProjectVaultManager.json** - ProjectVaultManager 合约 ABI

## 如何获取 ABI

1. 在 Remix 中编译合约
2. 点击左侧 "Solidity Compiler" 图标
3. 点击 "Compilation Details" 按钮
4. 找到 "ABI" 部分
5. 点击复制图标
6. 创建对应的 `.json` 文件并粘贴内容

## 示例文件内容格式

```json
[
  {
    "inputs": [...],
    "stateMutability": "...",
    "type": "constructor"
  },
  ...
]
```

完成后，在 `src/hooks/useContracts.tsx` 中导入这些 ABI 文件。
