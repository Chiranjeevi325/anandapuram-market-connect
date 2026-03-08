import { Link } from "react-router-dom";
import { Flower2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center px-4">
        <Flower2 className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
        <h1 className="text-6xl font-display font-bold text-foreground mb-2">404</h1>
        <p className="text-lg text-muted-foreground mb-8">This page doesn't exist in the market.</p>
        <Link to="/">
          <Button className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Market
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
