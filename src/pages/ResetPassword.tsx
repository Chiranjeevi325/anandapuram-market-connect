import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Flower2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setReady(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password updated!');
      navigate('/');
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center tonal-card p-10 max-w-md mx-4">
          <ShieldCheck className="h-12 w-12 text-destructive/50 mx-auto mb-4" />
          <p className="text-foreground font-display font-bold text-lg mb-2">Invalid Link</p>
          <p className="text-muted-foreground text-sm font-body">This reset link is invalid or has expired. Please request a new one.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
          <Flower2 className="h-7 w-7 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-display font-bold mb-6">Set New Password</h1>
        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <div>
            <Label htmlFor="password" className="text-sm font-semibold text-foreground mb-1.5 block">New Password</Label>
            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="rounded-xl bg-surface-container-low border-0 focus:bg-surface-container-highest focus:ring-1 focus:ring-primary/20 h-12" />
          </div>
          <Button type="submit" className="w-full btn-gradient rounded-full h-12 text-base font-semibold" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
