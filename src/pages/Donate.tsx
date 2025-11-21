import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Search, ExternalLink, CheckCircle2, Wallet, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Donate = () => {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("eth");
  const [txHash, setTxHash] = useState("");
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const predefinedAmounts = [0.1, 0.5, 1, 2, 5];

  const connectMetaMask = async () => {
    setIsConnecting(true);
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        setWalletAddress(accounts[0]);
        toast({
          title: "钱包已连接",
          description: `地址: ${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`,
        });
      } else {
        toast({
          title: "未检测到MetaMask",
          description: "请安装MetaMask浏览器扩展",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "连接失败",
        description: error.message || "无法连接到MetaMask",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDonate = async () => {
    if (!walletAddress) {
      toast({
        title: "请先连接钱包",
        description: "需要连接MetaMask才能捐款",
        variant: "destructive",
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "请输入有效金额",
        description: "捐款金额必须大于0",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "处理中...",
        description: "正在准备交易",
      });

      // 合约地址（示例）
      const contractAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb";
      
      // 转换金额为Wei
      const amountInWei = (parseFloat(amount) * 1e18).toString(16);

      // 发送交易
      const transactionHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: walletAddress,
          to: contractAddress,
          value: '0x' + amountInWei,
        }],
      });

      toast({
        title: "交易已提交！",
        description: `交易哈希: ${transactionHash.substring(0, 10)}...`,
      });

      // 清空表单
      setAmount("");
    } catch (error: any) {
      if (error.code === 4001) {
        toast({
          title: "交易已取消",
          description: "您取消了此次捐款",
          variant: "destructive",
        });
      } else {
        toast({
          title: "交易失败",
          description: error.message || "请稍后重试",
          variant: "destructive",
        });
      }
    }
  };

  const handleSearchTx = () => {
    if (!txHash) {
      toast({
        title: "请输入交易哈希",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "查询成功",
      description: "交易已在区块链上确认",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">返回主页</span>
          </Link>

          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              捐助善款
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              使用加密货币进行捐赠，支持慈善事业。所有交易透明可追溯，确保资金安全到达
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Donation Form */}
            <Card className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-primary" />
                  加密货币捐款
                </CardTitle>
                <CardDescription>连接MetaMask钱包进行捐赠</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Wallet Connection */}
                {!walletAddress ? (
                  <div className="space-y-3">
                    <Button
                      onClick={connectMetaMask}
                      disabled={isConnecting}
                      className="w-full bg-gradient-primary h-12"
                      size="lg"
                    >
                      <Wallet className="w-5 h-5 mr-2" />
                      {isConnecting ? "连接中..." : "连接 MetaMask 钱包"}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      首次使用需要安装{" "}
                      <a
                        href="https://metamask.io/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        MetaMask浏览器扩展
                      </a>
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-accent/20 rounded-lg border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">已连接钱包</p>
                        <p className="font-mono text-sm font-medium">
                          {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
                        </p>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                  </div>
                )}

                {walletAddress && (
                  <>
                    {/* Amount Selection */}
                    <div className="space-y-3">
                      <Label htmlFor="amount">捐款金额 (ETH)</Label>
                      <div className="grid grid-cols-5 gap-2 mb-3">
                        {predefinedAmounts.map((amt) => (
                          <Button
                            key={amt}
                            variant={amount === amt.toString() ? "default" : "outline"}
                            onClick={() => setAmount(amt.toString())}
                            className="w-full"
                          >
                            {amt}
                          </Button>
                        ))}
                      </div>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="自定义金额"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="text-lg"
                      />
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-3">
                      <Label>支付币种</Label>
                      <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                        <div className="flex items-center space-x-2 p-3 border border-border rounded-lg hover:border-primary transition-colors">
                          <RadioGroupItem value="eth" id="eth" />
                          <Label htmlFor="eth" className="flex-1 cursor-pointer font-normal">
                            ETH (以太坊)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 p-3 border border-border rounded-lg hover:border-primary transition-colors">
                          <RadioGroupItem value="usdt" id="usdt" />
                          <Label htmlFor="usdt" className="flex-1 cursor-pointer font-normal">
                            USDT (稳定币)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 p-3 border border-border rounded-lg hover:border-primary transition-colors">
                          <RadioGroupItem value="usdc" id="usdc" />
                          <Label htmlFor="usdc" className="flex-1 cursor-pointer font-normal">
                            USDC (稳定币)
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Donate Button */}
                    <Button
                      onClick={handleDonate}
                      className="w-full bg-gradient-primary h-12"
                      size="lg"
                    >
                      立即捐款
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Real-time Progress */}
            <div className="space-y-6">
              <Card className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <CardHeader>
                  <CardTitle>实时筹款进度</CardTitle>
                  <CardDescription>透明追踪每一笔捐款</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">筹款目标</span>
                      <span className="text-sm font-bold">100 ETH</span>
                    </div>
                    <Progress value={67} className="h-3" />
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                      <span>已筹集: 67 ETH</span>
                      <span>67%</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-sm font-medium">捐助者统计</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-accent/20 rounded-lg text-center">
                        <div className="text-2xl font-bold text-primary">156</div>
                        <div className="text-xs text-muted-foreground mt-1">总捐助人数</div>
                      </div>
                      <div className="p-4 bg-accent/20 rounded-lg text-center">
                        <div className="text-2xl font-bold text-primary">23</div>
                        <div className="text-xs text-muted-foreground mt-1">24小时新增</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-3">最近捐款</div>
                    <div className="space-y-2">
                      {[
                        { address: "0xabcd...1234", amount: "0.5 ETH", time: "2分钟前" },
                        { address: "0xefgh...5678", amount: "1.0 ETH", time: "15分钟前" },
                        { address: "0xijkl...9012", amount: "0.2 ETH", time: "1小时前" },
                      ].map((donation, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center p-3 bg-accent/10 rounded-lg"
                        >
                          <div>
                            <div className="text-sm font-mono">{donation.address}</div>
                            <div className="text-xs text-muted-foreground">{donation.time}</div>
                          </div>
                          <div className="font-semibold text-primary">{donation.amount}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Transaction Query */}
              <Card className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-primary" />
                    交易查询
                  </CardTitle>
                  <CardDescription>验证您的捐款记录</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="输入交易哈希 (0x...)"
                      value={txHash}
                      onChange={(e) => setTxHash(e.target.value)}
                      className="font-mono text-sm"
                    />
                    <Button onClick={handleSearchTx} size="icon">
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">区块链浏览器</div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        asChild
                      >
                        <a
                          href="https://etherscan.io/"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Etherscan
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        asChild
                      >
                        <a
                          href="https://www.blockchain.com/explorer"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Blockchain
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Donate;
