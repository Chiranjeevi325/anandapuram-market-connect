import { Link } from "react-router-dom";
import { Flower2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <div className="text-center px-4">
        <div className="h-20 w-20 rounded-3xl bg-surface-container-low flex items-center justify-center mx-auto mb-6">
          <Flower2 className="h-10 w-10 text-muted-foreground/30" />
        </div>
        <h1 className="text-6xl font-display font-bold text-foreground mb-2">404</h1>
        <p className="text-lg text-muted-foreground mb-8 font-body">This page doesn't exist in the market.</p>
        <Link to="/">
          <Button className="gap-2 btn-gradient rounded-full px-8 font-semibold">
            <ArrowLeft className="h-4 w-4" /> Back to Market
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
