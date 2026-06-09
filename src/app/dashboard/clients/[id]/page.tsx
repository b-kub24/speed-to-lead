'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import BrandVoiceEditor from '@/components/BrandVoiceEditor';
import LeadSourceSetup from '@/components/LeadSourceSetup';
import LeadTable from '@/components/LeadTable';
import StatsCards from '@/components/StatsCards';

interface ClientData {
  id: string;
  business_name: string;
  owner_email: string;
  owner_phone: string;
  twilio_phone_number: string;
  brand_voice_prompt: string | null;
  booking_link: string | null;
  active: boolean;
  created_at: string;
}

interface LeadSourceData {
  id: string;
  name: string;
  source_type: string;
  webhook_secret: string;
  active: boolean;
  created_at: string;
}

interface LeadRow {
  id: string;
  prospect_name: string | null;
  prospect_email: string | null;
  prospect_phone: string | null;
  status: string;
  received_at: string;
  time_to_contact_seconds: number | null;
  lead_sources: { name: string; source_type: string } | null;
}

interface StatsData {
  total_leads: number;
  avg_time_to_contact: number | null;
  reply_rate: number;
  booking_rate: number;
  leads_today: number;
  leads_this_week: number;
  leads_this_month: number;
  leads_by_status: Record<string, number>;
}

interface PaginationData {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

type TabId = 'overview' | 'sources' | 'voice' | 'leads';

export default function ClientDetailPage(): React.ReactElement {
  const params = useParams();
  const clientId = params.id as string;

  const [client, setClient] = useState<ClientData | null>(null);
  const [sources, setSources] = useState<LeadSourceData[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);
  const [leadsLoading, setLeadsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [page, setPage] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    const fetchClient = async (): Promise<void> => {
      try {
        const res = await fetch('/api/clients');
        const data = (await res.json()) as ClientData[];
        const found = data.find((c: ClientData) => c.id === clientId);
        setClient(found || null);
      } catch (err: unknown) {
        console.error('Failed to fetch client:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchSources = async (): Promise<void> => {
      try {
        const res = await fetch(`/api/lead-sources?client_id=${clientId}`);
        const data = await res.json();
        setSources(data as LeadSourceData[]);
      } catch (err: unknown) {
        console.error('Failed to fetch sources:', err);
      }
    };

    fetchClient();
    fetchSources();
  }, [clientId]);

  const fetchStats = useCallback(async (): Promise<void> => {
    setStatsLoading(true);
    try {
      const res = await fetch(`/api/dashboard/stats?client_id=${clientId}`);
      const data = await res.json();
      setStats(data as StatsData);
    } catch (err: unknown) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, [clientId]);

  const fetchLeads = useCallback(async (): Promise<void> => {
    setLeadsLoading(true);
    try {
      const params = new URLSearchParams({
        client_id: clientId,
        page: page.toString(),
        per_page: '15',
      });
      if (statusFilter) params.set('status', statusFilter);

      const res = await fetch(`/api/leads?${params}`);
      const data = await res.json();
      setLeads(data.data as LeadRow[]);
      setPagination(data.pagination as PaginationData);
    } catch (err: unknown) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setLeadsLoading(false);
    }
  }, [clientId, page, statusFilter]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (activeTab === 'leads') {
      fetchLeads();
    }
  }, [activeTab, fetchLeads]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="h-4 bg-gray-100 rounded w-64" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Client not found</h2>
        <Link href="/dashboard/clients" className="text-brand-500 hover:text-brand-600 mt-2 inline-block">
          Back to clients
        </Link>
      </div>
    );
  }

  const appUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'leads', label: 'Leads' },
    { id: 'sources', label: 'Lead Sources' },
    { id: 'voice', label: 'Brand Voice' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/clients"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{client.business_name}</h1>
            <span
              className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                client.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {client.active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {client.owner_email} &middot; {client.owner_phone}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {tabs.map((tab: { id: TabId; label: string }) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <StatsCards stats={stats} loading={statsLoading} />

          {/* Client info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Client Details</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Business Name', value: client.business_name },
                { label: 'Owner Email', value: client.owner_email },
                { label: 'Owner Phone', value: client.owner_phone },
                { label: 'Twilio Number', value: client.twilio_phone_number },
                { label: 'Booking Link', value: client.booking_link || 'Not set' },
                {
                  label: 'Created',
                  value: new Date(client.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  }),
                },
              ].map((item: { label: string; value: string }) => (
                <div key={item.label}>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {item.label}
                  </dt>
                  <dd className="text-sm text-gray-900 mt-1">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}

      {activeTab === 'leads' && (
        <LeadTable
          leads={leads}
          loading={leadsLoading}
          pagination={pagination || undefined}
          onPageChange={(p: number) => setPage(p)}
          onStatusFilter={(s: string) => {
            setStatusFilter(s);
            setPage(1);
          }}
        />
      )}

      {activeTab === 'sources' && (
        <div className="space-y-6">
          {/* Existing sources */}
          {sources.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Active Lead Sources</h3>
              {sources.map((source: LeadSourceData) => (
                <div
                  key={source.id}
                  className="bg-white rounded-xl border border-gray-200 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900">{source.name}</span>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        {source.source_type}
                      </span>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        source.active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {source.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>
                      <span className="text-gray-400">Webhook URL: </span>
                      <code className="bg-gray-50 px-1 py-0.5 rounded">
                        {appUrl}/api/webhooks/lead/{source.id}
                      </code>
                    </div>
                    <div>
                      <span className="text-gray-400">Secret: </span>
                      <code className="bg-gray-50 px-1 py-0.5 rounded">
                        {source.webhook_secret}
                      </code>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add new source */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Add Lead Source</h3>
            <LeadSourceSetup
              clientId={clientId}
              onCreated={() => {
                // Refresh sources
                fetch(`/api/lead-sources?client_id=${clientId}`)
                  .then((res) => res.json())
                  .then((data) => setSources(data as LeadSourceData[]))
                  .catch((err: unknown) => console.error(err));
              }}
            />
          </div>
        </div>
      )}

      {activeTab === 'voice' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Brand Voice Configuration</h3>
          <BrandVoiceEditor
            clientId={clientId}
            initialPrompt={client.brand_voice_prompt || ''}
          />
        </div>
      )}
    </div>
  );
}
