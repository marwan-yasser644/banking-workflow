import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { authService } from '@/services'
import { useAuth } from '@/contexts/AuthContext'
import { getErrorMessage } from '@/utils'
import { Spinner } from '@/components/ui/Spinner'

const schema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showPw, setShowPw] = useState(false)
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const mutation = useMutation({
    mutationFn: ({ username, password }: FormData) => authService.login(username, password),
    onSuccess: (data) => {
      login(data.access_token, data.user)
      const role = data.user.role
      if (role === 'MAKER') navigate('/loans')
      else navigate('/dashboard')
    },
    onError: (err) => setServerError(getErrorMessage(err)),
  })

  return (
    <div className="min-h-screen flex bg-[var(--color-bg)]">
      {/* Left panel – branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-[var(--color-brand)] flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute bottom-12 -left-16 w-56 h-56 rounded-full bg-white/5" />
        <div className="absolute top-1/2 right-0 w-32 h-32 rounded-full bg-[var(--color-accent)]/10" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)] flex items-center justify-center">
              <Shield size={20} className="text-[var(--color-brand)]" />
            </div>
            <span className="text-white font-bold text-xl">BankFlow</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Banking Workflow<br />Automation System
          </h1>
          <p className="text-white/60 text-base leading-relaxed max-w-xs">
            Streamlined loan processing with multi-role approvals, automated rule engines, and real-time risk assessment.
          </p>
        </div>

        {/* Stats row */}
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { label: 'Auto Processing', value: '< 2s' },
            { label: 'Rules Checked', value: '6+' },
            { label: 'Roles Supported', value: '4' },
          ].map(s => (
            <div key={s.label} className="bg-white/10 rounded-xl p-4">
              <p className="text-white font-bold text-2xl">{s.value}</p>
              <p className="text-white/50 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md fade-up">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Shield size={24} className="text-[var(--color-brand)]" />
            <span className="font-bold text-xl text-[var(--color-brand)]">BankFlow</span>
          </div>

          <h2 className="text-2xl font-bold text-[var(--color-text)] mb-1">Welcome back</h2>
          <p className="text-[var(--color-muted)] text-sm mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="flex flex-col gap-5">
            {/* Error banner */}
            {serverError && (
              <div className="flex items-start gap-2.5 p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <AlertCircle size={16} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-300">{serverError}</p>
              </div>
            )}

            {/* Username */}
            <div>
              <label className="label">Username</label>
              <input
                {...register('username')}
                className="input"
                placeholder="e.g. maker1"
                autoComplete="username"
                autoFocus
              />
              {errors.username && (
                <p className="text-xs text-red-500 mt-1">{errors.username.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPw ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-text)]"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn-primary w-full justify-center py-3 text-sm mt-1"
            >
              {mutation.isPending ? <><Spinner className="w-4 h-4" /> Signing in…</> : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-8 p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl">
            <p className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-3">Demo Credentials</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { role: 'Admin',    user: 'admin',    pw: 'Admin@1234' },
                { role: 'Maker',    user: 'maker1',   pw: 'Maker@1234' },
                { role: 'Checker',  user: 'checker1', pw: 'Checker@1234' },
                { role: 'Approver', user: 'approver1',pw: 'Approver@1234' },
              ].map(c => (
                <div key={c.role} className="text-xs">
                  <p className="font-semibold text-[var(--color-text)]">{c.role}</p>
                  <p className="text-[var(--color-muted)]">{c.user} / {c.pw}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}