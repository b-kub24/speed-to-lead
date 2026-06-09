'use client';

import { formatDuration } from '@/lib/utils';

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

interface StatsCardsProps {
  stats: StatsData | null;
  loading: boolean;
}

interface CardConfig {
  label: string;
  getValue: (s: StatsData) => string;
  subLabel: string;
  getSubValue: (s: StatsData) => string;
  color: string;
  icon: React.ReactNode;
}

export default function StatsCards({ stats, loading }: StatsCardsProps): React.ReactElement {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i: number) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
            <div className="h-8 bg-gray-200 rounded w-16 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return <div />;

  const cards: CardConfig[] = [
    {
      label: 'Avg. Time to Contact',
      getValue: (s: StatsData) =>
        s.avg_time_to_contact !== null ? formatDuration(s.avg_time_to_contact) : '--',
      subLabel: 'Target: under 60 seconds',
      getSubValue: (s: StatsData) =>
        s.avg_time_to_contact !== null && s.avg_time_to_contact <= 60
          ? 'On target'
          : 'Needs improvement',
      color: 'brand',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Total Leads',
      getValue: (s: StatsData) => s.total_leads.toLocaleString(),
      subLabel: 'Today',
      getSubValue: (s: StatsData) => `${s.leads_today} today / ${s.leads_this_week} this week`,
      color: 'blue',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: 'Reply Rate',
      getValue: (s: StatsData) => `${s.reply_rate}%`,
      subLabel: 'Prospects who replied',
      getSubValue: (s: StatsData) =>
        `${s.leads_by_status.replied + s.leads_by_status.booked} of ${s.total_leads} leads`,
      color: 'green',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      label: 'Booking Rate',
      getValue: (s: StatsData) => `${s.booking_rate}%`,
      subLabel: 'Leads that booked',
      getSubValue: (s: StatsData) => `${s.leads_by_status.booked} booked`,
      color: 'purple',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  const colorMap: Record<string, { bg: string; text: string; icon: string }> = {
    brand: { bg: 'bg-orange-50', text: 'text-orange-700', icon: 'text-orange-500' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'text-blue-500' },
    green: { bg: 'bg-green-50', text: 'text-green-700', icon: 'text-green-500' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', icon: 'text-purple-500' },
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card: CardConfig) => {
        const colors = colorMap[card.color];
        return (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">{card.label}</span>
              <div className={`p-2 rounded-lg ${colors.bg}`}>
                <div className={colors.icon}>{card.icon}</div>
              </div>
            </div>
            <div className={`text-2xl font-bold ${colors.text} mb-1`}>
              {card.getValue(stats)}
            </div>
            <p className="text-xs text-gray-400">{card.getSubValue(stats)}</p>
          </div>
        );
      })}
    </div>
  );
}
