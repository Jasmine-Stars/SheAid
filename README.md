# SheAid - 女性安全捐助链

这是一个基于区块链的透明公益平台，利用 Web3 技术构建去信任捐助链。



### 前置要求

* Node.js & npm (建议使用最新 LTS 版本)

### 安装与运行

1. 克隆项目到本地：
   ```bash
   git clone <你的新仓库地址>
   cd SheAid-experiment-migrationToLocal
    ```
2. 安装依赖：
   ```bash
   npm install
    ```

3. 配置环境变量： 在根目录创建 .env 文件（参考 .env.example 或直接从 Supabase 获取），填入：
    ```bash
    VITE_SUPABASE_URL=你的Supabase项目URL
    VITE_SUPABASE_PUBLISHABLE_KEY=你的Supabase公钥
    ```

4. 启动开发服务器：

    ```Bash
    npm run dev
    ```