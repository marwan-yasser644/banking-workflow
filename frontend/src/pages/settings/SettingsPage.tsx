import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../auth/AuthContext';

const SettingsPage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ full_name: user?.full_name ?? '', email: user?.email ?? '' });
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-500">Settings</p>
        <h1 className="text-3xl font-semibold text-slate-900">Profile & security</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Card>
          <div className="space-y-6">
            {message ? <Badge variant="success">{message}</Badge> : null}
            <div className="space-y-4">
              <p className="text-sm font-medium text-slate-500">Profile details</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-600">Full name</span>
                  <Input value={profile.full_name} onChange={(event) => setProfile({ ...profile, full_name: event.target.value })} />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-600">Email address</span>
                  <Input value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} type="email" />
                </label>
              </div>
              <Button onClick={() => setMessage('Profile updates are saved locally in this demo.')}>
                Save changes
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-slate-500">Security</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">Account protection</h2>
            </div>
            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-medium text-slate-700">Password strength</p>
                <p className="mt-2 text-sm text-slate-500">Your password is protected with banking-grade hashing and tokens.</p>
                <Badge variant="success">Strong</Badge>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-medium text-slate-700">Two-factor authentication</p>
                <p className="mt-2 text-sm text-slate-500">Configure MFA in your backend security settings.</p>
                <Badge variant="info">Available</Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
