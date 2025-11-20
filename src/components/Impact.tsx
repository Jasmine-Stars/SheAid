import { TrendingUp, Users, DollarSign, Award } from "lucide-react";
import { Card } from "@/components/ui/card";

const stats = [
  {
    icon: Users,
    value: "10,000+",
    label: "受助女性",
    trend: "+25%",
    color: "from-primary to-primary/70",
  },
  {
    icon: DollarSign,
    value: "¥500万",
    label: "透明捐款",
    trend: "+40%",
    color: "from-secondary to-secondary/70",
  },
  {
    icon: Award,
    value: "150+",
    label: "合作商户",
    trend: "+15%",
    color: "from-primary to-primary/70",
  },
  {
    icon: TrendingUp,
    value: "99.9%",
    label: "资金利用率",
    trend: "行业领先",
    color: "from-secondary to-secondary/70",
  },
];

const Impact = () => {
  return (
    <section className="py-24 bg-gradient-hero">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-bold">
            我们的<span className="bg-gradient-primary bg-clip-text text-transparent">影响力</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            每一个数字背后都是一个被改变的生命
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={index}
                className="p-8 text-center space-y-4 hover:shadow-soft transition-all duration-300 border-2 hover:scale-105 bg-card"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto shadow-card`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                
                <div className="space-y-2">
                  <div className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-foreground">
                    {stat.label}
                  </div>
                  <div className="inline-flex items-center gap-1 text-xs text-secondary font-semibold bg-secondary/10 px-3 py-1 rounded-full">
                    <TrendingUp className="w-3 h-3" />
                    {stat.trend}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        
        <div className="mt-16 p-8 bg-gradient-primary rounded-3xl text-white text-center space-y-4">
          <h3 className="text-3xl font-bold">加入我们，一起创造改变</h3>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            你的每一次捐助，都将通过区块链技术被精准追踪，确保安全透明地到达需要帮助的女性手中
          </p>
        </div>
      </div>
    </section>
  );
};

export default Impact;