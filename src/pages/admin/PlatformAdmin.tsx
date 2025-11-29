import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useContracts } from "@/hooks/useContracts";
import { useWeb3 } from "@/hooks/useWeb3";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Shield, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Users, 
  Building2, 
  ShoppingBag, 
  ArrowLeft,
  Loader2,
  Clock,
  Wallet,
  FileText
} from "lucide-react";

// --- 接口定义 (补充 rejection_reason) ---

interface Profile {
  email: string;
  full_name: string | null;
  wallet_address: string | null;
}

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
  rejection_reason?: string | null; // ✅ 新增字段
}

interface Merchant {
  id: string;
  user_id: string;
  store_name: string;
  description: string;
  status: string;
  created_at: string;
  reviewed_at?: string | null;
  rejection_reason?: string | null; // ✅ 新增字段
  profiles: Profile;
}

interface NGO {
  id: string;
  user_id: string;
  organization_name: string;
  organization_type: string;
  license_id?: string;
  contact_email: string;
  contact_phone: string;
  status: string;
  created_at: string;
  reviewed_at?: string | null;
  rejection_reason?: string | null; // ✅ 新增字段
  profiles: Profile;
}

const PlatformAdmin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { account } = useWeb3();
  const contracts = useContracts();
  
  // --- State 管理 ---
  const [activeTab, setActiveTab] = useState("applications");
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [ngos, setNgos] = useState<NGO[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // 拒绝弹窗状态
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectTarget, setRejectTarget] = useState<{ type: 'app' | 'merchant' | 'ngo', id: string } | null>(null);

  // 黑名单
  const [blacklistAddress, setBlacklistAddress] = useState("");

  // --- 初始化 ---
  useEffect(() => {
    const init = async () => {
      await checkAdminRole();
      await Promise.all([
        fetchApplications(),
        fetchMerchants(),
        fetchNGOs()
      ]);
      setLoading(false);
    };
    init();
  }, []);

  const checkAdminRole = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin");
      
    if (!roles || roles.length === 0) {
      toast({ title: "权限不足", description: "仅限管理员访问", variant: "destructive" });
      navigate("/");
    }
  };

  // --- 数据获取 ---

  const fetchApplications = async () => {
    const { data } = await supabase.from("applications").select("*").order("created_at", { ascending: false });
    if (data) setApplications(data as any);
  };

  const fetchMerchants = async () => {
    const { data } = await supabase
      .from("merchants")
      .select(`*, profiles:user_id(email, full_name, wallet_address)`)
      .order("created_at", { ascending: false });
    if (data) setMerchants(data as any);
  };

  const fetchNGOs = async () => {
    // 假设 NGO 数据存储在 organizers 表
    const { data } = await supabase
      .from("organizers") 
      .select(`*, profiles:user_id(email, full_name, wallet_address)`)
      .order("created_at", { ascending: false });
    if (data) setNgos(data as any); 
  };

  // --- 核心操作逻辑 ---

  // 1. 批准受助人
  const handleApproveApp = async (app: Application) => {
    if (!contracts.sheAidRoles || !account) return toast({ title: "请先连接管理员钱包", variant: "destructive" });
    
    setProcessingId(app.id);
    try {
      const tx = await contracts.sheAidRoles.grantBeneficiaryRole(app.address);
      await tx.wait();

      await supabase.from("applications").update({ status: "approved", reviewed_at: new Date().toISOString() }).eq("id", app.id);
      
      // 乐观更新
      setApplications(prev => prev.map(item => item.id === app.id ? { ...item, status: "approved" } : item));
      toast({ title: "已批准", description: "受助人身份已上链" });
    } catch (e: any) {
      console.error(e);
      toast({ title: "失败", description: e.message, variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  // 2. 批准商户
  const handleApproveMerchant = async (merchant: Merchant) => {
    if (!contracts.merchantRegistry || !account) return toast({ title: "合约未就绪", variant: "destructive" });
    if (!merchant.profiles.wallet_address) return toast({ title: "该商户未绑定钱包", variant: "destructive" });

    setProcessingId(merchant.id);
    try {
      const tx = await contracts.merchantRegistry.approveMerchant(merchant.profiles.wallet_address);
      await tx.wait();

      await supabase.from("merchants").update({ status: "approved", reviewed_at: new Date().toISOString() }).eq("id", merchant.id);
      await supabase.from("user_roles").insert({ user_id: merchant.user_id, role: "merchant" }).maybeSingle();

      setMerchants(prev => prev.map(item => item.id === merchant.id ? { ...item, status: "approved" } : item));
      toast({ title: "已批准", description: "商户已获得链上资格" });
    } catch (e: any) {
      console.error(e);
      toast({ title: "操作失败", description: e.message, variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  // 3. 批准 NGO
  const handleApproveNGO = async (ngo: NGO) => {
    if (!contracts.ngoRegistry || !account) return toast({ title: "合约未就绪", variant: "destructive" });
    if (!ngo.profiles.wallet_address) return toast({ title: "该NGO未绑定钱包", variant: "destructive" });

    setProcessingId(ngo.id);
    try {
      const tx = await contracts.ngoRegistry.approveNGO(ngo.profiles.wallet_address);
      await tx.wait();

      await supabase.from("organizers").update({ status: "approved", reviewed_at: new Date().toISOString() }).eq("id", ngo.id);
      await supabase.from("user_roles").insert({ user_id: ngo.user_id, role: "ngo" }).maybeSingle();

      setNgos(prev => prev.map(item => item.id === ngo.id ? { ...item, status: "approved" } : item));
      toast({ title: "已批准", description: "NGO 已获得链上资格" });
    } catch (e: any) {
      console.error(e);
      toast({ title: "操作失败", description: e.message, variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  // 4. 通用拒绝处理 (包含乐观更新)
  const openRejectDialog = (type: 'app'|'merchant'|'ngo', id: string) => {
    setRejectTarget({ type, id });
    setRejectDialogOpen(true);
  };

  const confirmReject = async () => {
    if (!rejectTarget) return;
    const { type, id } = rejectTarget;
    
    // 构造更新数据
    const updatePayload = {
      status: "rejected",
      reviewed_at: new Date().toISOString(),
      rejection_reason: rejectReason // ✅ 保存拒绝理由
    };
    
    try {
      if (type === 'app') {
        await supabase.from("applications").update(updatePayload).eq("id", id);
        setApplications(prev => prev.map(item => item.id === id ? { ...item, ...updatePayload } : item));
      } else if (type === 'merchant') {
        await supabase.from("merchants").update(updatePayload).eq("id", id);
        setMerchants(prev => prev.map(item => item.id === id ? { ...item, ...updatePayload } : item));
      } else if (type === 'ngo') {
        await supabase.from("organizers").update(updatePayload).eq("id", id);
        setNgos(prev => prev.map(item => item.id === id ? { ...item, ...updatePayload } : item));
      }
      toast({ title: "已拒绝" });
      setRejectDialogOpen(false);
      setRejectReason("");
    } catch (e) {
      toast({ title: "操作失败", variant: "destructive" });
    }
  };

  // --- 辅助渲染组件 ---
  
  const renderStatusTabs = (
    items: any[], 
    renderCard: (item: any) => React.ReactNode, 
    emptyText: string
  ) => {
    const pending = items.filter(i => i.status === "pending");
    const approved = items.filter(i => i.status === "approved");
    const rejected = items.filter(i => i.status === "rejected");

    return (
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="pending">待审核 ({pending.length})</TabsTrigger>
          <TabsTrigger value="approved">已通过 ({approved.length})</TabsTrigger>
          <TabsTrigger value="rejected">已拒绝 ({rejected.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="space-y-4">
          {pending.length === 0 ? <EmptyState text={emptyText} /> : pending.map(renderCard)}
        </TabsContent>
        <TabsContent value="approved" className="space-y-4">
          {approved.length === 0 ? <EmptyState text="无已通过记录" /> : approved.map(renderCard)}
        </TabsContent>
        <TabsContent value="rejected" className="space-y-4">
          {rejected.length === 0 ? <EmptyState text="无已拒绝记录" /> : rejected.map(renderCard)}
        </TabsContent>
      </Tabs>
    );
  };

  const EmptyState = ({ text }: { text: string }) => (
    <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
      {text}
    </div>
  );

  // 拒绝理由展示组件
  const RejectionNote = ({ reason }: { reason?: string | null }) => {
    if (!reason) return null;
    return (
      <div className="mt-3 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-100">
        <span className="font-bold">拒绝理由：</span>{reason}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Shield className="w-10 h-10 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">平台管理员控制台</h1>
              <p className="text-muted-foreground text-sm">Web3 慈善监管中心</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> 返回首页
          </Button>
        </div>

        {/* 主选项卡 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-12">
            <TabsTrigger value="applications" className="gap-2"><Users className="w-4 h-4"/> 受助人申请</TabsTrigger>
            <TabsTrigger value="merchants" className="gap-2"><ShoppingBag className="w-4 h-4"/> 商户审核</TabsTrigger>
            <TabsTrigger value="ngos" className="gap-2"><Building2 className="w-4 h-4"/> NGO 审核</TabsTrigger>
            <TabsTrigger value="blacklist" className="gap-2"><AlertTriangle className="w-4 h-4"/> 黑名单管理</TabsTrigger>
          </TabsList>

          {/* 1. 受助人板块 */}
          <TabsContent value="applications">
            {renderStatusTabs(applications, (app) => (
              <Card key={app.id} className="hover:shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle className="text-lg">{app.applicant_name}</CardTitle>
                    <Badge variant={app.status === 'approved' ? 'default' : app.status === 'rejected' ? 'destructive' : 'secondary'}>
                      {app.status}
                    </Badge>
                  </div>
                  <CardDescription className="font-mono text-xs">{app.address}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">申请金额: {app.requested_amount} | 情况: {app.situation}</p>
                  <RejectionNote reason={app.rejection_reason} />
                  
                  {app.status === 'pending' && (
                    <div className="flex gap-2 justify-end mt-4">
                      <Button size="sm" variant="outline" onClick={() => openRejectDialog('app', app.id)}>拒绝</Button>
                      <Button size="sm" onClick={() => handleApproveApp(app)} disabled={processingId === app.id}>
                        {processingId === app.id && <Loader2 className="w-4 h-4 animate-spin mr-2"/>} 批准
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ), "暂无受助人申请")}
          </TabsContent>

          {/* 2. 商户板块 (已改造为三栏式) */}
          <TabsContent value="merchants">
            {renderStatusTabs(merchants, (merchant) => (
              <Card key={merchant.id} className="hover:shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {merchant.store_name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Users className="w-3 h-3" /> {merchant.profiles?.full_name || "未知用户"}
                        <span className="text-border">|</span>
                        <Wallet className="w-3 h-3" /> 
                        {merchant.profiles?.wallet_address 
                          ? merchant.profiles.wallet_address.slice(0,8) + '...' + merchant.profiles.wallet_address.slice(-6)
                          : <span className="text-destructive">未绑定钱包</span>}
                      </div>
                    </div>
                    <Badge variant={merchant.status === 'approved' ? 'default' : merchant.status === 'rejected' ? 'destructive' : 'secondary'}>
                      {merchant.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{merchant.description}</p>
                  <RejectionNote reason={merchant.rejection_reason} />

                  {merchant.status === 'pending' && (
                    <div className="flex gap-2 justify-end mt-4">
                      <Button size="sm" variant="outline" onClick={() => openRejectDialog('merchant', merchant.id)}>拒绝</Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleApproveMerchant(merchant)} 
                        disabled={processingId === merchant.id || !merchant.profiles?.wallet_address}
                      >
                        {processingId === merchant.id && <Loader2 className="w-4 h-4 animate-spin mr-2"/>} 批准入驻
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ), "暂无商户申请")}
          </TabsContent>

          {/* 3. NGO 板块 (已改造为三栏式) */}
          <TabsContent value="ngos">
            {renderStatusTabs(ngos, (ngo) => (
              <Card key={ngo.id} className="hover:shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-primary" />
                        {ngo.organization_name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{ngo.organization_type}</span>
                        <span className="text-border">|</span>
                        <Wallet className="w-3 h-3" /> 
                        {ngo.profiles?.wallet_address 
                          ? ngo.profiles.wallet_address.slice(0,8) + '...' + ngo.profiles.wallet_address.slice(-6)
                          : <span className="text-destructive">未绑定钱包</span>}
                      </div>
                    </div>
                    <Badge variant={ngo.status === 'approved' ? 'default' : ngo.status === 'rejected' ? 'destructive' : 'secondary'}>
                      {ngo.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mb-2">
                    <p>邮箱: {ngo.contact_email}</p>
                    <p>电话: {ngo.contact_phone}</p>
                  </div>
                  <RejectionNote reason={ngo.rejection_reason} />

                  {ngo.status === 'pending' && (
                    <div className="flex gap-2 justify-end mt-4">
                      <Button size="sm" variant="outline" onClick={() => openRejectDialog('ngo', ngo.id)}>拒绝</Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleApproveNGO(ngo)} 
                        disabled={processingId === ngo.id || !ngo.profiles?.wallet_address}
                      >
                        {processingId === ngo.id && <Loader2 className="w-4 h-4 animate-spin mr-2"/>} 批准认证
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ), "暂无 NGO 申请")}
          </TabsContent>

          {/* 4. 黑名单板块 (保持不变) */}
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
                  <Button disabled={!blacklistAddress}>
                    添加到黑名单 (演示)
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">暂无黑名单数据</div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>拒绝申请</DialogTitle>
            <DialogDescription>请输入拒绝的理由，此内容将对用户可见。</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="请输入拒绝理由..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>取消</Button>
            <Button variant="destructive" onClick={confirmReject} disabled={!rejectReason.trim()}>确认拒绝</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlatformAdmin;
