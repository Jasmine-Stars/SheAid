import { Heart, Github, Twitter, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-muted/50 border-t border-border py-12">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary fill-primary" />
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                SheAid
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              让每一笔善款都安全、透明地到达真正需要帮助的女性手中
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">关于我们</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">项目愿景</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">技术架构</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">团队介绍</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">白皮书</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">参与方式</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">立即捐助</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">成为志愿者</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">商户入驻</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">申请援助</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">联系我们</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                <Github className="w-5 h-5 text-primary" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                <Twitter className="w-5 h-5 text-primary" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                <Mail className="w-5 h-5 text-primary" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© 2025 SheAid Foundation. 基于区块链的女性安全捐助平台</p>
          <p className="mt-2">Built with Web3 • Privacy First • Anti-Corruption</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;