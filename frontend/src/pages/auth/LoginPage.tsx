import { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(username, password);
    } catch (err) {
      setError('Invalid credentials or server error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-sky-400">Welcome back</p>
        <h1 className="mt-4 text-3xl font-semibold text-white">Secure sign in</h1>
        <p className="mt-2 text-sm text-slate-400">Access your banking workflow management dashboard.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error ? (
          <div className="rounded-3xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-700">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          </div>
        ) : null}

        <div className="space-y-4 rounded-3xl bg-slate-950/80 p-6 shadow-xl shadow-slate-950/30">
          <label className="block text-sm font-medium text-slate-200">Username</label>
          <Input
            className="bg-slate-900/80 text-white placeholder:text-slate-500"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Enter your username"
          />

          <label className="block text-sm font-medium text-slate-200">Password</label>
          <Input
            className="bg-slate-900/80 text-white placeholder:text-slate-500"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </div>

        <p className="text-center text-sm text-slate-400">
          New to the team?{' '}
          <Link to="/register" className="font-semibold text-white hover:text-sky-300">
            Request access
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
