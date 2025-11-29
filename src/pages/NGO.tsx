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

interface Application {
  id: string;
  applicant_name: string;
  situation: string;
  requested_amount: number;
  status: string;
  created_at: string;
  project_id: string | null;
}

// Supabase 中的项目结构
interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  target_amount: number;
  current_amount?: number;
  beneficiary_count?: number;
  created_at?: string;
  image_url?: string | null;
}

// 链上详情数据结构
interface ChainDetails {
  id: number;
  donatedAmount: string;
  remainingFunds: string;
  budget: string;
  allocations: {
    beneficiary: string;
    amount: string;
    timestamp: string;
    txHash: string;
  }[];
}

const NGO = () => {
  const [ngoStatus, setNgoStatus] = useState<"loading" | "register" | "pending" | "approved" | "rejected">("loading");
  const [selectedTab, setSelectedTab] = useState<"applications" | "projects" | "allocations">("applications");
  const [applications, setApplications] = useState<Application[]>([]);
  const [myProjects, setMyProjects] = useState<Project[]>([]); // 保持使用 Supabase 数据源
  const [loading, setLoading] = useState(false);
  const [organizerId, setOrganizerId] = useState<string | null>(null);
  
  // --- 新增：详情弹窗状态 ---
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [chainDetails, setChainDetails] = useState<ChainDetails | null>(null);
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

  useEffect(() => {
    checkNGOStatus();
  }, [account]);

  useEffect(() => {
    if (ngoStatus === "approved" && organizerId) {
      fetchData(); // 保持原有的 Supabase 数据拉取逻辑
    }
  }, [selectedTab, ngoStatus, organizerId]);

  // --- 新增：监听链上事件以实时更新详情 ---
  useEffect(() => {
    const relevantEvents = ["ProjectDonationReceived", "ProjectFundsAllocatedToBeneficiary"];
    const hasUpdate = events.some(e => relevantEvents.includes(e.type));
    
    // 如果当前正打开着详情页，且有相关事件发生，则刷新链上数据
    if (hasUpdate && detailsOpen && selectedProject) {
      console.log("Detected chain event, refreshing details...");
      fetchChainDetails(selectedProject);
    }
  }, [events]);

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

  // 保持原有的 fetchData (从 Supabase 读取列表)
  const fetchData = async () => {
    setLoading(true);
    try {
      if (selectedTab === "applications") {
        const { data: projectIds } = await supabase.from("projects").select("id").eq("organizer_id", organizerId);
        if (projectIds && projectIds.length > 0) {
          const { data: apps } = await supabase
            .from("applications")
            .select("*")
            .in("project_id", projectIds.map(p => p.id))
            .order("created_at", { ascending: false });
          setApplications(apps || []);
        }
      } else if (selectedTab === "projects") {
        const { data: projects } = await supabase
          .from("projects")
          .select("*")
          .eq("organizer_id", organizerId)
          .order("created_at", { ascending: false });
        setMyProjects(projects || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- 新增：获取链上详情 (核心逻辑) ---
  const handleOpenDetails = (project: Project) => {
    setSelectedProject(project);
    setDetailsOpen(true);
    fetchChainDetails(project);
  };

  const fetchChainDetails = async (project: Project) => {
    if (!contracts.projectVaultManager || !account) return;
    setLoadingDetails(true);
    
    try {
      // 1. 找到链上对应的 Project ID
      // 策略：查找当前 NGO 创建的所有项目事件，匹配标题 (Title)
      // 注意：这要求 Supabase 里的标题和链上标题一致
      const filter = contracts.projectVaultManager.filters.ProjectCreated(null, account);
      const logs = await contracts.projectVaultManager.queryFilter(filter);
      
      // 找到标题匹配的那个事件
      const targetLog = logs.find(log => log.args?.title === project.title);
      
      if (!targetLog) {
        throw new Error("未在链上找到该项目，可能尚未同步或标题不匹配");
      }

      const chainId = targetLog.args?.projectId; // BigNumber

      // 2. 读取资金状态
      const pData = await contracts.projectVaultManager.projects(chainId);

      // 3. 读取分配记录
      const allocFilter = contracts.projectVaultManager.filters.ProjectFundsAllocatedToBeneficiary(chainId);
      const allocLogs = await contracts.projectVaultManager.queryFilter(allocFilter);
      
      const allocations = allocLogs.map(log => ({
        beneficiary: log.args?.beneficiary,
        amount: ethers.utils.formatEther(log.args?.amount),
        timestamp: new Date(log.args?.timestamp.toNumber() * 1000).toLocaleString(),
        txHash: log.transactionHash
      })).reverse();

      setChainDetails({
        id: chainId.toNumber(),
        donatedAmount: ethers.utils.formatEther(pData.donatedAmount),
        remainingFunds: ethers.utils.formatEther(pData.remainingFunds),
        budget: ethers.utils.formatEther(pData.budget),
        allocations: allocations
      });

    } catch (error: any) {
      console.error("Fetch chain details error:", error);
      toast({ 
        title: "链上数据同步中", 
        description: "暂时无法获取最新的资金数据，请稍后再试。",
        variant: "default" 
      });
      setChainDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  // --- 注册与创建逻辑 (保持修复后的版本) ---

  const handleRegisterNGO = async () => {
    if (!account || !contracts.ngoRegistry || !contracts.mockToken) return;
    if (!regForm.name || !regForm.licenseId || !regForm.stakeAmount) {
      toast({ title: "信息不完整", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const stakeWei = ethers.utils.parseEther(regForm.stakeAmount);
      const approveTx = await contracts.mockToken.approve(contracts.ngoRegistry.address, stakeWei);
      await approveTx.wait();

      const registerTx = await contracts.ngoRegistry.registerNGO(regForm.name, regForm.licenseId, stakeWei);
      await registerTx.wait();

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

      toast({ title: "注册成功", description: "已提交审核" });
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
      toast({ title: "合约未连接", variant: "destructive" });
      return;
    }

    const budget = parseFloat(newProject.target_amount);
    if (!newProject.title || isNaN(budget) || budget <= 0) {
      toast({ title: "请输入有效信息", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const budgetWei = ethers.utils.parseEther(budget.toString());
      const requiredDepositWei = budgetWei.mul(120).div(100);

      const approveTx = await contracts.mockToken.approve(contracts.projectVaultManager.address, requiredDepositWei);
      await approveTx.wait();

      const createTx = await contracts.projectVaultManager.createProject(
        budgetWei,
        newProject.title,
        newProject.description,
        newProject.category,
        requiredDepositWei
      );
      await createTx.wait();

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
      fetchData();
    } catch (error: any) {
      toast({ title: "创建失败", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ... 省略 Application approval logic，保持原样 ...
  const handleApproveApplication = async (id: string) => { 
    await supabase.from("applications").update({status: "approved"}).eq("id", id);
    setApplications(prev => prev.map(a => a.id === id ? {...a, status: "approved"} : a));
  };
  const handleRejectApplication = async (id: string) => { 
    await supabase.from("applications").update({status: "rejected"}).eq("id", id);
    setApplications(prev => prev.map(a => a.id === id ? {...a, status: "rejected"} : a));
  };


  // --- 渲染部分 ---

  const renderRegisterView = () => (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="w-6 h-6 text-primary" /> 注册 NGO</CardTitle></CardHeader>
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

      {!loading && selectedTab === "projects" && (
         <div className="max-w-5xl mx-auto space-y-6">
           {/* 创建表单 */}
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

           {/* 项目列表 (Supabase源) + 详情按钮 */}
           <div className="space-y-4">
             <h3 className="text-xl font-bold flex items-center gap-2"><RefreshCw className="w-5 h-5"/> 已发布项目</h3>
             {myProjects.length === 0 ? (
               <div className="text-center py-10 text-muted-foreground border rounded-lg">暂无发布记录</div>
             ) : (
               myProjects.map(p => (
                 <Card key={p.id} className="hover:shadow-md transition-shadow">
                   <CardHeader className="pb-2">
                     <div className="flex justify-between items-center">
                       <div>
                         <CardTitle className="text-lg">{p.title}</CardTitle>
                         <Badge variant="outline">{p.category}</Badge>
                       </div>
                       {/* ✅ 新增：详情按钮 */}
                       <Button variant="secondary" size="sm" onClick={() => handleOpenDetails(p)}>
                         <Eye className="w-4 h-4 mr-2"/> 实时详情 & 资金流向
                       </Button>
                     </div>
                     <CardDescription>目标: {p.target_amount} ETH</CardDescription>
                   </CardHeader>
                   <CardContent>
                     <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                   </CardContent>
                 </Card>
               ))
             )}
           </div>
         </div>
      )}

      {!loading && selectedTab === "applications" && (
        <div className="grid md:grid-cols-2 gap-6">
          {applications.map((app) => (
              <Card key={app.id}>
                <CardHeader>
                  <div className="flex justify-between">
                    <CardTitle>{app.applicant_name}</CardTitle>
                    <Badge variant={app.status === "approved" ? "default" : "secondary"}>{app.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{app.situation}</p>
                  {app.status === "pending" && (
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1" onClick={() => handleApproveApplication(app.id)}>批准</Button>
                      <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleRejectApplication(app.id)}>拒绝</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
          ))}
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20 px-6">
        <div className="container mx-auto">
          {ngoStatus !== "approved" && (
            <Button variant="ghost" onClick={() => navigate("/")} className="mb-6"><ArrowLeft className="mr-2"/> 返回</Button>
          )}
          {ngoStatus === "register" && renderRegisterView()}
          {ngoStatus === "pending" && <Card className="py-12 text-center"><CardContent>审核中...</CardContent></Card>}
          {ngoStatus === "approved" && renderDashboard()}
        </div>
      </main>

      {/* ✅ 新增：项目详情弹窗 (Dialog) */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>项目实时详情</DialogTitle>
            <DialogDescription>
              项目标题: <span className="font-bold text-primary">{selectedProject?.title}</span>
            </DialogDescription>
          </DialogHeader>
          
          {loadingDetails ? (
            <div className="py-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary"/></div>
          ) : chainDetails ? (
            <div className="space-y-6">
              {/* 资金仪表盘 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 border border-green-100 rounded-lg text-center">
                  <div className="text-sm text-muted-foreground">已募集资金</div>
                  <div className="text-2xl font-bold text-green-700">{chainDetails.donatedAmount} ETH</div>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-center">
                  <div className="text-sm text-muted-foreground">剩余可用资金</div>
                  <div className="text-2xl font-bold text-blue-700">{chainDetails.remainingFunds} ETH</div>
                </div>
              </div>

              {/* 进度条 */}
              <div className="space-y-2">
                 <div className="flex justify-between text-sm">
                   <span>募集进度</span>
                   <span className="font-mono">
                     {((parseFloat(chainDetails.donatedAmount) / (parseFloat(chainDetails.budget) || 1)) * 100).toFixed(1)}%
                   </span>
                 </div>
                 <Progress value={(parseFloat(chainDetails.donatedAmount) / (parseFloat(chainDetails.budget) || 1)) * 100} className="h-3" />
              </div>

              {/* 资金分配明细 */}
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2 mb-3 border-b pb-2">
                  <TrendingUp className="w-5 h-5 text-primary"/> 资金流向 (分配给受助者)
                </h3>
                {chainDetails.allocations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground bg-accent/10 rounded-lg">
                    暂无资金分配记录
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>受助人地址</TableHead>
                          <TableHead>金额</TableHead>
                          <TableHead>时间</TableHead>
                          <TableHead className="text-right">链上凭证</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {chainDetails.allocations.map((record, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-mono text-xs">{record.beneficiary}</TableCell>
                            <TableCell className="font-bold text-green-600">+{record.amount}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{record.timestamp}</TableCell>
                            <TableCell className="text-right">
                              <a href={`https://sepolia.etherscan.io/tx/${record.txHash}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-xs">
                                查看 Tx
                              </a>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-red-500">
              未找到对应的链上合约数据，请确认该项目是否已成功上链。
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default NGO;
