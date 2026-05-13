import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createLoanRequest, getLoanRequest, updateLoanRequest } from '../../services/loan.service';
import { LoanRequest } from '../../types';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../utils/format';

const defaultForm = {
  applicant_name: '',
  national_id: '',
  email: '',
  phone: '',
  monthly_salary: '',
  employment_type: 'EMPLOYED',
  loan_amount: '',
  loan_tenure_months: '',
  loan_purpose: '',
};

const CreateRequestPage = ({ editMode = false }: { editMode?: boolean }) => {
  const { requestId } = useParams<{ requestId: string }>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [form, setForm] = useState(defaultForm);
  const [message, setMessage] = useState<string | null>(null);

  const { data: request, isSuccess } = useQuery<LoanRequest>({
    queryKey: ['loanRequest', requestId],
    queryFn: () => getLoanRequest(requestId!),
    enabled: editMode && Boolean(requestId),
  });

  useEffect(() => {
    if (editMode && request) {
      setForm({
        applicant_name: request.applicant_name,
        national_id: request.national_id,
        email: request.email,
        phone: request.phone,
        monthly_salary: String(request.monthly_salary),
        employment_type: request.employment_type,
        loan_amount: String(request.loan_amount),
        loan_tenure_months: String(request.loan_tenure_months),
        loan_purpose: request.loan_purpose,
      });
    }
  }, [editMode, request]);

  useEffect(() => {
    if (!editMode) {
      setForm(defaultForm);
    }
  }, [editMode]);

  const createMutation = useMutation({
    mutationFn: createLoanRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loanRequests'] });
      navigate('/requests');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: any) => updateLoanRequest(requestId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loanRequest', requestId] });
      queryClient.invalidateQueries({ queryKey: ['loanRequests'] });
      navigate(`/requests/${requestId}`);
    },
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    const payload = {
      applicant_name: form.applicant_name,
      national_id: form.national_id,
      email: form.email,
      phone: form.phone,
      monthly_salary: Number(form.monthly_salary),
      employment_type: form.employment_type,
      loan_amount: Number(form.loan_amount),
      loan_tenure_months: Number(form.loan_tenure_months),
      loan_purpose: form.loan_purpose,
    };

    try {
      if (editMode) {
        await updateMutation.mutateAsync(payload);
      } else {
        await createMutation.mutateAsync(payload);
      }
      setMessage('Request saved successfully.');
    } catch {
      setMessage('Unable to save request. Please check input values.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{editMode ? 'Edit request' : 'Create loan request'}</p>
          <h1 className="text-3xl font-semibold text-slate-900">{editMode ? 'Update application details' : 'New credit request'}</h1>
        </div>
        <Button onClick={() => navigate('/requests')} variant="secondary">
          Back to requests
        </Button>
      </div>

      <Card className="space-y-6">
        {message ? <div className="rounded-3xl bg-slate-100 p-4 text-sm text-slate-700">{message}</div> : null}
        <form className="grid gap-6 lg:grid-cols-2" onSubmit={handleSubmit}>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-600">Applicant name</span>
            <Input value={form.applicant_name} onChange={(event) => setForm({ ...form, applicant_name: event.target.value })} placeholder="Enter name" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-600">Email address</span>
            <Input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="applicant@example.com" type="email" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-600">National ID</span>
            <Input value={form.national_id} onChange={(event) => setForm({ ...form, national_id: event.target.value })} placeholder="14-digit national ID" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-600">Phone number</span>
            <Input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+1 555 123 4567" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-600">Monthly salary</span>
            <Input value={form.monthly_salary} onChange={(event) => setForm({ ...form, monthly_salary: event.target.value })} placeholder="3000" type="number" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-600">Loan amount</span>
            <Input value={form.loan_amount} onChange={(event) => setForm({ ...form, loan_amount: event.target.value })} placeholder="15000" type="number" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-600">Employment type</span>
            <select
              value={form.employment_type}
              onChange={(event) => setForm({ ...form, employment_type: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
            >
              <option value="EMPLOYED">Employed</option>
              <option value="SELF_EMPLOYED">Self-employed</option>
              <option value="BUSINESS_OWNER">Business owner</option>
              <option value="GOVERNMENT">Government</option>
            </select>
          </label>
          <label className="space-y-2 lg:col-span-2">
            <span className="text-sm font-medium text-slate-600">Loan purpose</span>
            <Input value={form.loan_purpose} onChange={(event) => setForm({ ...form, loan_purpose: event.target.value })} placeholder="Loan purpose description" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-600">Loan tenure (months)</span>
            <Input value={form.loan_tenure_months} onChange={(event) => setForm({ ...form, loan_tenure_months: event.target.value })} placeholder="36" type="number" />
          </label>
          <div className="grid lg:col-span-2 gap-4 sm:grid-cols-2">
            <Button type="submit" className="w-full" disabled={createMutation.status === 'pending' || updateMutation.status === 'pending'}>
              {editMode ? 'Update request' : 'Create request'}
            </Button>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Estimated monthly payment</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">{form.loan_amount ? formatCurrency(Number(form.loan_amount)) : '--'}</p>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateRequestPage;
