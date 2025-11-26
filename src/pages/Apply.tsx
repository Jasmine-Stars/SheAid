import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Heart, Send, Wallet, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useWeb3 } from "@/hooks/useWeb3";
import { useContracts } from "@/hooks/useContracts";
import { ethers } from "ethers";

const Apply = () => {
  const navigate = useNavigate();
  const { account, isConnected, connectWallet } = useWeb3();
  const contracts = useContracts();
  const [user, setUser] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    nickname: "",
    contact_email: "",
    contact_phone: "",
    wallet_address: "",
    situation: "",
    requested_amount: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 受助人余额和统计
  const [charityBalance, setCharityBalance] = useState("0");
  const [stats, setStats] = useState({
    dailySpent: "0",
    lastSpendTime: 0,
  });

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (isConnected && account) {
      setFormData(prev => ({ ...prev, wallet_address: account }));
      loadBeneficiaryData();
    }
  }, [isConnected, account]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  };

  const loadBeneficiaryData = async () => {
    if (!contracts.beneficiaryModule || !account) return;
    
    try {
      const balance = await contracts.beneficiaryModule.charityBalance(account);
      setCharityBalance(ethers.utils.formatEther(balance));
      
      const statsData = await contracts.beneficiaryModule.getStats(account);
      setStats({
        dailySpent: ethers.utils.formatEther(statsData.dailySpent),
        lastSpendTime: statsData.lastSpendTimestamp.toNumber(),
      });
    } catch (error) {
      console.error("加载受助人数据失败:", error);
    }
  };

  const handleSpendToken = async (productId: number, quantity: number) => {
    if (!contracts.beneficiaryModule) {
      toast.error("请先连接钱包");
      return;
    }

    try {
      const tx = await contracts.beneficiaryModule.spendCharityToken(productId, quantity);
      await tx.wait();
      toast.success("核销成功！");
      loadBeneficiaryData();
    } catch (error: any) {
      console.error("核销失败:", error);
      toast.error(error.message || "核销失败");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("请先登录");
      navigate("/auth");
      return;
    }

    if (!isConnected || !account) {
      toast.error("请先连接钱包");
      return;
    }
    
    // 验证必填字段
    if (!formData.nickname || !formData.contact_email || !formData.situation || !formData.wallet_address) {
      toast.error("请填写所有必填字段");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('applications')
        .insert([
          {
            applicant_name: formData.nickname,
            applicant_age: 0,
            contact_email: formData.contact_email,
            contact_phone: formData.contact_phone,
            address: formData.wallet_address,
            situation: formData.situation,
            requested_amount: parseFloat(formData.requested_amount) || 0,
            urgency_level: 'medium',
            status: 'pending',
          }
        ]);

      if (error) throw error;

      toast.success("申请提交成功！我们会尽快审核您的申请");
      
      // 重置表单
      setFormData({
        nickname: "",
        contact_email: "",
        contact_phone: "",
        wallet_address: account,
        situation: "",
        requested_amount: "",
      });
    } catch (error: any) {
      console.error("提交失败:", error);
      toast.error("提交失败，请稍后重试");
    } finally {
      setIsSubmitting(false);
    }
  };

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

          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
              <Heart className="w-10 h-10 text-primary" />
              申请救助
            </h1>
            <p className="text-muted-foreground">
              填写申请信息，连接钱包地址以接收救助资金和慈善积分
            </p>
          </div>

          {!user ? (
            <Card className="p-8 max-w-3xl mx-auto text-center">
              <Heart className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-semibold mb-4">请先登录</h2>
              <p className="text-muted-foreground mb-6">
                您需要登录账号才能提交救助申请
              </p>
              <Button onClick={() => navigate("/auth")} size="lg">
                前往登录
              </Button>
            </Card>
          ) : !isConnected ? (
            <Card className="p-8 max-w-3xl mx-auto text-center">
              <Wallet className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-semibold mb-4">请连接钱包</h2>
              <p className="text-muted-foreground mb-6">
                您需要连接钱包地址以接收救助资金
              </p>
              <Button onClick={connectWallet} size="lg">
                连接钱包
              </Button>
            </Card>
          ) : (
            <>
              {parseFloat(charityBalance) > 0 && (
                <Card className="p-6 max-w-3xl mx-auto mb-6 bg-primary/5 border-primary">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">慈善积分余额</h3>
                      <p className="text-3xl font-bold text-primary">{charityBalance} 积分</p>
                    </div>
                    <ShoppingCart className="w-12 h-12 text-primary" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">今日已消费</p>
                      <p className="font-semibold">{stats.dailySpent} 积分</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">最后消费时间</p>
                      <p className="font-semibold">
                        {stats.lastSpendTime > 0 
                          ? new Date(stats.lastSpendTime * 1000).toLocaleDateString()
                          : "暂无"}
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => navigate("/merchant")}
                    className="w-full mt-4"
                    variant="outline"
                  >
                    前往商户中心核销物资
                  </Button>
                </Card>
              )}

              <Card className="p-8 max-w-3xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="nickname" className="block text-sm font-medium mb-2">
                        昵称 *
                      </label>
                      <Input
                        id="nickname"
                        value={formData.nickname}
                        onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                        placeholder="请输入您的昵称"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="contact_email" className="block text-sm font-medium mb-2">
                        电子邮箱 *
                      </label>
                      <Input
                        id="contact_email"
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                        placeholder="your@email.com"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="contact_phone" className="block text-sm font-medium mb-2">
                        联系电话
                      </label>
                      <Input
                        id="contact_phone"
                        value={formData.contact_phone}
                        onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                        placeholder="请输入您的联系电话"
                      />
                    </div>

                    <div>
                      <label htmlFor="wallet_address" className="block text-sm font-medium mb-2">
                        钱包地址 *
                      </label>
                      <Input
                        id="wallet_address"
                        value={formData.wallet_address}
                        readOnly
                        placeholder="连接钱包后自动填写"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="situation" className="block text-sm font-medium mb-2">
                      困难情况说明 *
                    </label>
                    <Textarea
                      id="situation"
                      value={formData.situation}
                      onChange={(e) => setFormData({ ...formData, situation: e.target.value })}
                      placeholder="请详细描述您当前面临的困难情况..."
                      rows={6}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="requested_amount" className="block text-sm font-medium mb-2">
                      申请金额 (选填)
                    </label>
                    <Input
                      id="requested_amount"
                      type="number"
                      step="0.01"
                      value={formData.requested_amount}
                      onChange={(e) => setFormData({ ...formData, requested_amount: e.target.value })}
                      placeholder="请输入申请金额"
                    />
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        "提交中..."
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          提交申请
                        </>
                      )}
                    </Button>
                  </div>

                  <p className="text-sm text-muted-foreground text-center">
                    * 提交申请后，您将在审核通过后收到慈善积分，可用于核销物资
                  </p>
                </form>
              </Card>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Apply;
