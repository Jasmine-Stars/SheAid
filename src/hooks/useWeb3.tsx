import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { ethers } from "ethers";
import { NETWORK_CONFIG } from "@/contracts/addresses";
import { toast } from "sonner";

interface Web3ContextType {
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const Web3Context = createContext<Web3ContextType>({
  provider: null,
  signer: null,
  account: null,
  chainId: null,
  isConnected: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
});

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);

  const checkNetwork = async (provider: ethers.providers.Web3Provider) => {
    const network = await provider.getNetwork();
    if (network.chainId !== NETWORK_CONFIG.chainId) {
      toast.error(`请切换到 ${NETWORK_CONFIG.chainName}`);
      try {
        await window.ethereum?.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}` }],
        });
      } catch (error: any) {
        if (error.code === 4902) {
          toast.error("请手动添加 Sepolia 测试网到 MetaMask");
        }
      }
      return false;
    }
    return true;
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error("请安装 MetaMask 钱包");
      return;
    }

    try {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const isCorrectNetwork = await checkNetwork(web3Provider);
      if (!isCorrectNetwork) return;

      const web3Signer = web3Provider.getSigner();
      const network = await web3Provider.getNetwork();

      setProvider(web3Provider);
      setSigner(web3Signer);
      setAccount(accounts[0]);
      setChainId(network.chainId);

      toast.success("钱包连接成功");
    } catch (error: any) {
      console.error("连接钱包失败:", error);
      toast.error("连接钱包失败");
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    toast.success("钱包已断开");
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      });

      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener("accountsChanged", () => {});
        window.ethereum.removeListener("chainChanged", () => {});
      }
    };
  }, []);

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        account,
        chainId,
        isConnected: !!account,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
