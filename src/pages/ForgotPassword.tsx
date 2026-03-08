import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Flower2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="p-4">
        <Link to="/auth" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md text-center">
          <Flower2 className="h-10 w-10 text-primary mx-auto mb-3" />
          <h1 className="text-2xl font-display font-bold mb-2">Reset Password</h1>
          {sent ? (
            <p className="text-muted-foreground">Check your email for a password reset link.</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-left mt-6">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
