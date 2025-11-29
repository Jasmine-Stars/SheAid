import { Button } from "@/components/ui/button";
import { Heart, Menu, LogOut, User, Shield, Wallet } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useWeb3 } from "@/hooks/useWeb3";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { account, connectWallet, disconnectWallet, isConnected } = useWeb3();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminRole(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminRole(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminRole = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    
    setIsAdmin(data?.some(r => r.role === "admin") || false);
  };

  const handleSignOut = async () => {
    try {
      // Clear local state first
      setUser(null);
      setIsAdmin(false);
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Sign out error:", error);
        toast({
          title: "退出登录失败",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "已退出登录",
        description: "期待您的再次光临",
      });
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "退出登录失败",
        description: "请刷新页面后重试",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary fill-primary" />
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              SheAid
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/apply" className="text-foreground hover:text-primary transition-colors font-medium">
              申请救助
            </Link>
            <Link to="/donate" className="text-foreground hover:text-primary transition-colors font-medium">
              捐助善款
            </Link>
            <Link to="/ngo" className="text-foreground hover:text-primary transition-colors font-medium">
              NGO机构
            </Link>
            <Link to="/merchant" className="text-foreground hover:text-primary transition-colors font-medium">
              商户中心
            </Link>
            <Link to="/auditor" className="text-foreground hover:text-primary transition-colors font-medium">
              审计相关
            </Link>
            <Link to="/fund-flow" className="text-foreground hover:text-primary transition-colors font-medium">
              资金追踪
            </Link>
          </nav>
          
          <div className="flex items-center gap-4">
            {/* Wallet Connect Button */}
            {isConnected ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={disconnectWallet}
                className="hidden md:inline-flex"
              >
                <Wallet className="w-4 h-4 mr-2" />
                {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "已连接"}
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={connectWallet}
                className="hidden md:inline-flex"
              >
                <Wallet className="w-4 h-4 mr-2" />
                连接钱包
              </Button>
            )}

            {isAdmin && (
              <Link to="/admin/platform">
                <Button variant="default" size="sm" className="hidden md:inline-flex">
                  <Shield className="w-4 h-4 mr-2" />
                  管理员
                </Button>
              </Link>
            )}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="hidden md:inline-flex">
                    <User className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate("/admin/platform")}>
                      <Shield className="w-4 h-4 mr-2" />
                      管理员控制台
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="outline" className="hidden md:inline-flex">
                  登录 / 注册
                </Button>
              </Link>
            )}
            
            <button 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {isMenuOpen && (
          <nav className="md:hidden pt-4 pb-2 flex flex-col gap-4">
            <Link to="/apply" className="text-foreground hover:text-primary transition-colors font-medium">
              申请救助
            </Link>
            <Link to="/donate" className="text-foreground hover:text-primary transition-colors font-medium">
              捐助善款
            </Link>
            <Link to="/ngo" className="text-foreground hover:text-primary transition-colors font-medium">
              NGO机构
            </Link>
            <Link to="/merchant" className="text-foreground hover:text-primary transition-colors font-medium">
              商户中心
            </Link>
            <Link to="/auditor" className="text-foreground hover:text-primary transition-colors font-medium">
              审计相关
            </Link>
            <Link to="/fund-flow" className="text-foreground hover:text-primary transition-colors font-medium">
              资金追踪
            </Link>
            {/* Mobile Wallet Connect */}
            {isConnected ? (
              <button onClick={disconnectWallet} className="text-left text-foreground hover:text-primary transition-colors font-medium">
                <Wallet className="w-4 h-4 inline mr-2" />
                {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "已连接"}
              </button>
            ) : (
              <button onClick={connectWallet} className="text-left text-foreground hover:text-primary transition-colors font-medium">
                <Wallet className="w-4 h-4 inline mr-2" />
                连接钱包
              </button>
            )}
            
            {isAdmin && (
              <Link to="/admin/platform" className="text-foreground hover:text-primary transition-colors font-medium">
                <Shield className="w-4 h-4 inline mr-2" />
                管理员控制台
              </Link>
            )}
            {user ? (
              <button onClick={handleSignOut} className="text-left text-foreground hover:text-primary transition-colors font-medium">
                <LogOut className="w-4 h-4 inline mr-2" />
                退出登录
              </button>
            ) : (
              <Link to="/auth" className="text-foreground hover:text-primary transition-colors font-medium">
                登录 / 注册
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;