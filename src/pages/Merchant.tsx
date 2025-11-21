import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Package, Upload, CheckCircle } from "lucide-react";

const Merchant = () => {
  const [selectedTab, setSelectedTab] = useState<"supplies" | "shipping">("supplies");

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <Package className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">商户物资管理</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              提供物资、提交发货凭证
            </p>
          </div>

          <div className="flex gap-4 mb-8 justify-center">
            <Button
              variant={selectedTab === "supplies" ? "default" : "outline"}
              onClick={() => setSelectedTab("supplies")}
            >
              物资供应
            </Button>
            <Button
              variant={selectedTab === "shipping" ? "default" : "outline"}
              onClick={() => setSelectedTab("shipping")}
            >
              发货凭证
            </Button>
          </div>

          {selectedTab === "supplies" && (
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { id: 1, name: "生活必需品包", stock: 150, status: "available" },
                { id: 2, name: "医疗卫生用品", stock: 80, status: "available" },
                { id: 3, name: "儿童教育用品", stock: 0, status: "out-of-stock" },
                { id: 4, name: "应急救助包", stock: 200, status: "available" },
                { id: 5, name: "保暖衣物", stock: 45, status: "low-stock" },
                { id: 6, name: "营养食品", stock: 120, status: "available" },
              ].map((supply) => (
                <Card key={supply.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{supply.name}</CardTitle>
                      <Badge
                        variant={
                          supply.status === "available"
                            ? "default"
                            : supply.status === "low-stock"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {supply.status === "available"
                          ? "充足"
                          : supply.status === "low-stock"
                          ? "偏低"
                          : "缺货"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold mb-3">{supply.stock} 份</p>
                    <Button className="w-full" size="sm">
                      补充库存
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {selectedTab === "shipping" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>提交发货凭证</CardTitle>
                  <CardDescription>上传物资发货证明文件</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">订单编号</label>
                    <Input placeholder="输入订单编号" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">物流单号</label>
                    <Input placeholder="输入物流追踪号" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">发货说明</label>
                    <Textarea placeholder="备注信息（可选）" rows={3} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">上传凭证</label>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">点击上传或拖拽文件</p>
                      <p className="text-xs text-muted-foreground mt-1">支持 PDF, JPG, PNG</p>
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-primary">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    提交发货凭证
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>最近发货记录</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { order: "ORD-2024-001", status: "已签收", date: "2024-01-15" },
                      { order: "ORD-2024-002", status: "运输中", date: "2024-01-16" },
                      { order: "ORD-2024-003", status: "已发货", date: "2024-01-17" },
                    ].map((record) => (
                      <div
                        key={record.order}
                        className="flex justify-between items-center p-3 bg-accent/20 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{record.order}</p>
                          <p className="text-xs text-muted-foreground">{record.date}</p>
                        </div>
                        <Badge>{record.status}</Badge>
                      </div>
                    ))}
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

export default Merchant;
