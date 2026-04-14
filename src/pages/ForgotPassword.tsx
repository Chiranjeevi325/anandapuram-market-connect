import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Flower2, ArrowLeft, Mail } from 'lucide-react';
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
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="p-4 lg:p-6">
        <Link to="/auth" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-body">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 pb-16 pt-8">
        <div className="w-full max-w-md text-center tonal-card p-6 sm:p-10">
          <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-elevated">
            <Flower2 className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-display font-bold mb-2">Reset Password</h1>
          {sent ? (
            <div className="mt-8">
              <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
              <p className="text-foreground font-semibold mb-2">Check your email</p>
              <p className="text-muted-foreground text-sm font-body">We've sent a password reset link to <strong className="text-foreground">{email}</strong>. Click the link to reset your password.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-left mt-8">
              <div>
                <Label htmlFor="email" className="text-sm font-semibold text-foreground mb-1 block">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="rounded-xl bg-surface-container-low border border-outline-variant/15 focus:bg-surface-container-highest focus:ring-1 focus:ring-primary/20 h-12 transition-all" />
              </div>
              <Button type="submit" className="w-full btn-gradient rounded-full h-12 text-base font-semibold mt-2" disabled={loading}>
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
