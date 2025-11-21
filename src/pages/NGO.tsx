import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, XCircle, Clock } from "lucide-react";

const NGO = () => {
  const [selectedTab, setSelectedTab] = useState<"verify" | "vouchers" | "privacy">("verify");

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">NGO机构管理</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              审核身份、签发代金券、维护隐私
            </p>
          </div>

          <div className="flex gap-4 mb-8 justify-center">
            <Button
              variant={selectedTab === "verify" ? "default" : "outline"}
              onClick={() => setSelectedTab("verify")}
            >
              身份审核
            </Button>
            <Button
              variant={selectedTab === "vouchers" ? "default" : "outline"}
              onClick={() => setSelectedTab("vouchers")}
            >
              代金券签发
            </Button>
            <Button
              variant={selectedTab === "privacy" ? "default" : "outline"}
              onClick={() => setSelectedTab("privacy")}
            >
              隐私维护
            </Button>
          </div>

          {selectedTab === "verify" && (
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { id: 1, name: "张三", status: "pending", documents: 3 },
                { id: 2, name: "李四", status: "verified", documents: 5 },
                { id: 3, name: "王五", status: "rejected", documents: 2 },
              ].map((application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{application.name}</CardTitle>
                        <CardDescription>申请ID: {application.id}</CardDescription>
                      </div>
                      <Badge
                        variant={
                          application.status === "verified"
                            ? "default"
                            : application.status === "rejected"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {application.status === "verified"
                          ? "已验证"
                          : application.status === "rejected"
                          ? "已拒绝"
                          : "待审核"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        已提交文件: {application.documents} 份
                      </p>
                      {application.status === "pending" && (
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            批准
                          </Button>
                          <Button size="sm" variant="destructive" className="flex-1">
                            <XCircle className="w-4 h-4 mr-1" />
                            拒绝
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {selectedTab === "vouchers" && (
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>签发救助代金券</CardTitle>
                <CardDescription>为审核通过的受助人签发援助凭证</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">受助人ID</label>
                  <Input placeholder="输入受助人ID" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">代金券金额</label>
                  <Input type="number" placeholder="输入金额" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">有效期（天）</label>
                  <Input type="number" placeholder="30" defaultValue="30" />
                </div>
                <Button className="w-full bg-gradient-primary">
                  签发代金券
                </Button>
              </CardContent>
            </Card>
          )}

          {selectedTab === "privacy" && (
            <div className="max-w-3xl mx-auto space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>隐私保护措施</CardTitle>
                  <CardDescription>确保受助人信息安全</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-accent/20 rounded-lg">
                    <div>
                      <h3 className="font-medium">端到端加密</h3>
                      <p className="text-sm text-muted-foreground">所有通信已加密</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-accent/20 rounded-lg">
                    <div>
                      <h3 className="font-medium">匿名化处理</h3>
                      <p className="text-sm text-muted-foreground">受助人身份已保护</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-accent/20 rounded-lg">
                    <div>
                      <h3 className="font-medium">访问日志监控</h3>
                      <p className="text-sm text-muted-foreground">实时监控异常访问</p>
                    </div>
                    <Clock className="w-5 h-5 text-yellow-500 animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NGO;
