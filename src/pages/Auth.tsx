import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Flower2, ArrowLeft } from 'lucide-react';
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
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="p-4">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to market
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Flower2 className="h-10 w-10 text-primary mx-auto mb-3" />
            <h1 className="text-2xl font-display font-bold text-foreground">
              {isSignUp ? 'Join Anandapuram Market' : 'Welcome Back'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isSignUp ? 'Create your account to start trading' : 'Sign in to your account'}
            </p>
          </div>

          {isSignUp && (
            <div className="flex gap-3 mb-6">
              {(['buyer', 'seller'] as Role[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 text-center font-semibold capitalize transition-all ${
                    role === r
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/30'
                  }`}
                >
                  {r === 'buyer' ? '🛒 Buyer' : '🌾 Seller'}
                  <span className="block text-xs font-normal mt-0.5 text-muted-foreground">
                    {r === 'buyer' ? 'Buy flowers & produce' : 'Sell your farm goods'}
                  </span>
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} required />
              </div>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
            </div>

            {isSignUp && (
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" />
              </div>
            )}

            {isSignUp && role === 'seller' && (
              <>
                <div>
                  <Label htmlFor="farmName">Farm / Vendor Name</Label>
                  <Input id="farmName" value={farmName} onChange={e => setFarmName(e.target.value)} placeholder="e.g., Ramesh Farm" required />
                </div>
                <div>
                  <Label htmlFor="village">Location / Village</Label>
                  <Input id="village" value={village} onChange={e => setVillage(e.target.value)} placeholder="e.g., Gambhiram, Turlavada" required />
                </div>
                <div>
                  <Label htmlFor="primaryProduct">Primary Product</Label>
                  <Input id="primaryProduct" value={primaryProduct} onChange={e => setPrimaryProduct(e.target.value)} placeholder="e.g., Marigold, Jasmine" />
                </div>
              </>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-primary font-semibold hover:underline">
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
