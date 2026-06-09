'use client';

import { useState, FormEvent, ChangeEvent } from 'react';

interface LeadSourceFormData {
  client_id: string;
  source_type: string;
  name: string;
}

interface LeadSourceResult {
  id: string;
  webhook_url: string;
  webhook_secret: string;
  instructions: string;
}

interface LeadSourceSetupProps {
  clientId: string;
  onCreated?: (result: LeadSourceResult) => void;
}

const sourceTypes: { value: string; label: string; description: string }[] = [
  {
    value: 'webform',
    label: 'Web Form',
    description: 'Contact forms, landing pages, website forms',
  },
  {
    value: 'fb_leadads',
    label: 'Facebook Lead Ads',
    description: 'Meta Lead Ads via webhook integration',
  },
  {
    value: 'google_lead',
    label: 'Google Lead Form',
    description: 'Google Ads lead form extensions',
  },
  {
    value: 'crm_webhook',
    label: 'CRM Webhook',
    description: 'HubSpot, Salesforce, or other CRM integrations',
  },
  {
    value: 'manual',
    label: 'Manual / API',
    description: 'Custom API integration or manual submissions',
  },
];

export default function LeadSourceSetup({
  clientId,
  onCreated,
}: LeadSourceSetupProps): React.ReactElement {
  const [formData, setFormData] = useState<LeadSourceFormData>({
    client_id: clientId,
    source_type: 'webform',
    name: '',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<LeadSourceResult | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/lead-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create lead source');
      }

      setResult(data as LeadSourceResult);
      onCreated?.(data as LeadSourceResult);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium text-green-800">Lead source created!</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Webhook URL
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-gray-100 px-3 py-2 rounded-lg text-sm font-mono break-all">
                {result.webhook_url}
              </code>
              <button
                onClick={() => navigator.clipboard.writeText(result.webhook_url)}
                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Copy"
              >
                Copy
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Webhook Secret
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-gray-100 px-3 py-2 rounded-lg text-sm font-mono break-all">
                {result.webhook_secret}
              </code>
              <button
                onClick={() => navigator.clipboard.writeText(result.webhook_secret)}
                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Copy"
              >
                Copy
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Include this as the <code className="bg-gray-100 px-1 py-0.5 rounded">x-webhook-secret</code> header
              in your webhook requests.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Test your webhook</h4>
            <code className="block bg-white/50 px-3 py-2 rounded text-xs font-mono whitespace-pre-wrap">
{`curl -X POST '${result.webhook_url}' \\
  -H 'Content-Type: application/json' \\
  -H 'x-webhook-secret: ${result.webhook_secret}' \\
  -d '{
    "name": "Test Lead",
    "email": "test@example.com",
    "phone": "+15551234567",
    "message": "I am interested in your services"
  }'`}
            </code>
          </div>
        </div>

        <button
          onClick={() => {
            setResult(null);
            setFormData((prev: LeadSourceFormData) => ({ ...prev, name: '' }));
          }}
          className="text-brand-600 hover:text-brand-700 text-sm font-medium"
        >
          + Add another lead source
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="source_name" className="block text-sm font-medium text-gray-700 mb-1">
          Source Name *
        </label>
        <input
          id="source_name"
          type="text"
          required
          value={formData.name}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setFormData((prev: LeadSourceFormData) => ({ ...prev, name: e.target.value }))
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
          placeholder="e.g., Website Contact Form, FB Summer Campaign"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Source Type *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sourceTypes.map(
            (st: { value: string; label: string; description: string }) => (
              <button
                key={st.value}
                type="button"
                onClick={() =>
                  setFormData((prev: LeadSourceFormData) => ({
                    ...prev,
                    source_type: st.value,
                  }))
                }
                className={`text-left p-3 rounded-lg border-2 transition-colors ${
                  formData.source_type === st.value
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-sm text-gray-900">{st.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{st.description}</div>
              </button>
            )
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-2.5 bg-brand-500 text-white font-medium rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Creating...' : 'Create Lead Source'}
      </button>
    </form>
  );
}
