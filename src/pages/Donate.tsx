import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Wallet, Loader2, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  target_amount: number;
  current_amount: number;
  beneficiary_count: number;
  image_url: string | null;
  organizers: {
    organization_name: string;
  };
}

const Donate = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("eth");
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const predefinedAmounts = [0.1, 0.5, 1, 2, 5];

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select(`
          id,
          title,
          description,
          category,
          target_amount,
          current_amount,
          beneficiary_count,
          image_url,
          organizers (
            organization_name
          )
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast({
        title: "加载失败",
        description: "无法加载项目列表",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

    if (!selectedProject) {
      toast({
        title: "请选择项目",
        description: "请选择要捐助的项目",
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

      // 示例合约地址
      const contractAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb";
      
      const amountInWei = (parseFloat(amount) * 1e18).toString(16);

      const transactionHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: walletAddress,
          to: contractAddress,
          value: '0x' + amountInWei,
        }],
      });

      // 保存捐款记录到数据库
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from("donations").insert({
        project_id: selectedProject,
        donor_id: user?.id || null,
        amount: parseFloat(amount),
        payment_method: paymentMethod,
        transaction_hash: transactionHash,
        status: "pending",
      });

      // 更新项目当前金额
      const project = projects.find(p => p.id === selectedProject);
      if (project) {
        await supabase
          .from("projects")
          .update({ 
            current_amount: project.current_amount + parseFloat(amount) 
          })
          .eq("id", selectedProject);
      }

      toast({
        title: "交易已提交！",
        description: `交易哈希: ${transactionHash.substring(0, 10)}...`,
      });

      setAmount("");
      setSelectedProject("");
      fetchProjects();
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

  const selectedProjectData = projects.find(p => p.id === selectedProject);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-8 hover:bg-accent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回主页
          </Button>

          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              捐助善款
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              选择您要支持的项目，使用加密货币进行捐赠。所有交易透明可追溯，资金流向清晰可见
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {/* 项目列表 */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-2xl font-bold mb-4">选择捐助项目</h2>
                {projects.length === 0 ? (
                  <Card className="p-8 text-center text-muted-foreground">
                    暂无可捐助的项目
                  </Card>
                ) : (
                  projects.map((project) => {
                    const progress = (project.current_amount / project.target_amount) * 100;
                    return (
                      <Card
                        key={project.id}
                        className={`cursor-pointer transition-all ${
                          selectedProject === project.id
                            ? "border-primary shadow-lg"
                            : "hover:border-primary/50"
                        }`}
                        onClick={() => setSelectedProject(project.id)}
                      >
                        <CardHeader>
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <CardTitle className="text-xl mb-2">{project.title}</CardTitle>
                              <CardDescription className="line-clamp-2">
                                {project.description}
                              </CardDescription>
                            </div>
                            <Badge variant="outline">{project.category}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                由 {project.organizers?.organization_name} 发起
                              </span>
                              <span className="font-medium">
                                {project.beneficiary_count} 人受助
                              </span>
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-2">
                                <span className="text-muted-foreground">筹款进度</span>
                                <span className="font-bold text-primary">
                                  {project.current_amount} / {project.target_amount} ETH
                                </span>
                              </div>
                              <Progress value={progress} className="h-2" />
                              <div className="text-xs text-muted-foreground mt-1 text-right">
                                {progress.toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>

              {/* 捐款表单 */}
              <div className="space-y-6">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-primary" />
                      捐款信息
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!walletAddress ? (
                      <Button
                        onClick={connectMetaMask}
                        disabled={isConnecting}
                        className="w-full bg-gradient-primary h-12"
                        size="lg"
                      >
                        <Wallet className="w-5 h-5 mr-2" />
                        {isConnecting ? "连接中..." : "连接 MetaMask"}
                      </Button>
                    ) : (
                      <>
                        <div className="p-3 bg-accent/20 rounded-lg border border-border">
                          <p className="text-xs text-muted-foreground mb-1">已连接钱包</p>
                          <p className="font-mono text-sm font-medium">
                            {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
                          </p>
                        </div>

                        {selectedProjectData && (
                          <div className="p-3 bg-primary/10 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">选中项目</p>
                            <p className="font-medium text-sm">{selectedProjectData.title}</p>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label>捐款金额 (ETH)</Label>
                          <div className="grid grid-cols-5 gap-2">
                            {predefinedAmounts.map((amt) => (
                              <Button
                                key={amt}
                                variant={amount === amt.toString() ? "default" : "outline"}
                                onClick={() => setAmount(amt.toString())}
                                size="sm"
                              >
                                {amt}
                              </Button>
                            ))}
                          </div>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="自定义"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>支付币种</Label>
                          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                            <div className="flex items-center space-x-2 p-2 border rounded-lg">
                              <RadioGroupItem value="eth" id="eth" />
                              <Label htmlFor="eth" className="flex-1 cursor-pointer font-normal">
                                ETH
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 p-2 border rounded-lg">
                              <RadioGroupItem value="usdt" id="usdt" />
                              <Label htmlFor="usdt" className="flex-1 cursor-pointer font-normal">
                                USDT
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <Button
                          onClick={handleDonate}
                          className="w-full bg-gradient-primary h-12"
                          size="lg"
                          disabled={!selectedProject || !amount}
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          立即捐款
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Donate;
