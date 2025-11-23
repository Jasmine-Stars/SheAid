import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  XCircle,
  AlertCircle,
  ShieldCheck
} from "lucide-react";

const auditorSchema = z.object({
  fullName: z.string()
    .trim()
    .min(2, { message: "姓名至少需要2个字符" })
    .max(50, { message: "姓名不能超过50个字符" }),
  organizationName: z.string()
    .trim()
    .max(100, { message: "机构名称不能超过100个字符" })
    .optional(),
  certificationNumber: z.string()
    .trim()
    .max(50, { message: "认证编号不能超过50个字符" })
    .optional(),
  expertiseAreas: z.string()
    .trim()
    .min(10, { message: "专业领域描述至少需要10个字符" })
    .max(500, { message: "专业领域描述不能超过500个字符" }),
  description: z.string()
    .trim()
    .min(50, { message: "个人简介至少需要50个字符" })
    .max(1000, { message: "个人简介不能超过1000个字符" }),
  contactEmail: z.string()
    .trim()
    .email({ message: "请输入有效的邮箱地址" })
    .max(255),
  contactPhone: z.string()
    .trim()
    .regex(/^1[3-9]\d{9}$/, { message: "请输入有效的手机号码" }),
});

type AuditorFormValues = z.infer<typeof auditorSchema>;

const BecomeAuditor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [existingApplication, setExistingApplication] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const form = useForm<AuditorFormValues>({
    resolver: zodResolver(auditorSchema),
    defaultValues: {
      fullName: "",
      organizationName: "",
      certificationNumber: "",
      expertiseAreas: "",
      description: "",
      contactEmail: "",
      contactPhone: "",
    },
  });

  useEffect(() => {
    const checkAuthAndApplication = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast({
            title: "请先登录",
            description: "您需要登录后才能申请成为审计员",
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }

        setUser(session.user);

        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          const { data: auditor } = await supabase
            .from("auditors")
            .select("*")
            .eq("user_id", profile.id)
            .maybeSingle();

          if (auditor) {
            setExistingApplication(auditor);
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuthAndApplication();
  }, [navigate, toast]);

  const onSubmit = async (data: AuditorFormValues) => {
    if (!user) {
      toast({
        title: "请先登录",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setIsLoading(true);
    try {
      const expertiseArray = data.expertiseAreas
        .split(',')
        .map(area => area.trim())
        .filter(area => area.length > 0);

      const { error } = await supabase
        .from("auditors")
        .insert({
          user_id: user.id,
          full_name: data.fullName,
          organization_name: data.organizationName || null,
          certification_number: data.certificationNumber || null,
          expertise_areas: expertiseArray,
          description: data.description,
          contact_email: data.contactEmail,
          contact_phone: data.contactPhone,
          status: "pending",
        });

      if (error) {
        console.error("Error submitting application:", error);
        toast({
          title: "提交失败",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "申请已提交",
          description: "我们将在3-5个工作日内审核您的申请",
        });
        
        window.location.reload();
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "发生错误",
        description: "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  if (existingApplication) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-6 max-w-4xl">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-6 h-6 text-primary" />
                  申请状态
                </CardTitle>
                <CardDescription>您的审计员申请信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-semibold mb-1">申请状态</div>
                    <div className="text-sm text-muted-foreground">
                      提交时间：{new Date(existingApplication.created_at).toLocaleString('zh-CN')}
                    </div>
                  </div>
                  {existingApplication.status === "pending" && (
                    <Badge variant="outline" className="gap-2">
                      <Clock className="w-4 h-4" />
                      审核中
                    </Badge>
                  )}
                  {existingApplication.status === "approved" && (
                    <Badge className="gap-2 bg-green-500">
                      <CheckCircle2 className="w-4 h-4" />
                      已通过
                    </Badge>
                  )}
                  {existingApplication.status === "rejected" && (
                    <Badge variant="destructive" className="gap-2">
                      <XCircle className="w-4 h-4" />
                      未通过
                    </Badge>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-3 bg-accent/50 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">姓名</div>
                      <div className="font-medium">{existingApplication.full_name}</div>
                    </div>
                    {existingApplication.organization_name && (
                      <div className="p-3 bg-accent/50 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">所属机构</div>
                        <div className="font-medium">{existingApplication.organization_name}</div>
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-accent/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">专业领域</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {existingApplication.expertise_areas?.map((area: string, i: number) => (
                        <Badge key={i} variant="secondary">{area}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-accent/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">个人简介</div>
                    <div className="text-sm">{existingApplication.description}</div>
                  </div>

                  {existingApplication.status === "rejected" && existingApplication.rejection_reason && (
                    <div className="p-4 border border-destructive/50 bg-destructive/10 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                        <div>
                          <div className="font-semibold text-destructive mb-1">拒绝原因</div>
                          <div className="text-sm">{existingApplication.rejection_reason}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {existingApplication.status === "approved" && (
                    <div className="p-4 border border-green-500/50 bg-green-500/10 rounded-lg">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                        <div>
                          <div className="font-semibold text-green-700 dark:text-green-400 mb-1">
                            恭喜！您已成为认证审计员
                          </div>
                          <div className="text-sm text-muted-foreground">
                            您现在可以进行项目和资金审计了
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              成为审计员
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              加入我们，为慈善项目提供专业审计服务，确保资金透明使用
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  申请信息
                </CardTitle>
                <CardDescription>
                  请如实填写您的专业信息，我们将在3-5个工作日内完成审核
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>姓名 *</FormLabel>
                          <FormControl>
                            <Input placeholder="请输入您的真实姓名" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="organizationName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>所属机构</FormLabel>
                          <FormControl>
                            <Input placeholder="如有请填写" {...field} />
                          </FormControl>
                          <FormDescription>
                            如果您隶属于某个审计机构或组织
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="certificationNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>职业认证编号</FormLabel>
                          <FormControl>
                            <Input placeholder="如CPA、CIA等认证编号" {...field} />
                          </FormControl>
                          <FormDescription>
                            提供相关职业认证将有助于加快审核
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expertiseAreas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>专业领域 *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="如：财务审计,区块链审计,公益项目审计（用逗号分隔）" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            请用逗号分隔多个专业领域
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>个人简介 *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="请详细描述您的专业背景、工作经验、专业技能等..."
                              className="min-h-[150px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            至少50个字符，最多1000个字符
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="contactEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>联系邮箱 *</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="your@email.com" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="contactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>联系电话 *</FormLabel>
                            <FormControl>
                              <Input 
                                type="tel" 
                                placeholder="13800138000" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(-1)}
                        className="flex-1"
                      >
                        返回
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={isLoading}
                        className="flex-1 bg-gradient-primary"
                      >
                        {isLoading ? "提交中..." : "提交申请"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BecomeAuditor;