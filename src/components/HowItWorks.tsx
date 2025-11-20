import { Coins, FileCheck, ShoppingBag, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Coins,
    title: "捐助",
    description: "通过 ETH 或稳定币向资金池捐款，所有交易记录上链",
    number: "01",
  },
  {
    icon: FileCheck,
    title: "审核",
    description: "智能合约自动审核支出，检查价格合理性和商户资质",
    number: "02",
  },
  {
    icon: ShoppingBag,
    title: "分发",
    description: "受助女性获得不可转让的援助凭证，直接从白名单商户兑换物资",
    number: "03",
  },
  {
    icon: CheckCircle,
    title: "核销",
    description: "商户凭签收证明获得支付，避免现金流向家庭控制方",
    number: "04",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-accent/10 to-transparent" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold">工作流程</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            简单透明的四步流程，确保每一笔善款都能安全到达需要帮助的人
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-20 left-full w-full h-0.5 bg-gradient-to-r from-primary to-transparent -translate-x-1/2 z-0" />
                )}
                
                <div className="relative z-10 text-center space-y-4">
                  <div className="relative inline-flex">
                    <div className="absolute inset-0 bg-gradient-primary blur-xl opacity-50" />
                    <div className="relative w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto shadow-card">
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  
                  <div className="text-6xl font-bold text-accent/30">{step.number}</div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;