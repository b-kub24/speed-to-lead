'use client';

import { useState, useEffect, useCallback } from 'react';
import StatsCards from '@/components/StatsCards';
import LeadTable from '@/components/LeadTable';

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

interface LeadRow {
  id: string;
  prospect_name: string | null;
  prospect_email: string | null;
  prospect_phone: string | null;
  status: string;
  received_at: string;
  time_to_contact_seconds: number | null;
  lead_sources: { name: string; source_type: string } | null;
  clients: { business_name: string } | null;
}

interface PaginationData {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

type Period = 'all' | 'today' | 'week' | 'month';

export default function DashboardPage(): React.ReactElement {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [leadsLoading, setLeadsLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [period, setPeriod] = useState<Period>('all');
  const [page, setPage] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const fetchStats = useCallback(async (): Promise<void> => {
    setStatsLoading(true);
    try {
      const res = await fetch(`/api/dashboard/stats?period=${period}`);
      const data = await res.json();
      setStats(data as StatsData);
    } catch (err: unknown) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, [period]);

  const fetchLeads = useCallback(async (): Promise<void> => {
    setLeadsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '25',
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
  }, [page, statusFilter]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor your speed-to-lead performance across all clients
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'today', 'week', 'month'] as Period[]).map((p: Period) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                period === p
                  ? 'bg-brand-500 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {p === 'all' ? 'All Time' : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats cards */}
      <StatsCards stats={stats} loading={statsLoading} />

      {/* Leads table */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Leads</h2>
        <LeadTable
          leads={leads}
          loading={leadsLoading}
          pagination={pagination || undefined}
          onPageChange={(p: number) => setPage(p)}
          onStatusFilter={(s: string) => {
            setStatusFilter(s);
            setPage(1);
          }}
          showClient={true}
        />
      </div>
    </div>
  );
}
