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
import { Shield, CheckCircle, XCircle, Plus, ArrowLeft, Loader2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Application {
  id: string;
  applicant_name: string;
  situation: string;
  requested_amount: number;
  status: string;
  created_at: string;
  project_id: string | null;
}

interface Project {
  id: string;
  title: string;
  category: string;
}

const NGO = () => {
  const [selectedTab, setSelectedTab] = useState<"applications" | "projects" | "allocations">("applications");
  const [applications, setApplications] = useState<Application[]>([]);
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [organizerId, setOrganizerId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // 项目创建表单状态
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    category: "",
    target_amount: "",
    beneficiary_count: "",
    image_url: "",
  });

  useEffect(() => {
    fetchData();
  }, [selectedTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "请先登录",
          description: "需要登录才能访问NGO功能",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // 获取organizer_id
      const { data: organizer } = await supabase
        .from("organizers")
        .select("id, status")
        .eq("user_id", user.id)
        .single();

      if (!organizer) {
        toast({
          title: "权限不足",
          description: "您还不是已认证的NGO机构",
          variant: "destructive",
        });
        return;
      }

      if (organizer.status !== "approved") {
        toast({
          title: "等待审核",
          description: "您的NGO机构正在审核中",
        });
        return;
      }

      setOrganizerId(organizer.id);

      if (selectedTab === "applications") {
        // 获取申请列表
        const { data: projectIds } = await supabase
          .from("projects")
          .select("id")
          .eq("organizer_id", organizer.id);

        if (projectIds && projectIds.length > 0) {
          const { data: apps } = await supabase
            .from("applications")
            .select("*")
            .in("project_id", projectIds.map(p => p.id))
            .order("created_at", { ascending: false });

          setApplications(apps || []);
        }
      } else if (selectedTab === "projects") {
        // 获取我的项目
        const { data: projects } = await supabase
          .from("projects")
          .select("id, title, category")
          .eq("organizer_id", organizer.id);

        setMyProjects(projects || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveApplication = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from("applications")
        .update({ status: "approved" })
        .eq("id", applicationId);

      if (error) throw error;

      toast({
        title: "审核通过",
        description: "申请已批准",
      });
      fetchData();
    } catch (error) {
      toast({
        title: "操作失败",
        description: "无法批准申请",
        variant: "destructive",
      });
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from("applications")
        .update({ status: "rejected" })
        .eq("id", applicationId);

      if (error) throw error;

      toast({
        title: "已拒绝",
        description: "申请已被拒绝",
      });
      fetchData();
    } catch (error) {
      toast({
        title: "操作失败",
        description: "无法拒绝申请",
        variant: "destructive",
      });
    }
  };

  const handleCreateProject = async () => {
    if (!organizerId) return;

    try {
      const { error } = await supabase.from("projects").insert({
        organizer_id: organizerId,
        title: newProject.title,
        description: newProject.description,
        category: newProject.category,
        target_amount: parseFloat(newProject.target_amount),
        beneficiary_count: parseInt(newProject.beneficiary_count),
        image_url: newProject.image_url || null,
        status: "active",
      });

      if (error) throw error;

      toast({
        title: "项目创建成功",
        description: "新的慈善项目已发布",
      });

      setNewProject({
        title: "",
        description: "",
        category: "",
        target_amount: "",
        beneficiary_count: "",
        image_url: "",
      });
      fetchData();
    } catch (error) {
      toast({
        title: "创建失败",
        description: "无法创建项目，请检查信息",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6 hover:bg-accent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回主页
          </Button>

          <div className="text-center mb-12">
            <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">NGO机构管理</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              审核受助申请、创建慈善项目、管理资金分配
            </p>
          </div>

          <div className="flex gap-4 mb-8 justify-center flex-wrap">
            <Button
              variant={selectedTab === "applications" ? "default" : "outline"}
              onClick={() => setSelectedTab("applications")}
            >
              <FileText className="w-4 h-4 mr-2" />
              审核申请
            </Button>
            <Button
              variant={selectedTab === "projects" ? "default" : "outline"}
              onClick={() => setSelectedTab("projects")}
            >
              <Plus className="w-4 h-4 mr-2" />
              项目管理
            </Button>
            <Button
              variant={selectedTab === "allocations" ? "default" : "outline"}
              onClick={() => setSelectedTab("allocations")}
            >
              <Shield className="w-4 h-4 mr-2" />
              资金分配
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {selectedTab === "applications" && (
                <div className="grid md:grid-cols-2 gap-6">
                  {applications.length === 0 ? (
                    <div className="col-span-2 text-center py-12 text-muted-foreground">
                      暂无待审核的申请
                    </div>
                  ) : (
                    applications.map((app) => (
                      <Card key={app.id}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle>{app.applicant_name}</CardTitle>
                              <CardDescription>
                                申请时间: {new Date(app.created_at).toLocaleDateString()}
                              </CardDescription>
                            </div>
                            <Badge
                              variant={
                                app.status === "approved"
                                  ? "default"
                                  : app.status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {app.status === "approved"
                                ? "已批准"
                                : app.status === "rejected"
                                ? "已拒绝"
                                : "待审核"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-medium mb-1">困境描述:</p>
                              <p className="text-sm text-muted-foreground">{app.situation}</p>
                            </div>
                            <p className="text-sm">
                              <span className="font-medium">申请金额:</span>{" "}
                              <span className="text-primary font-bold">
                                {app.requested_amount} 元
                              </span>
                            </p>
                            {app.status === "pending" && (
                              <div className="flex gap-2 pt-2">
                                <Button
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => handleApproveApplication(app.id)}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  批准
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="flex-1"
                                  onClick={() => handleRejectApplication(app.id)}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  拒绝
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}

              {selectedTab === "projects" && (
                <div className="max-w-3xl mx-auto space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>创建慈善项目</CardTitle>
                      <CardDescription>
                        创建新的慈善项目，项目将在以太坊上生成捐助合约
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="title">项目标题 *</Label>
                        <Input
                          id="title"
                          value={newProject.title}
                          onChange={(e) =>
                            setNewProject({ ...newProject, title: e.target.value })
                          }
                          placeholder="例如：帮助山区女童重返校园"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">项目详情 *</Label>
                        <Textarea
                          id="description"
                          value={newProject.description}
                          onChange={(e) =>
                            setNewProject({ ...newProject, description: e.target.value })
                          }
                          placeholder="详细描述项目内容、目标和计划..."
                          rows={4}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="category">项目类别 *</Label>
                          <Select
                            value={newProject.category}
                            onValueChange={(value) =>
                              setNewProject({ ...newProject, category: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="选择类别" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="education">教育支持</SelectItem>
                              <SelectItem value="medical">医疗援助</SelectItem>
                              <SelectItem value="emergency">紧急救助</SelectItem>
                              <SelectItem value="livelihood">生计发展</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="target_amount">目标金额 (ETH) *</Label>
                          <Input
                            id="target_amount"
                            type="number"
                            step="0.01"
                            value={newProject.target_amount}
                            onChange={(e) =>
                              setNewProject({ ...newProject, target_amount: e.target.value })
                            }
                            placeholder="10"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="beneficiary_count">预计受助人数 *</Label>
                        <Input
                          id="beneficiary_count"
                          type="number"
                          value={newProject.beneficiary_count}
                          onChange={(e) =>
                            setNewProject({ ...newProject, beneficiary_count: e.target.value })
                          }
                          placeholder="50"
                        />
                      </div>
                      <div>
                        <Label htmlFor="image_url">项目图片URL（可选）</Label>
                        <Input
                          id="image_url"
                          value={newProject.image_url}
                          onChange={(e) =>
                            setNewProject({ ...newProject, image_url: e.target.value })
                          }
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      <Button
                        onClick={handleCreateProject}
                        className="w-full bg-gradient-primary"
                        disabled={
                          !newProject.title ||
                          !newProject.description ||
                          !newProject.category ||
                          !newProject.target_amount ||
                          !newProject.beneficiary_count
                        }
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        创建项目
                      </Button>
                    </CardContent>
                  </Card>

                  {myProjects.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>我的项目</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {myProjects.map((project) => (
                            <div
                              key={project.id}
                              className="p-3 border border-border rounded-lg hover:border-primary transition-colors"
                            >
                              <div className="font-medium">{project.title}</div>
                              <div className="text-sm text-muted-foreground mt-1">
                                {project.category}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {selectedTab === "allocations" && (
                <div className="max-w-3xl mx-auto">
                  <Card>
                    <CardHeader>
                      <CardTitle>资金分配管理</CardTitle>
                      <CardDescription>
                        追踪项目资金的分配和使用情况
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12 text-muted-foreground">
                        资金分配功能即将上线，敬请期待
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NGO;
