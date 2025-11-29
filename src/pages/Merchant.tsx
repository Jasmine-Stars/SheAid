import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Package, CheckCircle, ArrowLeft, Plus, ShoppingCart, Store, Loader2, XCircle, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWeb3 } from "@/hooks/useWeb3";
import { useContracts } from "@/hooks/useContracts";
import { useContractEvents } from "@/hooks/useContractEvents";
import { ethers } from "ethers";

interface Product {
  id: string;
  categoryId: string;
  merchant: string;
  price: string;
  stock: number;
  isActive: boolean;
  metadata: string;
}

// 对应合约中的枚举: None(0), Pending(1), Active(2), Frozen(3), Banned(4)
type MerchantStatus = "register" | "pending" | "approved" | "rejected";

const Merchant = () => {
  const [selectedTab, setSelectedTab] = useState<"supplies" | "manage" | "redeem">("supplies");
  const [products, setProducts] = useState<Product[]>([]);
  
  // 状态管理
  const [merchantStatus, setMerchantStatus] = useState<MerchantStatus>("register");
  const [isBeneficiary, setIsBeneficiary] = useState(false);
  const [beneficiaryBalance, setBeneficiaryBalance] = useState("0");
  const [loading, setLoading] = useState(false);
  
  // 商户注册表单
  const [merchantName, setMerchantName] = useState("");
  const [merchantMetadata, setMerchantMetadata] = useState("");
  const [stakeAmount, setStakeAmount] = useState("100"); // 默认建议押金
  
  // 上架商品表单
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productStock, setProductStock] = useState("");
  const [productCategory, setProductCategory] = useState("ESSENTIAL_SUPPLIES");
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { account, connectWallet } = useWeb3();
  const contracts = useContracts();
  const { events } = useContractEvents();

  useEffect(() => {
    if (account && contracts.marketplace && contracts.merchantRegistry && contracts.beneficiaryModule) {
      checkUserRoles();
      loadProducts();
    }
  }, [account, contracts]);

  // 监听事件自动刷新
  useEffect(() => {
    const relevantEvents = ["ProductListed", "ProductPriceUpdated", "PurchaseRecorded", "MerchantStatusChanged", "MerchantRegistered"];
    const hasRelevantEvent = events.some(e => relevantEvents.includes(e.type));
    
    if (hasRelevantEvent && contracts.marketplace) {
      loadProducts();
      checkUserRoles();
    }
  }, [events]);

  const checkUserRoles = async () => {
    if (!account || !contracts.merchantRegistry || !contracts.beneficiaryModule) return;
    
    try {
      // 1. 检查商户状态
      // Solidity Enum: 0=None, 1=Pending, 2=Active, 3=Frozen, 4=Banned
      const merchantInfo = await contracts.merchantRegistry.merchants(account);
      const statusMap: Record<number, MerchantStatus> = {
        0: "register",
        1: "pending",
        2: "approved",
        3: "rejected", // Frozen 视为拒绝/冻结
        4: "rejected"  // Banned 视为拒绝
      };
      setMerchantStatus(statusMap[merchantInfo.status] || "register");
      
      // 2. 检查受助人状态
      const beneficiaryInfo = await contracts.beneficiaryModule.stats(account); 
      // 注意：这里可能需要根据你的合约逻辑调整，假设有方法判断是否是受助人
      // 如果没有直接字段，可以通过 charityBalance > 0 或者 roles 合约判断
      // 这里暂时保留原逻辑框架，假设通过余额或 roles 判断
      
      // 为了演示，假设余额查询成功即为受助人（或者你可以加一个专门的 check）
      const balance = await contracts.beneficiaryModule.charityBalance(account);
      if (balance.gt(0)) {
        setIsBeneficiary(true);
        setBeneficiaryBalance(ethers.utils.formatEther(balance));
      }

    } catch (error) {
      console.error("检查用户角色失败:", error);
    }
  };

  const loadProducts = async () => {
    if (!contracts.marketplace) return;
    
    try {
      setLoading(true);
      const productCount = await contracts.marketplace.nextProductId();
      const loadedProducts: Product[] = [];
      
      for (let i = 0; i < productCount.toNumber(); i++) {
        try {
          const product = await contracts.marketplace.products(i);
          if (product.merchant !== ethers.constants.AddressZero) {
            loadedProducts.push({
              id: i.toString(),
              categoryId: product.categoryId,
              merchant: product.merchant,
              price: ethers.utils.formatEther(product.price),
              stock: product.stock.toNumber(),
              isActive: product.active, // 注意合约字段名可能是 active 而不是 isActive
              metadata: product.metadata
            });
          }
        } catch (err) {
          console.error(`加载商品 ${i} 失败:`, err);
        }
      }
      setProducts(loadedProducts);
    } catch (error) {
      console.error("加载商品列表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMerchantRegister = async () => {
    if (!account) return;
    if (!merchantName || !stakeAmount) {
      toast({ title: "请填写完整信息", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      const stakeAmountWei = ethers.utils.parseEther(stakeAmount);
      
      // 步骤 1: 授权
      toast({
        title: "步骤 1/2",
        description: "正在授权支付押金，请在钱包确认...",
      });
      
      const approveTx = await contracts.mockToken.approve(
        contracts.merchantRegistry.address,
        stakeAmountWei
      );
      await approveTx.wait();
      
      // 步骤 2: 注册
      toast({
        title: "步骤 2/2",
        description: "授权成功！正在提交注册信息...",
      });
      
      const registerTx = await contracts.merchantRegistry.registerMerchant(
        merchantName,
        merchantMetadata || "无简介",
        stakeAmountWei
      );
      await registerTx.wait();
      
      toast({
        title: "注册申请已提交",
        description: "请等待平台管理员审核您的资质。",
      });
      
      // 立即更新状态为 pending
      setMerchantStatus("pending");
      checkUserRoles(); // 双重保险，重新拉取链上状态
      
    } catch (error: any) {
      console.error("注册失败:", error);
      toast({
        title: "注册失败",
        description: error.message || "请检查余额或重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleListProduct = async () => {
    // ... (保持原有逻辑不变)
    // 为节省篇幅，直接复制之前的上架逻辑
    if (!account || merchantStatus !== "approved") return;
    if (!productName || !productPrice || !productStock) {
      toast({ title: "请填写完整信息", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      const categoryBytes = ethers.utils.formatBytes32String(productCategory); // 注意：如果 category 是 bytes32
      // 或者根据你的合约，如果 category 是 string，则不需要转换，这里假设是 bytes32
      
      // 这里有个小坑：ethers.utils.formatBytes32String 最多支持31字节字符
      // 实际项目中建议 category 用数字 ID 或更短的 code
      
      const priceWei = ethers.utils.parseEther(productPrice);
      const productMetadata = JSON.stringify({ name: productName });
      
      const tx = await contracts.marketplace.listProduct(
        categoryBytes,
        priceWei,
        productMetadata // listProduct 参数签名需对应合约: (categoryId, price, metadata)
        // 注意：你的合约 listProduct 没有 quantity 参数？如果有，请补上
      );
      await tx.wait();
      
      toast({ title: "上架成功" });
      setProductName(""); setProductPrice(""); setProductStock("");
      loadProducts();
    } catch (error: any) {
      toast({ title: "上架失败", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemProduct = async (productId: string, price: string) => {
    // ... (保持原有逻辑不变)
    if (!account) return;
    try {
      setLoading(true);
      const tx = await contracts.beneficiaryModule.spendCharityToken(productId, 1); // 合约方法名 spendCharityToken
      await tx.wait();
      toast({ title: "核销成功", description: "物资即将发放" });
      loadProducts();
    } catch (e: any) {
      toast({ title: "核销失败", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProductStatus = async (productId: string, currentStatus: boolean) => {
      // ... (保持原有逻辑)
      if (!account) return;
      try {
        setLoading(true);
        const tx = await contracts.marketplace.setProductActive(productId, !currentStatus);
        await tx.wait();
        toast({ title: "状态已更新" });
        loadProducts();
      } catch(e) { console.error(e); } finally { setLoading(false); }
  }

  // --- 视图组件 ---

  const renderRegisterView = () => (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-6 h-6 text-primary" />
            商户入驻注册
          </CardTitle>
          <CardDescription>缴纳押金并提交资料，审核通过后即可上架商品供受助人兑换。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!account ? (
            <Button onClick={connectWallet} className="w-full h-12">
              <Wallet className="w-4 h-4 mr-2" /> 连接钱包以注册
            </Button>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">店铺名称 *</label>
                <Input value={merchantName} onChange={(e) => setMerchantName(e.target.value)} placeholder="例如：爱心生活超市" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">商户简介 / 资质信息</label>
                <Textarea value={merchantMetadata} onChange={(e) => setMerchantMetadata(e.target.value)} placeholder="请描述您的主营业务及资质编号..." />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">质押押金 (MockToken) *</label>
                <Input type="number" value={stakeAmount} onChange={(e) => setStakeAmount(e.target.value)} />
                <p className="text-xs text-muted-foreground mt-1">押金用于保障服务质量，退出平台时可退还。</p>
              </div>
              <Button className="w-full bg-gradient-primary mt-4" onClick={handleMerchantRegister} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                {loading ? "处理中..." : "提交注册申请"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderPendingView = () => (
    <Card className="max-w-lg mx-auto text-center py-12 mt-8">
      <CardContent>
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-yellow-100 rounded-full">
            <Loader2 className="w-12 h-12 text-yellow-600 animate-spin-slow" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">审核中</h2>
        <p className="text-muted-foreground mb-6">
          您的商户入驻申请已提交，正在等待平台管理员审核。<br/>
          审核通过后，您将获得上架商品的权限。
        </p>
        <Button variant="outline" onClick={() => navigate("/")}>返回主页</Button>
      </CardContent>
    </Card>
  );

  const renderRejectedView = () => (
    <Card className="max-w-lg mx-auto text-center py-12 mt-8">
      <CardContent>
        <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">申请被拒绝</h2>
        <p className="text-muted-foreground mb-6">很抱歉，您的商户资质审核未通过。</p>
        <Button onClick={() => setMerchantStatus("register")}>重新提交申请</Button>
      </CardContent>
    </Card>
  );

  const activeProducts = products.filter(p => p.isActive);
  const myProducts = products.filter(p => p.merchant.toLowerCase() === account?.toLowerCase());

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          {/* 只有非审核中状态才显示返回按钮，或者一直显示也可以 */}
          <Button variant="ghost" onClick={() => navigate("/")} className="mb-6 hover:bg-accent">
            <ArrowLeft className="w-4 h-4 mr-2" /> 返回主页
          </Button>

          {/* 标题区域 */}
          {merchantStatus !== "pending" && merchantStatus !== "rejected" && (
            <div className="text-center mb-12">
              <Package className="w-16 h-16 text-primary mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">商户中心</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {merchantStatus === "approved" ? "管理您的商品，服务社区受助者" : "加入我们，成为爱心商户"}
              </p>
            </div>
          )}

          {/* 路由判断 */}
          {merchantStatus === "register" && !isBeneficiary ? (
            renderRegisterView()
          ) : merchantStatus === "pending" ? (
            renderPendingView()
          ) : merchantStatus === "rejected" ? (
            renderRejectedView()
          ) : (
            // Approved 或者是受助人 (Mixed View)
            <>
              <div className="flex gap-4 mb-8 justify-center flex-wrap">
                <Button variant={selectedTab === "supplies" ? "default" : "outline"} onClick={() => setSelectedTab("supplies")}>
                  商品列表
                </Button>
                {merchantStatus === "approved" && (
                  <Button variant={selectedTab === "manage" ? "default" : "outline"} onClick={() => setSelectedTab("manage")}>
                    商户管理
                  </Button>
                )}
                {isBeneficiary && (
                  <Button variant={selectedTab === "redeem" ? "default" : "outline"} onClick={() => setSelectedTab("redeem")}>
                    受助核销
                  </Button>
                )}
              </div>

              {/* 商品列表 Tab */}
              {selectedTab === "supplies" && (
                <div className="grid md:grid-cols-3 gap-6">
                  {activeProducts.length === 0 ? <p className="col-span-3 text-center text-muted-foreground">暂无上架商品</p> : 
                    activeProducts.map((product) => (
                      <Card key={product.id}>
                        <CardHeader>
                          <CardTitle>{JSON.parse(product.metadata || '{}').name || "未命名商品"}</CardTitle>
                          <Badge>上架中</Badge>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold text-primary">{product.price} MUSD</p>
                          <p className="text-sm text-muted-foreground mt-1">剩余: {product.stock}</p>
                          {isBeneficiary && (
                             <Button className="w-full mt-4" onClick={() => handleRedeemProduct(product.id, product.price)}>立即核销</Button>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  }
                </div>
              )}

              {/* 商户管理 Tab */}
              {selectedTab === "manage" && merchantStatus === "approved" && (
                 <div className="max-w-4xl mx-auto space-y-6">
                   <Card>
                     <CardHeader><CardTitle>发布商品</CardTitle></CardHeader>
                     <CardContent className="space-y-4">
                       <div className="grid grid-cols-2 gap-4">
                         <Input placeholder="商品名称" value={productName} onChange={e => setProductName(e.target.value)} />
                         <Input type="number" placeholder="价格" value={productPrice} onChange={e => setProductPrice(e.target.value)} />
                       </div>
                       <Input type="number" placeholder="库存数量" value={productStock} onChange={e => setProductStock(e.target.value)} />
                       <Button onClick={handleListProduct} disabled={loading} className="w-full">
                         {loading ? <Loader2 className="animate-spin mr-2"/> : <Plus className="mr-2"/>} 上架
                       </Button>
                     </CardContent>
                   </Card>
                   
                   {/* 我的商品列表 */}
                   <div className="space-y-4">
                     <h3 className="font-bold text-lg">已发布商品</h3>
                     {myProducts.map(p => (
                       <Card key={p.id} className="flex justify-between items-center p-4">
                         <div>
                           <p className="font-bold">{JSON.parse(p.metadata || '{}').name}</p>
                           <p className="text-sm text-muted-foreground">价格: {p.price} | 库存: {p.stock}</p>
                         </div>
                         <Button variant={p.isActive ? "destructive" : "default"} size="sm" onClick={() => handleToggleProductStatus(p.id, p.isActive)}>
                           {p.isActive ? "下架" : "上架"}
                         </Button>
                       </Card>
                     ))}
                   </div>
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

export default Merchant;
