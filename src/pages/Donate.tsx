import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Search, ExternalLink, CheckCircle2, Clock, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Donate = () => {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("eth");
  const [txHash, setTxHash] = useState("");
  const { toast } = useToast();

  const predefinedAmounts = [0.1, 0.5, 1, 2, 5];

  const handleDonate = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "请输入有效金额",
        description: "捐款金额必须大于0",
        variant: "destructive",
      });
      return;
    }

    // 模拟区块链交易
    const mockTxHash = "0x" + Math.random().toString(16).substr(2, 64);
    
    toast({
      title: "交易已提交",
      description: "正在处理您的捐款...",
    });

    // 模拟交易确认
    setTimeout(() => {
      toast({
        title: "捐款成功！",
        description: `交易哈希: ${mockTxHash.substring(0, 10)}...`,
      });
    }, 2000);
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
          {/* Hero Section */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              支持女性安全事业
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              您的每一份捐助都将通过区块链技术透明管理，直接帮助需要帮助的女性
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Donation Form */}
            <Card className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-primary" />
                  捐款信息
                </CardTitle>
                <CardDescription>选择捐款金额和支付方式</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Amount Selection */}
                <div className="space-y-3">
                  <Label htmlFor="amount">捐款金额</Label>
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
                    placeholder="或输入自定义金额"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Payment Method */}
                <div className="space-y-3">
                  <Label>支付方式</Label>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent transition-colors">
                      <RadioGroupItem value="eth" id="eth" />
                      <Label htmlFor="eth" className="flex-1 cursor-pointer">
                        <div className="font-medium">以太坊 (ETH)</div>
                        <div className="text-sm text-muted-foreground">使用ETH进行捐款</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent transition-colors">
                      <RadioGroupItem value="usdt" id="usdt" />
                      <Label htmlFor="usdt" className="flex-1 cursor-pointer">
                        <div className="font-medium">USDT (稳定币)</div>
                        <div className="text-sm text-muted-foreground">使用USDT稳定币捐款</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent transition-colors">
                      <RadioGroupItem value="usdc" id="usdc" />
                      <Label htmlFor="usdc" className="flex-1 cursor-pointer">
                        <div className="font-medium">USDC (稳定币)</div>
                        <div className="text-sm text-muted-foreground">使用USDC稳定币捐款</div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button 
                  onClick={handleDonate}
                  className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                  size="lg"
                >
                  确认捐款
                </Button>
              </CardContent>
            </Card>

            {/* Real-time Progress & Transaction Query */}
            <div className="space-y-6">
              {/* Progress Tracking */}
              <Card className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    实时进度追踪
                  </CardTitle>
                  <CardDescription>当前项目筹款进度</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">已筹集</span>
                      <span className="font-semibold">127.5 ETH / 200 ETH</span>
                    </div>
                    <Progress value={63.75} className="h-3" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="p-3 bg-accent/50 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">捐助人数</div>
                      <div className="text-2xl font-bold text-primary">1,234</div>
                    </div>
                    <div className="p-3 bg-accent/50 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">受助人数</div>
                      <div className="text-2xl font-bold text-primary">856</div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="text-sm font-medium mb-2">最近捐助</div>
                    {[
                      { amount: "2.5 ETH", time: "2分钟前", status: "confirmed" },
                      { amount: "1.0 ETH", time: "15分钟前", status: "confirmed" },
                      { amount: "0.5 USDT", time: "1小时前", status: "confirmed" },
                    ].map((donation, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-background border rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="font-medium">{donation.amount}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{donation.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Transaction Query */}
              <Card className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-primary" />
                    交易记录查询
                  </CardTitle>
                  <CardDescription>输入交易哈希查询区块链记录</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="0x..."
                      value={txHash}
                      onChange={(e) => setTxHash(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleSearchTx} variant="outline">
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium mb-2">快速链接</div>
                    <a
                      href="https://etherscan.io"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors group"
                    >
                      <span className="text-sm">在 Etherscan 查看</span>
                      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </a>
                    <a
                      href="https://polygonscan.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors group"
                    >
                      <span className="text-sm">在 Polygonscan 查看</span>
                      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </a>
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
