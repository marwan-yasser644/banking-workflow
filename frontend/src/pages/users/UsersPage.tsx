import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getUsers, createUser, deleteUser, updateUser } from '../../services/user.service';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const UsersPage = () => {
  const [form, setForm] = useState({ username: '', full_name: '', email: '', password: '', role: 'MAKER' });
  const [alert, setAlert] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers(1, 50),
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setAlert('User created successfully.');
      setForm({ username: '', full_name: '', email: '', password: '', role: 'MAKER' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (data: { id: string; is_active: boolean }) => updateUser(data.id, { is_active: data.is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">User management</p>
          <h1 className="text-3xl font-semibold text-slate-900">Team access control</h1>
        </div>
      </div>

      {alert ? <div className="rounded-3xl bg-emerald-50 p-4 text-sm text-emerald-700">{alert}</div> : null}

      <Card className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-500">New user</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input placeholder="Username" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} />
              <Input placeholder="Full name" value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} />
              <Input placeholder="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              <Input placeholder="Password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
              <select
                value={form.role}
                onChange={(event) => setForm({ ...form, role: event.target.value })}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
              >
                <option value="MAKER">Maker</option>
                <option value="CHECKER">Checker</option>
                <option value="APPROVER">Approver</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <Button onClick={() => createMutation.mutate(form)} disabled={createMutation.status === 'pending'}>
              Add user
            </Button>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">User roles</p>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <p><span className="font-semibold">Maker</span> - Create and submit requests.</p>
              <p><span className="font-semibold">Checker</span> - Validate requests and audit workflow.</p>
              <p><span className="font-semibold">Approver</span> - Approve or reject requests.</p>
              <p><span className="font-semibold">Admin</span> - Manage users and system settings.</p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4">Username</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">Loading users…</td>
                </tr>
              ) : users?.length ? (
                users.map((user) => (
                  <tr key={user.id} className="border-t border-slate-200 hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{user.username}</td>
                    <td className="px-6 py-4">{user.full_name}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">{user.role}</td>
                    <td className="px-6 py-4">
                      <Badge variant={user.is_active ? 'success' : 'danger'}>{user.is_active ? 'Active' : 'Disabled'}</Badge>
                    </td>
                    <td className="px-6 py-4 flex flex-wrap gap-2">
                      <Button variant="secondary" onClick={() => toggleActiveMutation.mutate({ id: String(user.id), is_active: !user.is_active })}>
                        {user.is_active ? 'Disable' : 'Enable'}
                      </Button>
                      <Button variant="ghost" onClick={() => deleteMutation.mutate(String(user.id))}>
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">No user accounts available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default UsersPage;
