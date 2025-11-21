import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Search, FileText, TrendingUp } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const Auditor = () => {
  const [selectedTab, setSelectedTab] = useState<"verify" | "challenge" | "reports">("verify");

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <Search className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">审计员控制台</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              验证交易、发起异常挑战、生成审计报告
            </p>
          </div>

          <div className="flex gap-4 mb-8 justify-center flex-wrap">
            <Button
              variant={selectedTab === "verify" ? "default" : "outline"}
              onClick={() => setSelectedTab("verify")}
            >
              交易验证
            </Button>
            <Button
              variant={selectedTab === "challenge" ? "default" : "outline"}
              onClick={() => setSelectedTab("challenge")}
            >
              异常挑战
            </Button>
            <Button
              variant={selectedTab === "reports" ? "default" : "outline"}
              onClick={() => setSelectedTab("reports")}
            >
              审计报告
            </Button>
          </div>

          {selectedTab === "verify" && (
            <div className="space-y-6">
              <Card className="max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle>交易验证工具</CardTitle>
                  <CardDescription>输入交易哈希验证区块链记录</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">交易哈希</label>
                    <div className="flex gap-2">
                      <Input placeholder="0x..." className="font-mono text-sm" />
                      <Button>
                        <Search className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    tx: "0xabcd...1234",
                    amount: "500 USDT",
                    status: "verified",
                    time: "2小时前",
                  },
                  {
                    tx: "0xefgh...5678",
                    amount: "1000 USDT",
                    status: "pending",
                    time: "5小时前",
                  },
                  {
                    tx: "0xijkl...9012",
                    amount: "300 USDT",
                    status: "suspicious",
                    time: "1天前",
                  },
                  {
                    tx: "0xmnop...3456",
                    amount: "750 USDT",
                    status: "verified",
                    time: "2天前",
                  },
                ].map((transaction) => (
                  <Card key={transaction.tx}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base font-mono">
                            {transaction.tx}
                          </CardTitle>
                          <CardDescription>{transaction.time}</CardDescription>
                        </div>
                        <Badge
                          variant={
                            transaction.status === "verified"
                              ? "default"
                              : transaction.status === "suspicious"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {transaction.status === "verified"
                            ? "已验证"
                            : transaction.status === "suspicious"
                            ? "可疑"
                            : "待审核"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg font-semibold mb-3">{transaction.amount}</p>
                      {transaction.status === "pending" && (
                        <Button size="sm" className="w-full">
                          立即验证
                        </Button>
                      )}
                      {transaction.status === "suspicious" && (
                        <Button size="sm" variant="destructive" className="w-full">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          发起挑战
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {selectedTab === "challenge" && (
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>发起异常挑战</CardTitle>
                <CardDescription>对可疑交易提交挑战申请</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">可疑交易哈希</label>
                  <Input placeholder="0x..." className="font-mono text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">异常类型</label>
                  <select className="w-full p-2 border border-border rounded-md bg-background">
                    <option>重复支付</option>
                    <option>金额异常</option>
                    <option>地址可疑</option>
                    <option>时间异常</option>
                    <option>其他</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">详细说明</label>
                  <Textarea
                    placeholder="详细描述异常情况和证据..."
                    rows={5}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">证据文件</label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                    <FileText className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">上传证据文件</p>
                  </div>
                </div>
                <Button className="w-full bg-gradient-primary">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  提交挑战
                </Button>
              </CardContent>
            </Card>
          )}

          {selectedTab === "reports" && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">本月验证交易</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">127</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <TrendingUp className="w-3 h-3 inline mr-1" />
                      比上月 +12%
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">发起挑战</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-yellow-500">3</div>
                    <p className="text-xs text-muted-foreground mt-1">待处理 2 起</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">异常发现率</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-500">2.4%</div>
                    <p className="text-xs text-muted-foreground mt-1">行业平均 3.1%</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>生成审计报告</CardTitle>
                  <CardDescription>导出指定时间段的审计数据</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">开始日期</label>
                      <Input type="date" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">结束日期</label>
                      <Input type="date" />
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-primary">
                    <FileText className="w-4 h-4 mr-2" />
                    生成报告
                  </Button>
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

export default Auditor;
