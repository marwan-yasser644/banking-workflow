import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, UserCheck, UserX, Shield } from 'lucide-react'
import { userService } from '@/services'
import { PageLoader } from '@/components/ui/Spinner'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { formatDate, getErrorMessage } from '@/utils'
import { Spinner } from '@/components/ui/Spinner'

const ROLE_COLORS: Record<string, string> = {
  ADMIN:    'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  APPROVER: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  CHECKER:  'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  MAKER:    'bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300',
}

const createSchema = z.object({
  username:  z.string().regex(/^[a-zA-Z0-9_]{3,50}$/, '3-50 alphanumeric chars or _'),
  full_name: z.string().min(2, 'Full name required'),
  email:     z.string().email('Invalid email'),
  password:  z.string().min(8).regex(/[A-Z]/, 'Needs uppercase').regex(/\d/, 'Needs a digit'),
  role:      z.enum(['MAKER','CHECKER','APPROVER','ADMIN']),
})
type CreateForm = z.infer<typeof createSchema>

export default function UsersPage() {
  const [showCreate, setShowCreate] = useState(false)
  const { success, error: toastError } = useToast()
  const qc = useQueryClient()

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.list(),
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { role: 'MAKER' },
  })

  const createMut = useMutation({
    mutationFn: (d: CreateForm) => userService.create(d),
    onSuccess: () => {
      success('User created successfully')
      qc.invalidateQueries({ queryKey: ['users'] })
      setShowCreate(false)
      reset()
    },
    onError: (e) => toastError(getErrorMessage(e)),
  })

  const deactivateMut = useMutation({
    mutationFn: (id: number) => userService.deactivate(id),
    onSuccess: () => { success('User deactivated'); qc.invalidateQueries({ queryKey: ['users'] }) },
    onError: (e) => toastError(getErrorMessage(e)),
  })

  return (
    <div className="flex flex-col gap-5 fade-up">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">User Management</h1>
          <p className="text-sm text-[var(--color-muted)]">{users?.length ?? 0} system users</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={16} /> New User
        </button>
      </div>

      {/* Role legend */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(ROLE_COLORS).map(([role, cls]) => (
          <div key={role} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${cls}`}>
            <Shield size={11} /> {role}
          </div>
        ))}
      </div>

      {isLoading ? <PageLoader /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
                {['User','Email','Role','Status','Joined','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {users?.map(u => (
                <tr key={u.id} className="hover:bg-[var(--color-bg)] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[var(--color-brand)] text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                        {u.full_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--color-text)]">{u.full_name}</p>
                        <p className="text-xs text-[var(--color-muted)]">@{u.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-muted)] text-xs">{u.email}</td>
                  <td className="px-4 py-3">
                    <Badge className={ROLE_COLORS[u.role]}>{u.role}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {u.is_active
                      ? <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">Active</Badge>
                      : <Badge className="bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">Inactive</Badge>
                    }
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--color-muted)]">{formatDate(u.created_at)}</td>
                  <td className="px-4 py-3">
                    {u.is_active && (
                      <button
                        onClick={() => {
                          if (confirm(`Deactivate @${u.username}?`)) deactivateMut.mutate(u.id)
                        }}
                        className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 font-medium"
                      >
                        <UserX size={13} /> Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create modal */}
      <Modal open={showCreate} onClose={() => { setShowCreate(false); reset() }} title="Create New User" size="md">
        <form onSubmit={handleSubmit(d => createMut.mutate(d))} className="flex flex-col gap-4">
          {[
            { name: 'full_name' as const, label: 'Full Name',  placeholder: 'Ahmed Mohamed' },
            { name: 'username'  as const, label: 'Username',   placeholder: 'ahmed_maker' },
            { name: 'email'     as const, label: 'Email',      placeholder: 'ahmed@bank.com' },
            { name: 'password'  as const, label: 'Password',   placeholder: 'Min 8 chars, 1 uppercase, 1 digit', type: 'password' },
          ].map(f => (
            <div key={f.name}>
              <label className="label">{f.label}</label>
              <input {...register(f.name)} type={f.type} className="input" placeholder={f.placeholder} />
              {errors[f.name] && <p className="text-xs text-red-500 mt-1">{errors[f.name]?.message}</p>}
            </div>
          ))}

          <div>
            <label className="label">Role</label>
            <select {...register('role')} className="input appearance-none cursor-pointer">
              <option value="MAKER">Maker</option>
              <option value="CHECKER">Checker</option>
              <option value="APPROVER">Approver</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => { setShowCreate(false); reset() }} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={createMut.isPending} className="btn-primary">
              {createMut.isPending ? <><Spinner className="w-4 h-4" /> Creating…</> : <><UserCheck size={15} /> Create User</>}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}