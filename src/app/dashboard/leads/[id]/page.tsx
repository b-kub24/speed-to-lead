'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import MessageThread from '@/components/MessageThread';
import { formatDuration } from '@/lib/utils';

interface LeadDetail {
  id: string;
  client_id: string;
  prospect_name: string | null;
  prospect_email: string | null;
  prospect_phone: string | null;
  inquiry_text: string | null;
  status: string;
  received_at: string;
  first_sms_sent_at: string | null;
  first_email_sent_at: string | null;
  time_to_contact_seconds: number | null;
  lead_sources: { name: string; source_type: string } | null;
  clients: { business_name: string; owner_email: string } | null;
  messages: MessageData[];
}

interface MessageData {
  id: string;
  channel: 'sms' | 'email';
  direction: 'outbound' | 'inbound';
  body: string;
  sent_at: string;
  twilio_sid: string | null;
}

const statusOptions: { value: string; label: string; color: string }[] = [
  { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-700' },
  { value: 'contacted', label: 'Contacted', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'replied', label: 'Replied', color: 'bg-green-100 text-green-700' },
  { value: 'booked', label: 'Booked', color: 'bg-purple-100 text-purple-700' },
  { value: 'dead', label: 'Dead', color: 'bg-gray-100 text-gray-500' },
];

export default function LeadDetailPage(): React.ReactElement {
  const params = useParams();
  const leadId = params.id as string;

  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);

  const fetchLead = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch(`/api/leads/${leadId}`);
      if (res.ok) {
        const data = await res.json();
        setLead(data as LeadDetail);
      }
    } catch (err: unknown) {
      console.error('Failed to fetch lead:', err);
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

  const updateStatus = async (newStatus: string): Promise<void> => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setLead((prev: LeadDetail | null) =>
          prev ? { ...prev, status: newStatus } : prev
        );
      }
    } catch (err: unknown) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="h-4 bg-gray-100 rounded w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 bg-gray-100 rounded-xl" />
          <div className="h-64 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Lead not found</h2>
        <Link href="/dashboard" className="text-brand-500 hover:text-brand-600 mt-2 inline-block">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              {lead.prospect_name || 'Unknown Lead'}
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {lead.clients?.business_name} &middot;{' '}
            {lead.lead_sources?.name || 'Unknown source'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Message thread */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Message Thread</h3>
            <MessageThread
              messages={lead.messages}
              loading={false}
            />
          </div>
        </div>

        {/* Right: Lead details sidebar */}
        <div className="space-y-4">
          {/* Status management */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Status</h3>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map(
                (opt: { value: string; label: string; color: string }) => (
                  <button
                    key={opt.value}
                    onClick={() => updateStatus(opt.value)}
                    disabled={updatingStatus || lead.status === opt.value}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      lead.status === opt.value
                        ? `${opt.color} ring-2 ring-offset-1 ring-gray-300`
                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                    } ${updatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {opt.label}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Speed metrics */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Speed-to-Lead</h3>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-gray-500">Time to Contact</span>
                <div
                  className={`text-lg font-bold ${
                    lead.time_to_contact_seconds !== null
                      ? lead.time_to_contact_seconds <= 60
                        ? 'text-green-600'
                        : lead.time_to_contact_seconds <= 300
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      : 'text-gray-400'
                  }`}
                >
                  {lead.time_to_contact_seconds !== null
                    ? formatDuration(lead.time_to_contact_seconds)
                    : 'Not contacted'}
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-500">Received</span>
                <div className="text-sm text-gray-900">
                  {new Date(lead.received_at).toLocaleString()}
                </div>
              </div>
              {lead.first_sms_sent_at && (
                <div>
                  <span className="text-xs text-gray-500">First SMS</span>
                  <div className="text-sm text-gray-900">
                    {new Date(lead.first_sms_sent_at).toLocaleString()}
                  </div>
                </div>
              )}
              {lead.first_email_sent_at && (
                <div>
                  <span className="text-xs text-gray-500">First Email</span>
                  <div className="text-sm text-gray-900">
                    {new Date(lead.first_email_sent_at).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Contact Info</h3>
            <dl className="space-y-3">
              {lead.prospect_name && (
                <div>
                  <dt className="text-xs text-gray-500">Name</dt>
                  <dd className="text-sm text-gray-900">{lead.prospect_name}</dd>
                </div>
              )}
              {lead.prospect_email && (
                <div>
                  <dt className="text-xs text-gray-500">Email</dt>
                  <dd className="text-sm text-gray-900">{lead.prospect_email}</dd>
                </div>
              )}
              {lead.prospect_phone && (
                <div>
                  <dt className="text-xs text-gray-500">Phone</dt>
                  <dd className="text-sm text-gray-900">{lead.prospect_phone}</dd>
                </div>
              )}
              {lead.inquiry_text && (
                <div>
                  <dt className="text-xs text-gray-500">Inquiry</dt>
                  <dd className="text-sm text-gray-900">{lead.inquiry_text}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-gray-500">Source</dt>
                <dd className="text-sm text-gray-900">
                  {lead.lead_sources?.name || 'Unknown'}{' '}
                  <span className="text-gray-400">
                    ({lead.lead_sources?.source_type || ''})
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
