import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Users, Package, Search, ExternalLink, Loader2 } from "lucide-react";

interface Donation {
  id: string;
  amount: number;
  created_at: string;
  transaction_hash: string | null;
  payment_method: string;
  projects: {
    title: string;
    category: string;
  };
}

interface Allocation {
  id: string;
  amount: number;
  allocation_type: string;
  description: string;
  status: string;
  created_at: string;
  applications: {
    applicant_name: string;
  };
  projects: {
    title: string;
  };
}

const FundTracker = () => {
  const [myDonations, setMyDonations] = useState<Donation[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [txSearch, setTxSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // 获取我的捐款记录
        const { data: donations } = await supabase
          .from("donations")
          .select(`
            id,
            amount,
            created_at,
            transaction_hash,
            payment_method,
            projects (
              title,
              category
            )
          `)
          .eq("donor_id", user.id)
          .order("created_at", { ascending: false });

        setMyDonations(donations || []);

        // 获取相关的资金分配记录
        if (donations && donations.length > 0) {
          const donationIds = donations.map(d => d.id);
          const { data: allocs } = await supabase
            .from("fund_allocations")
            .select(`
              id,
              amount,
              allocation_type,
              description,
              status,
              created_at,
              applications (
                applicant_name
              ),
              projects (
                title
              )
            `)
            .in("donation_id", donationIds)
            .order("created_at", { ascending: false });

          setAllocations(allocs || []);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const openEtherscan = (txHash: string) => {
    window.open(`https://etherscan.io/tx/${txHash}`, "_blank");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">资金流向追踪</h2>
        <p className="text-muted-foreground">
          透明追踪每笔捐款的使用情况，确保善款真正帮助到需要的人
        </p>
      </div>

      {/* 交易哈希搜索 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            区块链交易查询
          </CardTitle>
          <CardDescription>输入交易哈希查询链上记录</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="txHash" className="sr-only">交易哈希</Label>
              <Input
                id="txHash"
                placeholder="输入交易哈希 (0x...)"
                value={txSearch}
                onChange={(e) => setTxSearch(e.target.value)}
                className="font-mono"
              />
            </div>
            <Button
              onClick={() => txSearch && openEtherscan(txSearch)}
              disabled={!txSearch}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              查询
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="donations" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="donations">
            <TrendingUp className="w-4 h-4 mr-2" />
            我的捐款
          </TabsTrigger>
          <TabsTrigger value="allocations">
            <Package className="w-4 h-4 mr-2" />
            资金分配
          </TabsTrigger>
        </TabsList>

        <TabsContent value="donations" className="space-y-4">
          {myDonations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                您还没有捐款记录
              </CardContent>
            </Card>
          ) : (
            myDonations.map((donation) => (
              <Card key={donation.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {donation.projects?.title || "未知项目"}
                      </CardTitle>
                      <CardDescription>
                        {new Date(donation.created_at).toLocaleString()}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">{donation.projects?.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">捐款金额:</span>
                      <span className="text-xl font-bold text-primary">
                        {donation.amount} {donation.payment_method.toUpperCase()}
                      </span>
                    </div>
                    {donation.transaction_hash && (
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">交易哈希:</div>
                        <div className="flex gap-2">
                          <code className="flex-1 p-2 bg-muted rounded text-xs font-mono truncate">
                            {donation.transaction_hash}
                          </code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEtherscan(donation.transaction_hash!)}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="allocations" className="space-y-4">
          {allocations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                暂无资金分配记录
              </CardContent>
            </Card>
          ) : (
            allocations.map((allocation) => (
              <Card key={allocation.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {allocation.projects?.title}
                      </CardTitle>
                      <CardDescription>
                        {new Date(allocation.created_at).toLocaleString()}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        allocation.status === "completed"
                          ? "default"
                          : allocation.status === "verified"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {allocation.status === "completed"
                        ? "已完成"
                        : allocation.status === "verified"
                        ? "已核实"
                        : "处理中"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        受助人: {allocation.applications?.applicant_name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">分配金额:</span>
                      <span className="text-lg font-bold text-primary">
                        {allocation.amount} ETH
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">分配类型:</span>
                      <Badge variant="outline">
                        {allocation.allocation_type === "cash"
                          ? "现金"
                          : allocation.allocation_type === "supplies"
                          ? "物资"
                          : "服务"}
                      </Badge>
                    </div>
                    <div className="pt-2 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        {allocation.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* 统计信息 */}
      {myDonations.length > 0 && (
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {myDonations.reduce((sum, d) => sum + d.amount, 0).toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">总捐款金额 (ETH)</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Package className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{myDonations.length}</div>
                <div className="text-sm text-muted-foreground mt-1">捐款次数</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{allocations.length}</div>
                <div className="text-sm text-muted-foreground mt-1">受助人数</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FundTracker;
