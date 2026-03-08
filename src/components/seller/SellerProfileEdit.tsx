import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Camera, Save, User } from 'lucide-react';

interface Profile {
  full_name: string;
  phone: string | null;
  farm_name: string | null;
  village: string | null;
  primary_product: string | null;
  avatar_url: string | null;
}

interface SellerProfileEditProps {
  userId: string;
  initialProfile: Profile;
  onUpdated: () => void;
}

const SellerProfileEdit = ({ userId, initialProfile, onUpdated }: SellerProfileEditProps) => {
  const [form, setForm] = useState<Profile>({ ...initialProfile });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB');
      return;
    }

    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `avatars/${userId}.${ext}`;

    const { error } = await supabase.storage
      .from('product-images')
      .upload(path, file, { upsert: true });

    if (error) {
      toast.error('Upload failed');
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(path);

    setForm(prev => ({ ...prev, avatar_url: urlData.publicUrl }));
    setUploading(false);
    toast.success('Avatar uploaded');
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name,
        phone: form.phone,
        farm_name: form.farm_name,
        village: form.village,
        primary_product: form.primary_product,
        avatar_url: form.avatar_url,
      })
      .eq('user_id', userId);

    setSaving(false);
    if (error) {
      toast.error('Failed to save profile');
    } else {
      toast.success('Profile updated');
      onUpdated();
    }
  };

  const update = (key: keyof Profile, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Edit Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-20 w-20">
              {form.avatar_url ? (
                <AvatarImage src={form.avatar_url} alt="Avatar" />
              ) : null}
              <AvatarFallback className="text-2xl">
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 rounded-full bg-primary text-primary-foreground p-1.5 shadow-md hover:bg-primary/90 transition-colors"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>
          <div>
            <p className="font-medium text-foreground">{form.full_name || 'Your Name'}</p>
            <p className="text-sm text-muted-foreground">{form.farm_name || 'Farm Name'}</p>
          </div>
        </div>

        {/* Fields */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={form.full_name}
              onChange={e => update('full_name', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={form.phone || ''}
              onChange={e => update('phone', e.target.value)}
              placeholder="+91 XXXXX XXXXX"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="farm_name">Farm / Shop Name</Label>
            <Input
              id="farm_name"
              value={form.farm_name || ''}
              onChange={e => update('farm_name', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="village">Village / Location</Label>
            <Input
              id="village"
              value={form.village || ''}
              onChange={e => update('village', e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="primary_product">Primary Product</Label>
            <Input
              id="primary_product"
              value={form.primary_product || ''}
              onChange={e => update('primary_product', e.target.value)}
              placeholder="e.g. Jasmine, Tomatoes"
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SellerProfileEdit;
