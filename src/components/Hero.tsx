import { Button } from "@/components/ui/button";
import { ArrowRight, Shield } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-hero overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent" />
      
      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/30 rounded-full border border-accent">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">基于区块链的透明捐助</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              让每一笔善款
              <span className="bg-gradient-primary bg-clip-text text-transparent"> 安全透明</span>
              地到达需要帮助的女性
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
              SheAid 通过 Web3 技术构建去信任捐助链，保护受助女性隐私，确保每笔捐款透明可追溯，消除慈善黑箱。
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-soft">
                立即捐助
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-2">
                了解更多
              </Button>
            </div>
            
            <div className="flex gap-8 pt-8 border-t border-border">
              <div>
                <div className="text-3xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">链上透明</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-secondary">零泄露</div>
                <div className="text-sm text-muted-foreground">隐私保护</div>
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">智能审计</div>
                <div className="text-sm text-muted-foreground">反腐败机制</div>
              </div>
            </div>
          </div>
          
          <div className="relative animate-fade-in">
            <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl rounded-full" />
            <img 
              src={heroImage} 
              alt="Women empowerment and safety"
              className="relative rounded-3xl shadow-soft w-full animate-float"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;