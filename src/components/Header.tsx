import { Button } from "@/components/ui/button";
import { Heart, Menu, LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "已退出登录",
      description: "期待您的再次光临",
    });
    navigate("/");
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
              商户物资
            </Link>
            <Link to="/auditor" className="text-foreground hover:text-primary transition-colors font-medium">
              审计相关
            </Link>
          </nav>
          
          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="hidden md:inline-flex">
                    <User className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
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
              商户物资
            </Link>
            <Link to="/auditor" className="text-foreground hover:text-primary transition-colors font-medium">
              审计相关
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;