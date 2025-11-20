import { Button } from "@/components/ui/button";
import { Heart, Menu } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            <a href="#about" className="text-foreground hover:text-primary transition-colors font-medium">
              关于我们
            </a>
            <a href="#features" className="text-foreground hover:text-primary transition-colors font-medium">
              核心特性
            </a>
            <a href="#how-it-works" className="text-foreground hover:text-primary transition-colors font-medium">
              如何运作
            </a>
            <a href="#impact" className="text-foreground hover:text-primary transition-colors font-medium">
              社会影响
            </a>
          </nav>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" className="hidden md:inline-flex">
              登录
            </Button>
            <Link to="/donate">
              <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">
                立即捐助
              </Button>
            </Link>
            
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
            <a href="#about" className="text-foreground hover:text-primary transition-colors font-medium">
              关于我们
            </a>
            <a href="#features" className="text-foreground hover:text-primary transition-colors font-medium">
              核心特性
            </a>
            <a href="#how-it-works" className="text-foreground hover:text-primary transition-colors font-medium">
              如何运作
            </a>
            <a href="#impact" className="text-foreground hover:text-primary transition-colors font-medium">
              社会影响
            </a>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;