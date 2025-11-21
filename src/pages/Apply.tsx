import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  TrendingUp,
  Heart,
  DollarSign
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const applicationSchema = z.object({
  name: z.string()
    .trim()
    .min(2, { message: "姓名至少需要2个字符" })
    .max(50, { message: "姓名不能超过50个字符" }),
  age: z.string()
    .min(1, { message: "请输入年龄" }),
  phone: z.string()
    .trim()
    .regex(/^1[3-9]\d{9}$/, { message: "请输入有效的手机号码" }),
  email: z.string()
    .trim()
    .email({ message: "请输入有效的邮箱地址" })
    .max(255, { message: "邮箱地址过长" }),
  address: z.string()
    .trim()
    .min(5, { message: "地址至少需要5个字符" })
    .max(200, { message: "地址不能超过200个字符" }),
  urgencyLevel: z.string()
    .min(1, { message: "请选择紧急程度" }),
  situation: z.string()
    .trim()
    .min(20, { message: "请详细描述您的情况，至少20个字符" })
    .max(2000, { message: "描述不能超过2000个字符" }),
  requestedAmount: z.string()
    .min(1, { message: "请输入申请金额" }),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

const Apply = () => {
  const [showProgress, setShowProgress] = useState(false);
  const { toast } = useToast();

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      name: "",
      age: "",
      phone: "",
      email: "",
      address: "",
      urgencyLevel: "",
      situation: "",
      requestedAmount: "",
    },
  });

  const onSubmit = (data: ApplicationFormValues) => {
    // Security: Removed PII logging - sensitive data should not be logged to console
    
    toast({
      title: "申请已提交",
      description: "我们将在48小时内审核您的申请",
    });

    form.reset();
    setShowProgress(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Hero Section */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              申请救助
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              我们致力于帮助每一位需要帮助的女性，请如实填写信息，我们会保护您的隐私
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Application Form */}
            <Card className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  申请信息
                </CardTitle>
                <CardDescription>请详细填写以下信息以便我们评估</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            姓名
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="请输入您的姓名" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>年龄</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="请输入年龄" {...field} min="1" max="120" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            联系电话
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="请输入手机号码" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            电子邮箱
                          </FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            居住地址
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="请输入详细地址" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="urgencyLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            紧急程度
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="请选择紧急程度" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="urgent">紧急 - 需要立即救助</SelectItem>
                              <SelectItem value="high">高 - 一周内需要帮助</SelectItem>
                              <SelectItem value="medium">中 - 一个月内需要帮助</SelectItem>
                              <SelectItem value="low">低 - 长期规划</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="requestedAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>申请金额 (ETH)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              step="0.01" 
                              min="0"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            请根据实际需求填写
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="situation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>详细情况说明</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="请详细描述您遇到的困难和需要帮助的具体情况..."
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            至少20个字符，最多2000个字符
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit"
                      className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                      size="lg"
                    >
                      提交申请
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Progress & Impact Section */}
            <div className="space-y-6">
              {/* Relief Progress */}
              <Card className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    救济进度
                  </CardTitle>
                  <CardDescription>追踪您的申请和救助进度</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {showProgress ? (
                    <>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                          <div>
                            <div className="font-medium">申请已提交</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date().toLocaleString('zh-CN')}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <Clock className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <div className="font-medium">等待审核</div>
                            <div className="text-sm text-muted-foreground">
                              预计48小时内完成
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 opacity-50">
                          <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                          <div>
                            <div className="font-medium">资金分配</div>
                            <div className="text-sm text-muted-foreground">待审核通过</div>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 opacity-50">
                          <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                          <div>
                            <div className="font-medium">救助实施</div>
                            <div className="text-sm text-muted-foreground">待资金到位</div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      提交申请后，您可以在这里追踪进度
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Funding Details */}
              <Card className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    资金使用详情
                  </CardTitle>
                  <CardDescription>透明化的资金分配和使用情况</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
                      <span className="text-sm font-medium">总申请金额</span>
                      <Badge variant="outline">待审核</Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">已分配资金</span>
                        <span className="font-semibold">0 ETH</span>
                      </div>
                      <Progress value={0} className="h-2" />
                    </div>
                  </div>

                  <div className="pt-2 space-y-2">
                    <div className="text-sm font-medium mb-2">资金用途分类</div>
                    <div className="space-y-2">
                      {[
                        { category: "医疗救助", amount: "-", color: "bg-blue-500" },
                        { category: "生活补助", amount: "-", color: "bg-green-500" },
                        { category: "法律援助", amount: "-", color: "bg-purple-500" },
                        { category: "心理咨询", amount: "-", color: "bg-pink-500" },
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${item.color}`} />
                            <span className="text-sm">{item.category}</span>
                          </div>
                          <span className="text-sm font-medium">{item.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Impact & Changes */}
              <Card className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    带来的改变
                  </CardTitle>
                  <CardDescription>记录救助带来的积极影响</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-accent/30 rounded-lg">
                      <Heart className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <div className="font-medium mb-1">成功案例分享</div>
                        <p className="text-sm text-muted-foreground">
                          通过救助，许多受助者重新获得了生活的希望，找到了工作，重建了家庭...
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 border rounded-lg text-center">
                        <div className="text-2xl font-bold text-primary mb-1">856</div>
                        <div className="text-xs text-muted-foreground">累计受助人数</div>
                      </div>
                      <div className="p-3 border rounded-lg text-center">
                        <div className="text-2xl font-bold text-primary mb-1">94%</div>
                        <div className="text-xs text-muted-foreground">满意度</div>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground text-center pt-2">
                      您的申请通过后，我们会持续跟踪并记录帮助您的每一步
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

export default Apply;
