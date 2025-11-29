import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield, CheckCircle, XCircle, AlertTriangle, Users, Building2, ShoppingBag, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useWeb3 } from "@/hooks/useWeb3";
import { useContracts } from "@/hooks/useContracts";
import { ethers } from "ethers";

interface Application {
  id: string;
  applicant_name: string;
  contact_email: string;
  address: string;
  situation: string;
  requested_amount: number;
  status: string;
  created_at: string;
  reviewed_at?: string | null;
}

interface PendingMerchant {
  address: string;
  name: string;
  metadata: string;
  stakeAmount: string;
}

interface PendingNGO {
  address: string;
  name: string;
  licenseId: string;
  stakeAmount: string;
}

const PlatformAdmin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { account } = useWeb3();
  const contracts = useContracts();
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [pendingMerchants, setPendingMerchants] = useState<PendingMerchant[]>([]);
  const [pendingNGOs, setPendingNGOs] = useState<PendingNGO[]>([]);
  const [blacklistedAddresses, setBlacklistedAddresses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  
  const [blacklistAddress, setBlacklistAddress] = useState("");

  useEffect(() => {
    checkAdminRole();
    loadApplications();
    loadPendingApprovals();
    loadBlacklist();
  }, [account]);

  const checkAdminRole = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "请先登录",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id);

    const isAdmin = roles?.some(r => r.role === "admin");
    if (!isAdmin) {
      toast({
        title: "权限不足",
        description: "只有平台管理员可以访问此页面",
        variant: "destructive",
      });
      navigate("/");
    }
  };

  const loadApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error("加载申请列表失败:", error);
    }
  };

  const loadPendingApprovals = async () => {
    // 这里展示假数据，实际需要通过合约事件或链下数据库获取
    // 可以监听MerchantRegistered和NGORegistered事件
    setPendingMerchants([
      {
        address: "0x1234567890123456789012345678901234567890",
        name: "示例商户",
        metadata: "销售日用品",
        stakeAmount: "100"
      }
    ]);
    
    setPendingNGOs([
      {
        address: "0x0987654321098765432109876543210987654321",
        name: "示例NGO机构",
        licenseId: "NGO-2024-001",
        stakeAmount: "500"
      }
    ]);
  };

  const loadBlacklist = async () => {
    if (!contracts.platformAdmin) return;
    
    // 这里展示假数据，实际需要查询合约
    setBlacklistedAddresses([]);
  };

  const handleApproveApplication = async (application: Application) => {
    if (!contracts.sheAidRoles) {
      toast({
        title: "合约未加载",
        description: "请先连接钱包",
        variant: "destructive",
      });
      return;
    }

    if (!account) {
      toast({
        title: "请先连接钱包",
        description: "需要钱包签名来授予受助人角色",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      toast({
        title: "步骤 1/2",
        description: "正在链上授予受助人角色...",
      });
      
      // 1. 调用链上合约授予受助人角色
      const tx = await contracts.sheAidRoles.grantBeneficiaryRole(application.address);
      await tx.wait();

      toast({
        title: "步骤 2/2",
        description: "更新数据库状态...",
      });

      // 2. 更新数据库状态
      const { error } = await supabase
        .from("applications")
        .update({ 
          status: "approved",
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", application.id);

      if (error) throw error;

      toast({
        title: "审核通过",
        description: `已批准 ${application.applicant_name} 的申请，并授予受助人角色`,
      });

      loadApplications();
    } catch (error: any) {
      console.error("审核失败:", error);
      toast({
        title: "审核失败",
        description: error.message || "操作失败，请重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectApplication = async () => {
    if (!selectedApplication) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from("applications")
        .update({ 
          status: "rejected",
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", selectedApplication.id);

      if (error) throw error;

      toast({
        title: "已拒绝",
        description: `已拒绝 ${selectedApplication.applicant_name} 的申请`,
      });

      setRejectDialogOpen(false);
      setRejectReason("");
      setSelectedApplication(null);
      loadApplications();
    } catch (error: any) {
      console.error("拒绝失败:", error);
      toast({
        title: "操作失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveMerchant = async (merchant: PendingMerchant) => {
    if (!contracts.merchantRegistry) {
      toast({
        title: "合约未加载",
        description: "MerchantRegistry合约未正确加载",
        variant: "destructive",
      });
      return;
    }

    if (!account) {
      toast({
        title: "请先连接钱包",
        description: "需要钱包签名来审核商户",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      toast({
        title: "处理中",
        description: "正在链上审核商户...",
      });

      const tx = await contracts.merchantRegistry.approveMerchant(merchant.address);
      await tx.wait();

      toast({
        title: "审核通过",
        description: `已批准商户 ${merchant.name}`,
      });

      loadPendingApprovals();
    } catch (error: any) {
      console.error("审核商户失败:", error);
      toast({
        title: "审核失败",
        description: error.message || "操作失败，请重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveNGO = async (ngo: PendingNGO) => {
    if (!contracts.ngoRegistry) {
      toast({
        title: "合约未加载",
        description: "NGORegistry合约未正确加载",
        variant: "destructive",
      });
      return;
    }

    if (!account) {
      toast({
        title: "请先连接钱包",
        description: "需要钱包签名来审核NGO",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      toast({
        title: "处理中",
        description: "正在链上审核NGO机构...",
      });

      const tx = await contracts.ngoRegistry.approveNGO(ngo.address);
      await tx.wait();

      toast({
        title: "审核通过",
        description: `已批准NGO机构 ${ngo.name}`,
      });

      loadPendingApprovals();
    } catch (error: any) {
      console.error("审核NGO失败:", error);
      toast({
        title: "审核失败",
        description: error.message || "操作失败，请重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToBlacklist = async () => {
    if (!contracts.platformAdmin || !blacklistAddress) return;

    try {
      setLoading(true);
      const tx = await contracts.platformAdmin.setBeneficiaryBlacklist(blacklistAddress, true);
      await tx.wait();

      toast({
        title: "已加入黑名单",
        description: `地址 ${blacklistAddress} 已被加入黑名单`,
      });

      setBlacklistAddress("");
      loadBlacklist();
    } catch (error: any) {
      console.error("加入黑名单失败:", error);
      toast({
        title: "操作失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const pendingApplications = applications.filter(a => a.status === "pending");
  const approvedApplications = applications.filter(a => a.status === "approved");
  const rejectedApplications = applications.filter(a => a.status === "rejected");

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回主页
        </Button>

        <div className="flex items-center gap-4 mb-8">
          <Shield className="w-12 h-12 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">平台管理员控制台</h1>
            <p className="text-muted-foreground">审核申请、管理机构、维护黑名单</p>
          </div>
        </div>

        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="applications">
              <Users className="w-4 h-4 mr-2" />
              受助人申请
            </TabsTrigger>
            <TabsTrigger value="merchants">
              <ShoppingBag className="w-4 h-4 mr-2" />
              商户审核
            </TabsTrigger>
            <TabsTrigger value="ngos">
              <Building2 className="w-4 h-4 mr-2" />
              NGO审核
            </TabsTrigger>
            <TabsTrigger value="blacklist">
              <AlertTriangle className="w-4 h-4 mr-2" />
              黑名单管理
            </TabsTrigger>
          </TabsList>

          <TabsContent value="applications">
            <Tabs defaultValue="pending">
              <TabsList>
                <TabsTrigger value="pending">
                  待审核 ({pendingApplications.length})
                </TabsTrigger>
                <TabsTrigger value="approved">
                  已通过 ({approvedApplications.length})
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  已拒绝 ({rejectedApplications.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-4 mt-4">
                {pendingApplications.map((app) => (
                  <Card key={app.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{app.applicant_name}</CardTitle>
                          <CardDescription>{app.contact_email}</CardDescription>
                        </div>
                        <Badge variant="secondary">待审核</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <p className="text-sm"><strong>钱包地址:</strong> {app.address}</p>
                        <p className="text-sm"><strong>申请金额:</strong> {app.requested_amount} 代币</p>
                        <p className="text-sm"><strong>困难情况:</strong></p>
                        <p className="text-sm text-muted-foreground">{app.situation}</p>
                        <p className="text-xs text-muted-foreground">
                          申请时间: {new Date(app.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApproveApplication(app)}
                          disabled={loading}
                          size="sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          批准
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            setSelectedApplication(app);
                            setRejectDialogOpen(true);
                          }}
                          disabled={loading}
                          size="sm"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          拒绝
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {pendingApplications.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">暂无待审核的申请</p>
                )}
              </TabsContent>

              <TabsContent value="approved" className="space-y-4 mt-4">
                {approvedApplications.map((app) => (
                  <Card key={app.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{app.applicant_name}</CardTitle>
                          <CardDescription>{app.contact_email}</CardDescription>
                        </div>
                        <Badge className="bg-green-500">已通过</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm"><strong>钱包地址:</strong> {app.address}</p>
                        <p className="text-sm"><strong>申请金额:</strong> {app.requested_amount} 代币</p>
                        <p className="text-sm"><strong>困难情况:</strong></p>
                        <p className="text-sm text-muted-foreground">{app.situation}</p>
                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground">
                            申请时间: {new Date(app.created_at).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            审核时间: {app.reviewed_at ? new Date(app.reviewed_at).toLocaleString() : "-"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {approvedApplications.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">暂无已通过的申请</p>
                )}
              </TabsContent>

              <TabsContent value="rejected" className="space-y-4 mt-4">
                {rejectedApplications.map((app) => (
                  <Card key={app.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{app.applicant_name}</CardTitle>
                          <CardDescription>{app.contact_email}</CardDescription>
                        </div>
                        <Badge variant="destructive">已拒绝</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm"><strong>钱包地址:</strong> {app.address}</p>
                        <p className="text-sm"><strong>申请金额:</strong> {app.requested_amount} 代币</p>
                        <p className="text-sm"><strong>困难情况:</strong></p>
                        <p className="text-sm text-muted-foreground">{app.situation}</p>
                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground">
                            申请时间: {new Date(app.created_at).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            拒绝时间: {app.reviewed_at ? new Date(app.reviewed_at).toLocaleString() : "-"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {rejectedApplications.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">暂无已拒绝的申请</p>
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="merchants" className="space-y-4">
            {pendingMerchants.map((merchant, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{merchant.name}</CardTitle>
                      <CardDescription className="font-mono text-xs">
                        {merchant.address}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">待审核</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm"><strong>说明:</strong> {merchant.metadata}</p>
                    <p className="text-sm"><strong>押金:</strong> {merchant.stakeAmount} 代币</p>
                  </div>
                  <Button
                    onClick={() => handleApproveMerchant(merchant)}
                    disabled={loading}
                    size="sm"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    批准商户
                  </Button>
                </CardContent>
              </Card>
            ))}
            {pendingMerchants.length === 0 && (
              <p className="text-center text-muted-foreground py-8">暂无待审核的商户</p>
            )}
          </TabsContent>

          <TabsContent value="ngos" className="space-y-4">
            {pendingNGOs.map((ngo, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{ngo.name}</CardTitle>
                      <CardDescription className="font-mono text-xs">
                        {ngo.address}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">待审核</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm"><strong>执照编号:</strong> {ngo.licenseId}</p>
                    <p className="text-sm"><strong>押金:</strong> {ngo.stakeAmount} 代币</p>
                  </div>
                  <Button
                    onClick={() => handleApproveNGO(ngo)}
                    disabled={loading}
                    size="sm"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    批准NGO
                  </Button>
                </CardContent>
              </Card>
            ))}
            {pendingNGOs.length === 0 && (
              <p className="text-center text-muted-foreground py-8">暂无待审核的NGO机构</p>
            )}
          </TabsContent>

          <TabsContent value="blacklist">
            <Card>
              <CardHeader>
                <CardTitle>黑名单管理</CardTitle>
                <CardDescription>添加或移除受助人黑名单</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="输入钱包地址"
                    value={blacklistAddress}
                    onChange={(e) => setBlacklistAddress(e.target.value)}
                  />
                  <Button onClick={handleAddToBlacklist} disabled={loading || !blacklistAddress}>
                    添加到黑名单
                  </Button>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">当前黑名单:</h3>
                  {blacklistedAddresses.length === 0 ? (
                    <p className="text-sm text-muted-foreground">暂无黑名单地址</p>
                  ) : (
                    blacklistedAddresses.map((addr) => (
                      <div key={addr} className="flex justify-between items-center p-2 bg-accent rounded">
                        <span className="font-mono text-sm">{addr}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // 移除黑名单逻辑
                          }}
                        >
                          移除
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>拒绝申请</DialogTitle>
            <DialogDescription>
              请说明拒绝 {selectedApplication?.applicant_name} 的原因
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="请输入拒绝原因..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleRejectApplication} disabled={loading}>
              确认拒绝
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlatformAdmin;
