import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Shield, CheckCircle, XCircle, Plus, ArrowLeft, Loader2, FileText, Building2, Wallet, RefreshCw, Eye, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWeb3 } from "@/hooks/useWeb3";
import { useContracts } from "@/hooks/useContracts";
import { useContractEvents } from "@/hooks/useContractEvents";
import { ethers } from "ethers";

// --- 类型定义 ---

interface Application {
  id: string;
  applicant_name: string;
  situation: string;
  requested_amount: number;
  status: string;
  created_at: string;
  project_id: string | null;
}

// 链上项目结构
interface ChainProject {
  id: number;
  title: string;
  description: string;
  category: string;
  budget: string;          // 目标金额 (ETH)
  donatedAmount: string;   // 已捐赠 (ETH)
  remainingFunds: string;  // 剩余可用 (ETH)
  deposit: string;         // 押金 (ETH)
  status: number;          // 0:None, 1:Active, 2:Closed
  ngo: string;
}

// 资金分配记录
interface AllocationRecord {
  beneficiary: string;
  amount: string;
  timestamp: string;
  txHash: string;
}

const NGO = () => {
  const [ngoStatus, setNgoStatus] = useState<"loading" | "register" | "pending" | "approved" | "rejected">("loading");
  const [selectedTab, setSelectedTab] = useState<"applications" | "projects" | "allocations">("applications");
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [chainProjects, setChainProjects] = useState<ChainProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [organizerId, setOrganizerId] = useState<string | null>(null);

  // 详情弹窗状态
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ChainProject | null>(null);
  const [allocations, setAllocations] = useState<AllocationRecord[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // 注册表单
  const [regForm, setRegForm] = useState({
    name: "",
    type: "",
    licenseId: "",
    email: "",
    phone: "",
    description: "",
    stakeAmount: "100", 
  });

  // 项目创建表单
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    category: "",
    target_amount: "",
    beneficiary_count: "",
    image_url: "",
  });

  const navigate = useNavigate();
  const { toast } = useToast();
  const { account, connectWallet } = useWeb3();
  const contracts = useContracts();
  const { events } = useContractEvents();

  // --- 1. 初始化 ---
  useEffect(() => {
    checkNGOStatus();
  }, [account]);

  useEffect(() => {
    if (ngoStatus === "approved") {
      if (selectedTab === "applications") fetchApplications();
      if (selectedTab === "projects") fetchChainProjects();
    }
  }, [selectedTab, ngoStatus, organizerId, contracts.projectVaultManager]);

  // 监听链上事件自动刷新
  useEffect(() => {
    // 监听创建项目或分配资金事件
    const shouldRefresh = events.some(e => 
      e.type === "ProjectCreated" || 
      e.type === "ProjectFundsAllocatedToBeneficiary" || 
      e.type === "ProjectDonationReceived"
    );

    if (shouldRefresh && ngoStatus === "approved") {
      if (selectedTab === "projects") fetchChainProjects();
      // 如果正在查看详情，也刷新详情里的分配记录
      if (detailsOpen && selectedProject) handleShowDetails(selectedProject);
    }
  }, [events]);

  // --- 数据获取 ---

  const checkNGOStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setNgoStatus("register");
        return;
      }

      const { data: organizer } = await supabase
        .from("organizers")
        .select("id, status")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!organizer) {
        setNgoStatus("register");
      } else {
        setNgoStatus(organizer.status as any);
        setOrganizerId(organizer.id);
      }
    } catch (error) {
      console.error("Check status error:", error);
      setNgoStatus("register");
    }
  };

  const fetchApplications = async () => {
    if (!organizerId) return;
    setLoading(true);
    try {
      const { data: projectIds } = await supabase.from("projects").select("id").eq("organizer_id", organizerId);
      if (projectIds && projectIds.length > 0) {
        const { data: apps } = await supabase
          .from("applications")
          .select("*")
          .in("project_id", projectIds.map(p => p.id))
          .order("created_at", { ascending: false });
        setApplications(apps || []);
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ 获取链上项目列表 (根据 ProjectCreated 事件)
  const fetchChainProjects = async () => {
    if (!contracts.projectVaultManager || !account) return;
    setLoading(true);
    try {
      // 1. 过滤出当前 NGO 创建的所有 ProjectCreated 事件
      // filter: ProjectCreated(uint256 indexed projectId, address indexed ngoAddr, ...)
      const filter = contracts.projectVaultManager.filters.ProjectCreated(null, account);
      const logs = await contracts.projectVaultManager.queryFilter(filter);
      
      const loadedProjects: ChainProject[] = [];

      // 2. 遍历事件，根据 ID 查询最新状态
      for (const log of logs) {
        const pid = log.args?.projectId;
        if (pid !== undefined) {
          const pData = await contracts.projectVaultManager.projects(pid);
          // Struct: id, ngoAddr, manager, budget, deposit, donatedAmount, remainingFunds, status, title...
          loadedProjects.push({
            id: pData.id.toNumber(),
            title: pData.title,
            description: pData.description,
            category: pData.categoryTag,
            budget: ethers.utils.formatEther(pData.budget),
            donatedAmount: ethers.utils.formatEther(pData.donatedAmount),
            remainingFunds: ethers.utils.formatEther(pData.remainingFunds),
            deposit: ethers.utils.formatEther(pData.deposit),
            status: pData.status, // 1=Active
            ngo: pData.ngoAddr
          });
        }
      }
      // 按 ID 倒序排列
      setChainProjects(loadedProjects.sort((a, b) => b.id - a.id));
    } catch (error) {
      console.error("Fetch chain projects error:", error);
      toast({ title: "获取链上数据失败", description: "请检查网络连接", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ✅ 获取项目详情 & 资金分配记录
  const handleShowDetails = async (project: ChainProject) => {
    setSelectedProject(project);
    setDetailsOpen(true);
    setLoadingDetails(true);

    if (!contracts.projectVaultManager) return;

    try {
      // 1. 重新获取该项目的最新资金状态 (防止列表数据滞后)
      const pData = await contracts.projectVaultManager.projects(project.id);
      setSelectedProject({
        ...project,
        donatedAmount: ethers.utils.formatEther(pData.donatedAmount),
        remainingFunds: ethers.utils.formatEther(pData.remainingFunds),
      });

      // 2. 查询资金分配事件 (ProjectFundsAllocatedToBeneficiary)
      // event ProjectFundsAllocatedToBeneficiary(uint256 indexed projectId, address indexed beneficiary, uint256 amount, uint256 timestamp);
      const filter = contracts.projectVaultManager.filters.ProjectFundsAllocatedToBeneficiary(project.id);
      const logs = await contracts.projectVaultManager.queryFilter(filter);

      const records: AllocationRecord[] = logs.map(log => ({
        beneficiary: log.args?.beneficiary || "",
        amount: ethers.utils.formatEther(log.args?.amount || 0),
        timestamp: new Date((log.args?.timestamp.toNumber() || 0) * 1000).toLocaleString(),
        txHash: log.transactionHash
      })).reverse(); // 最新的在前面

      setAllocations(records);

    } catch (error) {
      console.error("Fetch details error:", error);
      toast({ title: "获取详情失败", variant: "destructive" });
    } finally {
      setLoadingDetails(false);
    }
  };

  // --- 操作逻辑 ---

  const handleRegisterNGO = async () => {
    if (!account || !contracts.ngoRegistry || !contracts.mockToken) return;
    if (!regForm.name || !regForm.licenseId || !regForm.stakeAmount) {
      toast({ title: "信息不完整", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const stakeWei = ethers.utils.parseEther(regForm.stakeAmount);

      toast({ title: "步骤 1/3", description: "正在授权支付押金..." });
      const approveTx = await contracts.mockToken.approve(contracts.ngoRegistry.address, stakeWei);
      await approveTx.wait();

      toast({ title: "步骤 2/3", description: "正在链上注册..." });
      const registerTx = await contracts.ngoRegistry.registerNGO(regForm.name, regForm.licenseId, stakeWei);
      await registerTx.wait();

      toast({ title: "步骤 3/3", description: "提交审核申请..." });
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("organizers").insert({
        user_id: user?.id,
        organization_name: regForm.name,
        organization_type: regForm.type || "General",
        registration_number: regForm.licenseId,
        contact_email: regForm.email,
        contact_phone: regForm.phone,
        description: regForm.description,
        status: "pending"
      });

      toast({ title: "注册成功", description: "申请已提交，请等待平台管理员审核" });
      setNgoStatus("pending");
    } catch (error: any) {
      toast({ title: "注册失败", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!organizerId) return;
    if (!contracts.projectVaultManager || !contracts.mockToken || !account) {
      toast({ title: "合约未连接", description: "请确保钱包已连接且在正确网络", variant: "destructive" });
      return;
    }

    const budget = parseFloat(newProject.target_amount);
    if (!newProject.title || isNaN(budget) || budget <= 0) {
      toast({ title: "请输入有效的标题和目标金额", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const budgetWei = ethers.utils.parseEther(budget.toString());
      const requiredDepositWei = budgetWei.mul(120).div(100);
      const requiredDepositEth = ethers.utils.formatEther(requiredDepositWei);

      toast({ title: "步骤 1/3", description: `需质押 ${requiredDepositEth} MUSD (120% 保证金)，请授权。` });
      const approveTx = await contracts.mockToken.approve(contracts.projectVaultManager.address, requiredDepositWei);
      await approveTx.wait();

      toast({ title: "步骤 2/3", description: "正在链上创建项目..." });
      const createTx = await contracts.projectVaultManager.createProject(
        budgetWei,
        newProject.title,
        newProject.description,
        newProject.category,
        requiredDepositWei
      );
      await createTx.wait();

      toast({ title: "步骤 3/3", description: "同步数据..." });
      await supabase.from("projects").insert({
        organizer_id: organizerId,
        title: newProject.title,
        description: newProject.description,
        category: newProject.category,
        target_amount: budget,
        beneficiary_count: parseInt(newProject.beneficiary_count) || 0,
        image_url: newProject.image_url || null,
        status: "active",
      });

      toast({ title: "项目创建成功！" });
      setNewProject({ title: "", description: "", category: "", target_amount: "", beneficiary_count: "", image_url: "" });
      fetchChainProjects(); // 刷新链上列表

    } catch (error: any) {
      console.error("Create project error:", error);
      toast({ title: "创建失败", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveApplication = async (appId: string) => { /* ...省略数据库操作... */ };
  const handleRejectApplication = async (appId: string) => { /* ...省略数据库操作... */ };

  // --- 视图渲染 ---

  const renderRegisterView = () => (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader><CardTitle>注册 NGO</CardTitle><CardDescription>发起项目需先验证资质并缴纳押金。</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          {!account ? <Button onClick={connectWallet} className="w-full">连接钱包</Button> : (
            <>
               <div className="grid grid-cols-2 gap-4">
                <Input placeholder="机构名称" value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} />
                <Select onValueChange={v => setRegForm({...regForm, type: v})}><SelectTrigger><SelectValue placeholder="类型"/></SelectTrigger><SelectContent><SelectItem value="Education">教育</SelectItem><SelectItem value="Medical">医疗</SelectItem></SelectContent></Select>
              </div>
              <Input placeholder="执照编号" value={regForm.licenseId} onChange={e => setRegForm({...regForm, licenseId: e.target.value})} />
              <Input type="number" placeholder="押金 (MockToken)" value={regForm.stakeAmount} onChange={e => setRegForm({...regForm, stakeAmount: e.target.value})} />
              <Button className="w-full" onClick={handleRegisterNGO} disabled={loading}>{loading ? <Loader2 className="animate-spin"/> : "提交申请"}</Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderDashboard = () => (
    <>
      <div className="text-center mb-12">
        <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-4">NGO 管理中心</h1>
      </div>

      <div className="flex gap-4 mb-8 justify-center">
        <Button variant={selectedTab === "applications" ? "default" : "outline"} onClick={() => setSelectedTab("applications")}>审核申请</Button>
        <Button variant={selectedTab === "projects" ? "default" : "outline"} onClick={() => setSelectedTab("projects")}>项目管理</Button>
      </div>

      {selectedTab === "projects" && (
         <div className="max-w-5xl mx-auto space-y-6">
           {/* 创建表单 (略微简化展示) */}
           <Card className="border-primary/20 shadow-lg">
             <CardHeader className="bg-primary/5"><CardTitle>发起新项目</CardTitle></CardHeader>
             <CardContent className="space-y-4 pt-6">
               <div className="grid grid-cols-2 gap-4">
                 <Input value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} placeholder="项目标题" />
                 <Input type="number" value={newProject.target_amount} onChange={e => setNewProject({...newProject, target_amount: e.target.value})} placeholder="目标金额 (ETH)" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <Select onValueChange={v => setNewProject({...newProject, category: v})}><SelectTrigger><SelectValue placeholder="类别"/></SelectTrigger><SelectContent><SelectItem value="education">教育</SelectItem><SelectItem value="medical">医疗</SelectItem></SelectContent></Select>
                  <Input type="number" value={newProject.beneficiary_count} onChange={e => setNewProject({...newProject, beneficiary_count: e.target.value})} placeholder="预计受助人数" />
               </div>
               <Textarea value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} placeholder="描述..." />
               <Button onClick={handleCreateProject} disabled={loading} className="w-full">{loading ? <Loader2 className="animate-spin"/> : <Plus className="mr-2 w-4 h-4"/>} 创建项目 (需押金)</Button>
             </CardContent>
           </Card>

           {/* 链上项目列表 */}
           <div className="space-y-4">
             <h3 className="text-xl font-bold flex items-center gap-2"><RefreshCw className="w-5 h-5"/> 链上项目列表</h3>
             {loading ? <div className="text-center py-8"><Loader2 className="w-8 h-8 animate-spin mx-auto"/></div> : 
               chainProjects.length === 0 ? <div className="text-center text-muted-foreground py-8">暂无项目</div> : 
               chainProjects.map(p => (
                 <Card key={p.id} className="hover:shadow-md transition-shadow">
                   <CardHeader className="pb-2">
                     <div className="flex justify-between items-center">
                       <div>
                         <CardTitle className="text-lg">{p.title}</CardTitle>
                         <Badge variant={p.status === 1 ? "default" : "secondary"}>{p.status === 1 ? "进行中" : "已结束"}</Badge>
                       </div>
                       <Button variant="outline" size="sm" onClick={() => handleShowDetails(p)}>
                         <Eye className="w-4 h-4 mr-2"/> 查看详情 & 资金流向
                       </Button>
                     </div>
                     <CardDescription>ID: {p.id} | {p.category}</CardDescription>
                   </CardHeader>
                   <CardContent>
                     <div className="space-y-2">
                       <div className="flex justify-between text-sm">
                         <span>募集进度 ({((parseFloat(p.donatedAmount) / parseFloat(p.budget)) * 100).toFixed(1)}%)</span>
                         <span className="font-mono">{p.donatedAmount} / {p.budget} ETH</span>
                       </div>
                       <Progress value={(parseFloat(p.donatedAmount) / parseFloat(p.budget)) * 100} />
                       <div className="text-xs text-muted-foreground text-right mt-1">
                         剩余可用资金: {p.remainingFunds} ETH
                       </div>
                     </div>
                   </CardContent>
                 </Card>
               ))
             }
           </div>
         </div>
      )}
      
      {selectedTab === "applications" && (
        <div className="text-center py-12 text-muted-foreground">请在左侧数据库中查看申请列表 (此处逻辑保持不变)</div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20 px-6">
        <div className="container mx-auto">
          {ngoStatus !== "approved" && <Button variant="ghost" onClick={() => navigate("/")} className="mb-6"><ArrowLeft className="mr-2"/> 返回</Button>}
          {ngoStatus === "register" && renderRegisterView()}
          {ngoStatus === "pending" && <Card className="py-12 text-center"><CardContent>审核中...</CardContent></Card>}
          {ngoStatus === "approved" && renderDashboard()}
        </div>
      </main>

      {/* ✅ 项目详情弹窗 */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>项目详情: {selectedProject?.title}</DialogTitle>
