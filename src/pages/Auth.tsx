import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Flower2, ArrowLeft, Leaf } from 'lucide-react';
import { toast } from 'sonner';

type Role = 'buyer' | 'seller';

const Auth = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<Role>('buyer');
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [farmName, setFarmName] = useState('');
  const [village, setVillage] = useState('');
  const [primaryProduct, setPrimaryProduct] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const metadata: Record<string, string> = {
          full_name: fullName,
          phone,
          role,
        };
        if (role === 'seller') {
          metadata.farm_name = farmName;
          metadata.village = village;
          metadata.primary_product = primaryProduct;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: metadata,
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success('Account created! Check your email to confirm.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Welcome back!');
        navigate('/');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col lg:flex-row">
      {/* Left — Botanical imagery panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800&h=1200&fit=crop"
          alt="Fresh flowers"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F2113]/90 via-[#0F2113]/50 to-[#0F2113]/30" />
        <div className="relative z-10 flex flex-col justify-end p-12">
          <div className="freshness-badge inline-flex items-center gap-1.5 w-fit mb-4">
            <Leaf className="h-3.5 w-3.5" />
            <span>Farm Fresh Daily</span>
          </div>
          <h2 className="text-4xl font-display font-bold text-white leading-tight mb-3">
            Fresh from the <span className="text-secondary-container">Anandapuram Market</span>
          </h2>
          <p className="text-white/60 font-body max-w-md">
            Connecting people with the artisan growers who feed the soul as much as the body.
          </p>
        </div>
      </div>

      {/* Right — Auth form */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 lg:p-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-body">
            <ArrowLeft className="h-4 w-4" /> Back to market
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 pb-16">
          <div className="w-full max-w-md">
            <div className="text-center mb-10">
              <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
                <Flower2 className="h-7 w-7 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                {isSignUp ? 'Join Anandapuram Market' : 'Welcome Back'}
              </h1>
              <p className="text-muted-foreground mt-2 font-body">
                {isSignUp ? 'Create your account to start trading' : 'Sign in to your account'}
              </p>
            </div>

            {isSignUp && (
              <div className="flex gap-3 mb-8">
                {(['buyer', 'seller'] as Role[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`flex-1 py-3.5 px-4 rounded-2xl text-center font-semibold capitalize transition-all duration-200 ${role === r
                        ? 'bg-secondary-container text-secondary-container-fg shadow-card'
                        : 'bg-surface-container-low text-muted-foreground hover:bg-surface-container-high'
                      }`}
                  >
                    {r === 'buyer' ? '🛒 Buyer' : '🌾 Seller'}
                    <span className="block text-xs font-normal mt-0.5 opacity-70">
                      {r === 'buyer' ? 'Buy flowers & produce' : 'Sell your farm goods'}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && (
                <div>
                  <Label htmlFor="fullName" className="text-sm font-semibold text-foreground mb-1.5 block">Full Name</Label>
                  <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} required className="rounded-xl bg-surface-container-low border-0 focus:bg-surface-container-highest focus:ring-1 focus:ring-primary/20 h-12" />
                </div>
              )}

              <div>
                <Label htmlFor="email" className="text-sm font-semibold text-foreground mb-1.5 block">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="rounded-xl bg-surface-container-low border-0 focus:bg-surface-container-highest focus:ring-1 focus:ring-primary/20 h-12" />
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-semibold text-foreground mb-1.5 block">Password</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="rounded-xl bg-surface-container-low border-0 focus:bg-surface-container-highest focus:ring-1 focus:ring-primary/20 h-12" />
              </div>

              {isSignUp && (
                <div>
                  <Label htmlFor="phone" className="text-sm font-semibold text-foreground mb-1.5 block">Phone Number</Label>
                  <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" className="rounded-xl bg-surface-container-low border-0 focus:bg-surface-container-highest focus:ring-1 focus:ring-primary/20 h-12" />
                </div>
              )}

              {isSignUp && role === 'seller' && (
                <>
                  <div>
                    <Label htmlFor="farmName" className="text-sm font-semibold text-foreground mb-1.5 block">Farm / Vendor Name</Label>
                    <Input id="farmName" value={farmName} onChange={e => setFarmName(e.target.value)} placeholder="e.g., Ramesh Farm" required className="rounded-xl bg-surface-container-low border-0 focus:bg-surface-container-highest focus:ring-1 focus:ring-primary/20 h-12" />
                  </div>
                  <div>
                    <Label htmlFor="village" className="text-sm font-semibold text-foreground mb-1.5 block">Location / Village</Label>
                    <Input id="village" value={village} onChange={e => setVillage(e.target.value)} placeholder="e.g., Gambhiram, Turlavada" required className="rounded-xl bg-surface-container-low border-0 focus:bg-surface-container-highest focus:ring-1 focus:ring-primary/20 h-12" />
                  </div>
                  <div>
                    <Label htmlFor="primaryProduct" className="text-sm font-semibold text-foreground mb-1.5 block">Primary Product</Label>
                    <Input id="primaryProduct" value={primaryProduct} onChange={e => setPrimaryProduct(e.target.value)} placeholder="e.g., Marigold, Jasmine" className="rounded-xl bg-surface-container-low border-0 focus:bg-surface-container-highest focus:ring-1 focus:ring-primary/20 h-12" />
                  </div>
                </>
              )}

              <Button type="submit" className="w-full btn-gradient rounded-full h-12 text-base font-semibold" size="lg" disabled={loading}>
                {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
              </Button>
            </form>

            {!isSignUp && (
              <div className="text-center mt-4">
                <Link to="/forgot-password" className="text-sm text-primary font-medium hover:underline">Forgot password?</Link>
              </div>
            )}

            <p className="text-center text-sm text-muted-foreground mt-8 font-body">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button onClick={() => setIsSignUp(!isSignUp)} className="text-primary font-semibold hover:underline">
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
