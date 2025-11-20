import { Shield, Eye, Lock, Zap, Users, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Shield,
    title: "区块链透明",
    description: "每笔捐款都记录在链上，任何人都可以追溯验证，消除账目黑箱",
    color: "text-primary",
  },
  {
    icon: Lock,
    title: "隐私保护",
    description: "受助女性身份使用匿名哈希，仅授权方掌握，防止二次伤害",
    color: "text-secondary",
  },
  {
    icon: Eye,
    title: "智能审计",
    description: "智能合约自动检测异常价格和频率，挑战机制防止利益输送",
    color: "text-primary",
  },
  {
    icon: Zap,
    title: "即时响应",
    description: "紧急援助通道为遭受家暴的女性提供快速、隐蔽的救助",
    color: "text-secondary",
  },
  {
    icon: Users,
    title: "社群驱动",
    description: "女性志愿者与 NGO 组织结合，保障线下温度与安全",
    color: "text-primary",
  },
  {
    icon: Heart,
    title: "温度与制度",
    description: "将 Web3 可验证性与社会组织的温度完美结合",
    color: "text-secondary",
  },
];

const Features = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold">
            为什么选择 <span className="bg-gradient-primary bg-clip-text text-transparent">SheAid</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            我们将区块链技术与女性安全援助相结合，创造了一个全新的慈善模式
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="p-6 hover:shadow-soft transition-all duration-300 border-2 hover:border-primary/20 bg-card"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;