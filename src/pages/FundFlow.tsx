import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FundTracker from "@/components/FundTracker";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const FundFlow = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-8 hover:bg-accent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回主页
          </Button>

          <FundTracker />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FundFlow;
