import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Heart, ArrowLeft, User, DollarSign, Building, Package, Search } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const authSchema = z.object({
  email: z.string().trim().email({ message: "请输入有效的邮箱地址" }).max(255),
  password: z.string().min(6, { message: "密码至少需要6个字符" }),
  fullName: z.string().trim().min(2, { message: "姓名至少需要2个字符" }).max(50).optional(),
  role: z.enum(["beneficiary", "donor", "ngo", "merchant", "auditor"]).optional(),
});

type AuthFormValues = z.infer<typeof authSchema>;

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      role: "donor",
    },
  });

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignIn = async (data: AuthFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        toast({
          title: "登录失败",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "登录成功",
          description: "欢迎回来！",
        });
      }
    } catch (error) {
      toast({
        title: "发生错误",
        description: "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (data: AuthFormValues) => {
    setIsLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            role: data.role,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast({
            title: "该邮箱已注册",
            description: "请使用登录功能或使用其他邮箱",
            variant: "destructive",
          });
        } else {
          toast({
            title: "注册失败",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        // Insert user role into user_roles table
        if (authData.user && data.role) {
          await supabase.from("user_roles").insert({
            user_id: authData.user.id,
            role: data.role,
          });
        }
        
        toast({
          title: "注册成功",
          description: "欢迎加入SheAid！",
        });
      }
    } catch (error) {
      toast({
        title: "发生错误",
        description: "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background flex items-center justify-center p-6">
      <Link to="/" className="fixed top-6 left-6 flex items-center gap-2 text-foreground hover:text-primary transition-colors">
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">返回主页</span>
      </Link>
      
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Heart className="w-12 h-12 text-primary fill-primary" />
          </div>
          <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
            欢迎来到 SheAid
          </CardTitle>
          <CardDescription>
            女性安全捐助链 - 用区块链技术传递温暖
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">登录</TabsTrigger>
              <TabsTrigger value="signup">注册</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSignIn)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>邮箱</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>密码</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-primary" 
                    disabled={isLoading}
                  >
                    {isLoading ? "登录中..." : "登录"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="signup">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSignUp)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>选择您的角色</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-2 gap-3"
                          >
                            <div className="relative">
                              <RadioGroupItem value="beneficiary" id="beneficiary" className="peer sr-only" />
                              <label
                                htmlFor="beneficiary"
                                className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-border p-3 hover:border-primary cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 transition-all"
                              >
                                <User className="w-5 h-5" />
                                <span className="text-xs font-medium">受助人</span>
                              </label>
                            </div>
                            <div className="relative">
                              <RadioGroupItem value="donor" id="donor" className="peer sr-only" />
                              <label
                                htmlFor="donor"
                                className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-border p-3 hover:border-primary cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 transition-all"
                              >
                                <DollarSign className="w-5 h-5" />
                                <span className="text-xs font-medium">捐助者</span>
                              </label>
                            </div>
                            <div className="relative">
                              <RadioGroupItem value="ngo" id="ngo" className="peer sr-only" />
                              <label
                                htmlFor="ngo"
                                className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-border p-3 hover:border-primary cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 transition-all"
                              >
                                <Building className="w-5 h-5" />
                                <span className="text-xs font-medium">NGO机构</span>
                              </label>
                            </div>
                            <div className="relative">
                              <RadioGroupItem value="merchant" id="merchant" className="peer sr-only" />
                              <label
                                htmlFor="merchant"
                                className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-border p-3 hover:border-primary cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 transition-all"
                              >
                                <Package className="w-5 h-5" />
                                <span className="text-xs font-medium">商户</span>
                              </label>
                            </div>
                            <div className="relative col-span-2">
                              <RadioGroupItem value="auditor" id="auditor" className="peer sr-only" />
                              <label
                                htmlFor="auditor"
                                className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-border p-3 hover:border-primary cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 transition-all"
                              >
                                <Search className="w-5 h-5" />
                                <span className="text-xs font-medium">审计员</span>
                              </label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>姓名</FormLabel>
                        <FormControl>
                          <Input placeholder="请输入您的姓名" {...field} />
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
                        <FormLabel>邮箱</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>密码</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="至少6个字符" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-primary" 
                    disabled={isLoading}
                  >
                    {isLoading ? "注册中..." : "注册"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
