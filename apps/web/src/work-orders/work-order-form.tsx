import { type FormEvent, useId, useState } from 'react';

import { createWorkOrder, type CreatedWorkOrder, type WorkOrderPriority } from '../api/work-orders';

interface FormValues {
  city: string;
  description: string;
  line1: string;
  postalCode: string;
  priority: WorkOrderPriority;
  scheduledFor: string;
  state: string;
  title: string;
}

type FieldErrors = Partial<Record<keyof FormValues, string>>;
type SubmissionState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { message: string; status: 'error' }
  | { order: CreatedWorkOrder; status: 'success' };

const initialValues: FormValues = {
  city: '',
  description: '',
  line1: '',
  postalCode: '',
  priority: 'NORMAL',
  scheduledFor: '',
  state: '',
  title: '',
};

function validate(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};
  if (values.title.trim().length < 3) errors.title = 'Enter at least 3 characters.';
  if (values.title.trim().length > 120) errors.title = 'Enter no more than 120 characters.';
  if (values.description.trim().length > 2_000)
    errors.description = 'Enter no more than 2000 characters.';
  if (!values.scheduledFor) errors.scheduledFor = 'Choose a scheduled date and time.';
  if (values.scheduledFor && new Date(values.scheduledFor) <= new Date())
    errors.scheduledFor = 'Choose a future date and time.';
  if (!values.line1.trim()) errors.line1 = 'Enter the street address.';
  if (!values.city.trim()) errors.city = 'Enter the city.';
  if (!/^[A-Za-z]{2}$/.test(values.state.trim())) errors.state = 'Use a 2-letter state code.';
  if (!/^\d{5}-?\d{3}$/.test(values.postalCode.trim()))
    errors.postalCode = 'Use a valid Brazilian postal code.';
  return errors;
}

interface FieldProps {
  error?: string;
  id: string;
  label: string;
  children: React.ReactNode;
}

function Field({ children, error, id, label }: FieldProps) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {error && (
        <span className="field-error" id={`${id}-error`}>
          {error}
        </span>
      )}
    </div>
  );
}

export function WorkOrderForm() {
  const formId = useId();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submission, setSubmission] = useState<SubmissionState>({ status: 'idle' });

  function update<K extends keyof FormValues>(field: K, value: FormValues[K]): void {
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    const firstInvalidField = Object.keys(nextErrors)[0] as keyof FormValues | undefined;
    if (firstInvalidField) {
      document.getElementById(`${formId}-${firstInvalidField}`)?.focus();
      return;
    }

    setSubmission({ status: 'submitting' });
    try {
      const order = await createWorkOrder({
        address: {
          city: values.city.trim(),
          line1: values.line1.trim(),
          postalCode: values.postalCode.trim(),
          state: values.state.trim().toUpperCase(),
        },
        description: values.description.trim() || undefined,
        priority: values.priority,
        scheduledFor: new Date(values.scheduledFor).toISOString(),
        title: values.title.trim(),
      });
      setSubmission({ order, status: 'success' });
      setValues(initialValues);
    } catch (error) {
      setSubmission({
        message: error instanceof Error ? error.message : 'The work order could not be created.',
        status: 'error',
      });
    }
  }

  const describedBy = (field: keyof FormValues): string | undefined =>
    errors[field] ? `${formId}-${field}-error` : undefined;

  return (
    <section className="work-order-panel" aria-labelledby="work-order-title">
      <div className="panel-intro">
        <p className="eyebrow">New service request</p>
        <h1 id="work-order-title">Create a work order</h1>
        <p>Register the job details so the operations team can prepare dispatch.</p>
      </div>

      <div className="form-column">
        {submission.status === 'success' && (
          <div className="notice notice--success" role="status">
            <strong>Work order created</strong>
            <span>
              Identifier: <code>{submission.order.id}</code>
            </span>
            <span>Status: Pending dispatch</span>
          </div>
        )}
        {submission.status === 'error' && (
          <div className="notice notice--error" role="alert">
            <strong>We could not create the work order</strong>
            <span>{submission.message}</span>
          </div>
        )}

        <form noValidate onSubmit={(event) => void submit(event)}>
          <fieldset disabled={submission.status === 'submitting'}>
            <legend>Work details</legend>
            <div className="form-grid">
              <Field error={errors.title} id={`${formId}-title`} label="Title">
                <input
                  aria-describedby={describedBy('title')}
                  aria-invalid={Boolean(errors.title)}
                  id={`${formId}-title`}
                  maxLength={120}
                  onChange={(event) => update('title', event.target.value)}
                  value={values.title}
                />
              </Field>
              <Field id={`${formId}-priority`} label="Priority">
                <select
                  id={`${formId}-priority`}
                  onChange={(event) => update('priority', event.target.value as WorkOrderPriority)}
                  value={values.priority}
                >
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </Field>
              <Field error={errors.scheduledFor} id={`${formId}-scheduledFor`} label="Schedule for">
                <input
                  aria-describedby={describedBy('scheduledFor')}
                  aria-invalid={Boolean(errors.scheduledFor)}
                  id={`${formId}-scheduledFor`}
                  min={new Date().toISOString().slice(0, 16)}
                  onChange={(event) => update('scheduledFor', event.target.value)}
                  type="datetime-local"
                  value={values.scheduledFor}
                />
              </Field>
              <Field error={errors.description} id={`${formId}-description`} label="Description">
                <textarea
                  aria-describedby={describedBy('description')}
                  aria-invalid={Boolean(errors.description)}
                  id={`${formId}-description`}
                  maxLength={2_000}
                  onChange={(event) => update('description', event.target.value)}
                  rows={4}
                  value={values.description}
                />
              </Field>
            </div>
          </fieldset>

          <fieldset disabled={submission.status === 'submitting'}>
            <legend>Service address</legend>
            <div className="form-grid form-grid--address">
              <Field error={errors.line1} id={`${formId}-line1`} label="Street address">
                <input
                  aria-describedby={describedBy('line1')}
                  aria-invalid={Boolean(errors.line1)}
                  id={`${formId}-line1`}
                  onChange={(event) => update('line1', event.target.value)}
                  value={values.line1}
                />
              </Field>
              <Field error={errors.city} id={`${formId}-city`} label="City">
                <input
                  aria-describedby={describedBy('city')}
                  aria-invalid={Boolean(errors.city)}
                  id={`${formId}-city`}
                  onChange={(event) => update('city', event.target.value)}
                  value={values.city}
                />
              </Field>
              <Field error={errors.state} id={`${formId}-state`} label="State">
                <input
                  aria-describedby={describedBy('state')}
                  aria-invalid={Boolean(errors.state)}
                  id={`${formId}-state`}
                  maxLength={2}
                  onChange={(event) => update('state', event.target.value)}
                  value={values.state}
                />
              </Field>
              <Field error={errors.postalCode} id={`${formId}-postalCode`} label="Postal code">
                <input
                  aria-describedby={describedBy('postalCode')}
                  aria-invalid={Boolean(errors.postalCode)}
                  id={`${formId}-postalCode`}
                  inputMode="numeric"
                  onChange={(event) => update('postalCode', event.target.value)}
                  placeholder="00000-000"
                  value={values.postalCode}
                />
              </Field>
            </div>
          </fieldset>

          <div className="form-actions">
            <button className="primary-action" disabled={submission.status === 'submitting'}>
              {submission.status === 'submitting' ? 'Creating…' : 'Create work order'}
            </button>
            <span>Required fields are validated before submission.</span>
          </div>
        </form>
      </div>
    </section>
  );
}
