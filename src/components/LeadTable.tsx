'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDuration } from '@/lib/utils';

interface LeadRow {
  id: string;
  prospect_name: string | null;
  prospect_email: string | null;
  prospect_phone: string | null;
  status: string;
  received_at: string;
  time_to_contact_seconds: number | null;
  lead_sources: { name: string; source_type: string } | null;
  clients?: { business_name: string } | null;
}

interface LeadTableProps {
  leads: LeadRow[];
  loading: boolean;
  pagination?: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
  onPageChange?: (page: number) => void;
  onStatusFilter?: (status: string) => void;
  showClient?: boolean;
}

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  replied: 'bg-green-100 text-green-700',
  booked: 'bg-purple-100 text-purple-700',
  dead: 'bg-gray-100 text-gray-500',
};

const statusLabels: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  replied: 'Replied',
  booked: 'Booked',
  dead: 'Dead',
};

export default function LeadTable({
  leads,
  loading,
  pagination,
  onPageChange,
  onStatusFilter,
  showClient = false,
}: LeadTableProps): React.ReactElement {
  const [activeFilter, setActiveFilter] = useState<string>('');

  const handleFilterClick = (status: string): void => {
    const newFilter = activeFilter === status ? '' : status;
    setActiveFilter(newFilter);
    onStatusFilter?.(newFilter);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i: number) => (
              <div key={i} className="flex gap-4">
                <div className="h-4 bg-gray-200 rounded w-32" />
                <div className="h-4 bg-gray-200 rounded w-48" />
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="h-4 bg-gray-200 rounded w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Filter bar */}
      <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-500 mr-2">Filter:</span>
        {Object.keys(statusLabels).map((status: string) => (
          <button
            key={status}
            onClick={() => handleFilterClick(status)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeFilter === status
                ? statusColors[status]
                : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
            }`}
          >
            {statusLabels[status]}
          </button>
        ))}
        {activeFilter && (
          <button
            onClick={() => handleFilterClick('')}
            className="text-xs text-gray-400 hover:text-gray-600 ml-2"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                Lead
              </th>
              {showClient && (
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Client
                </th>
              )}
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                Source
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                Status
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                Speed
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                Received
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={showClient ? 6 : 5} className="text-center py-12 text-gray-400">
                  No leads found
                </td>
              </tr>
            ) : (
              leads.map((lead: LeadRow) => (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <Link
                      href={`/dashboard/leads/${lead.id}`}
                      className="block"
                    >
                      <div className="font-medium text-gray-900">
                        {lead.prospect_name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {lead.prospect_email || lead.prospect_phone || '--'}
                      </div>
                    </Link>
                  </td>
                  {showClient && (
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {lead.clients?.business_name || '--'}
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {lead.lead_sources?.name || '--'}
                    </span>
                    <div className="text-xs text-gray-400">
                      {lead.lead_sources?.source_type || ''}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusColors[lead.status] || 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {statusLabels[lead.status] || lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {lead.time_to_contact_seconds !== null ? (
                      <span
                        className={`text-sm font-medium ${
                          lead.time_to_contact_seconds <= 60
                            ? 'text-green-600'
                            : lead.time_to_contact_seconds <= 300
                              ? 'text-yellow-600'
                              : 'text-red-600'
                        }`}
                      >
                        {formatDuration(lead.time_to_contact_seconds)}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">--</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(lead.received_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Showing {(pagination.page - 1) * pagination.per_page + 1} to{' '}
            {Math.min(pagination.page * pagination.per_page, pagination.total)} of{' '}
            {pagination.total} leads
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1 text-sm border border-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.total_pages}
            </span>
            <button
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page >= pagination.total_pages}
              className="px-3 py-1 text-sm border border-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
