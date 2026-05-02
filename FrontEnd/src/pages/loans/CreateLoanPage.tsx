import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, Send, AlertCircle } from 'lucide-react'
import { loanService } from '@/services'
import { useToast } from '@/components/ui/Toast'
import { Spinner } from '@/components/ui/Spinner'
import { getErrorMessage } from '@/utils'

const schema = z.object({
  applicant_name:      z.string().min(2, 'Full name required'),
  national_id:         z.string().regex(/^\d{14}$/, 'Must be exactly 14 digits'),
  email:               z.string().email('Invalid email address'),
  phone:               z.string().regex(/^\+?[\d\s\-]{10,15}$/, 'Invalid phone number'),
  monthly_salary:      z.coerce.number().min(3000, 'Minimum salary is 3,000 EGP').max(10_000_000),
  employment_type:     z.enum(['EMPLOYED','SELF_EMPLOYED','BUSINESS_OWNER','GOVERNMENT'], {
    required_error: 'Select employment type',
  }),
  loan_amount:         z.coerce.number().min(1000, 'Minimum loan is 1,000 EGP').max(100_000_000),
  loan_tenure_months:  z.coerce.number().min(6, 'Minimum 6 months').max(360, 'Maximum 360 months'),
  loan_purpose:        z.string().min(3, 'Describe the loan purpose'),
})

type FormData = z.infer<typeof schema>

interface FieldProps {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
}

function Field({ label, error, required, children }: FieldProps) {
  return (
    <div>
      <label className="label">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

export default function CreateLoanPage() {
  const navigate = useNavigate()
  const { success, error: toastError } = useToast()

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { employment_type: 'EMPLOYED' },
  })

  const salary = watch('monthly_salary') || 0
  const amount = watch('loan_amount') || 0
  const tenure = watch('loan_tenure_months') || 1
  const dti = salary > 0 ? ((amount / tenure) / salary) * 100 : 0

  const mutation = useMutation({
    mutationFn: (data: FormData) => loanService.create(data),
    onSuccess: (loan) => {
      success(`Loan ${loan.reference_number} submitted — status: ${loan.status}`)
      navigate('/loans')
    },
    onError: (e) => toastError(getErrorMessage(e)),
  })

  return (
    <div className="max-w-3xl mx-auto fade-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="btn-ghost py-1.5 px-2.5">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">New Loan Request</h1>
          <p className="text-sm text-[var(--color-muted)]">Automated processing through the workflow engine</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="flex flex-col gap-5">
        {/* Applicant info */}
        <div className="card p-5">
          <h2 className="text-sm font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[var(--color-brand)] text-white text-xs flex items-center justify-center font-bold">1</span>
            Applicant Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name" error={errors.applicant_name?.message} required>
              <input {...register('applicant_name')} className="input" placeholder="Ahmed Mohamed Ali" />
            </Field>
            <Field label="National ID (14 digits)" error={errors.national_id?.message} required>
              <input {...register('national_id')} className="input" placeholder="29901011234567" maxLength={14} />
            </Field>
            <Field label="Email Address" error={errors.email?.message} required>
              <input {...register('email')} type="email" className="input" placeholder="applicant@example.com" />
            </Field>
            <Field label="Phone Number" error={errors.phone?.message} required>
              <input {...register('phone')} className="input" placeholder="+201001234567" />
            </Field>
            <Field label="Monthly Salary (EGP)" error={errors.monthly_salary?.message} required>
              <input {...register('monthly_salary')} type="number" className="input" placeholder="15000" />
            </Field>
            <Field label="Employment Type" error={errors.employment_type?.message} required>
              <select {...register('employment_type')} className="input appearance-none cursor-pointer">
                <option value="EMPLOYED">Employed</option>
                <option value="GOVERNMENT">Government Employee</option>
                <option value="SELF_EMPLOYED">Self-Employed</option>
                <option value="BUSINESS_OWNER">Business Owner</option>
              </select>
            </Field>
          </div>
        </div>

        {/* Loan details */}
        <div className="card p-5">
          <h2 className="text-sm font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[var(--color-brand)] text-white text-xs flex items-center justify-center font-bold">2</span>
            Loan Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Loan Amount (EGP)" error={errors.loan_amount?.message} required>
              <input {...register('loan_amount')} type="number" className="input" placeholder="200000" />
            </Field>
            <Field label="Tenure (months)" error={errors.loan_tenure_months?.message} required>
              <input {...register('loan_tenure_months')} type="number" className="input" placeholder="60" min={6} max={360} />
            </Field>
            <Field label="Loan Purpose" error={errors.loan_purpose?.message} required>
              <input {...register('loan_purpose')} className="input sm:col-span-2" placeholder="Home renovation, car purchase, etc." />
            </Field>
          </div>
        </div>

        {/* Live DTI preview */}
        {salary > 0 && amount > 0 && (
          <div className={`card p-4 border-2 ${
            dti > 50 ? 'border-red-300 bg-red-50 dark:bg-red-900/10'
            : dti > 35 ? 'border-amber-300 bg-amber-50 dark:bg-amber-900/10'
            : 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/10'
          }`}>
            <div className="flex items-start gap-3">
              <AlertCircle size={16} className={`mt-0.5 flex-shrink-0 ${
                dti > 50 ? 'text-red-500' : dti > 35 ? 'text-amber-500' : 'text-emerald-600'
              }`} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--color-text)]">Live Eligibility Preview</p>
                <div className="grid grid-cols-3 gap-3 mt-2 text-xs">
                  <div>
                    <p className="text-[var(--color-muted)]">Monthly Payment</p>
                    <p className="font-bold text-[var(--color-text)]">
                      {new Intl.NumberFormat('en-EG').format(Math.round(amount / tenure))} EGP
                    </p>
                  </div>
                  <div>
                    <p className="text-[var(--color-muted)]">DTI Ratio</p>
                    <p className={`font-bold ${dti > 50 ? 'text-red-600' : dti > 35 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {dti.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[var(--color-muted)]">Loan / Salary</p>
                    <p className="font-bold text-[var(--color-text)]">
                      {(amount / salary).toFixed(1)}×
                    </p>
                  </div>
                </div>
                {dti > 50 && (
                  <p className="text-xs text-red-600 mt-2">⚠ DTI exceeds 50% — likely to fail validation</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-ghost">
            Cancel
          </button>
          <button type="submit" disabled={mutation.isPending} className="btn-primary">
            {mutation.isPending ? <><Spinner className="w-4 h-4" />Submitting…</> : <><Send size={15} />Submit Request</>}
          </button>
        </div>
      </form>
    </div>
  )
}