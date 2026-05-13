import { useState } from 'react';
import { createUser } from '../../auth/auth.service';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
  const [form, setForm] = useState({ username: '', full_name: '', email: '', password: '' });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      await createUser({
        username: form.username,
        email: form.email,
        full_name: form.full_name,
        password: form.password,
        role: 'MAKER',
      });
      setMessage('Request submitted successfully. An administrator will activate the account.');
      setForm({ username: '', full_name: '', email: '', password: '' });
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-sky-400">Request access</p>
        <h1 className="mt-4 text-3xl font-semibold text-white">Register for BankFlow</h1>
        <p className="mt-2 text-sm text-slate-400">Submit your account request and wait for an administrator to approve it.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {message ? <Badge variant="success">{message}</Badge> : null}
        {error ? <Badge variant="danger">{error}</Badge> : null}

        <div className="rounded-3xl bg-slate-950/80 p-6 shadow-xl shadow-slate-950/30">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-200">Full Name</label>
            <Input
              value={form.full_name}
              onChange={(event) => setForm({ ...form, full_name: event.target.value })}
              placeholder="Jane Doe"
              className="bg-slate-900/80 text-white placeholder:text-slate-500"
            />
            <label className="block text-sm font-medium text-slate-200">Email</label>
            <Input
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              type="email"
              placeholder="jane.doe@example.com"
              className="bg-slate-900/80 text-white placeholder:text-slate-500"
            />
            <label className="block text-sm font-medium text-slate-200">Username</label>
            <Input
              value={form.username}
              onChange={(event) => setForm({ ...form, username: event.target.value })}
              placeholder="janedoe"
              className="bg-slate-900/80 text-white placeholder:text-slate-500"
            />
            <label className="block text-sm font-medium text-slate-200">Password</label>
            <Input
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              type="password"
              placeholder="Create password"
              className="bg-slate-900/80 text-white placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
            {loading ? 'Sending request…' : 'Submit request'}
          </Button>
          <Link to="/login" className="text-sm font-semibold text-slate-200 hover:text-white">
            Already have an account?
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;
