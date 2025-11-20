import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Heart, TrendingUp, Award } from "lucide-react";
import ImpactMap from "./ImpactMap";
import RegionalIssues from "./RegionalIssues";

const Impact = () => {
  return (
    <section id="impact" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        {/* Global Impact Map */}
        <div className="mb-16 animate-fade-in">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              全球影响力地图
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              实时追踪我们的救助足迹，见证每一份爱心的力量
            </p>
          </div>
          <ImpactMap />
        </div>

        {/* Regional Issues Analysis */}
        <div className="mb-16 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <RegionalIssues />
        </div>

        {/* Statistics Cards */}
        <div className="text-center mb-12 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            我们的社会影响
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            通过区块链技术，我们正在改变成千上万女性的生活
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-4xl font-bold text-primary">856</CardTitle>
              <CardDescription>累计受助人数</CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-4xl font-bold text-primary">1,234</CardTitle>
              <CardDescription>爱心捐助人数</CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-4xl font-bold text-primary">127.5</CardTitle>
              <CardDescription>ETH 捐款总额</CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-4xl font-bold text-primary">94%</CardTitle>
              <CardDescription>受助者满意度</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Success Stories */}
        <div className="animate-fade-in" style={{ animationDelay: "0.5s" }}>
          <h3 className="text-2xl font-bold text-center mb-8">成功案例</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-xl mb-3">
                    李
                  </div>
                  <h4 className="font-semibold mb-2">李女士 - 北京</h4>
                  <p className="text-sm text-muted-foreground">
                    通过我们的职业培训项目，李女士成功转型为独立设计师，现在月收入稳定，生活得到了极大改善。
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-xl mb-3">
                    王
                  </div>
                  <h4 className="font-semibold mb-2">王女士 - 上海</h4>
                  <p className="text-sm text-muted-foreground">
                    在我们的帮助下，王女士成功脱离家暴环境，获得法律援助，现在和孩子过上了安全幸福的生活。
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-xl mb-3">
                    张
                  </div>
                  <h4 className="font-semibold mb-2">张女士 - 成都</h4>
                  <p className="text-sm text-muted-foreground">
                    通过创业孵化项目的支持，张女士成功创办了自己的公司，不仅实现了经济独立，还帮助了更多女性就业。
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Impact;