'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ClientRow {
  id: string;
  business_name: string;
  owner_email: string;
  owner_phone: string;
  twilio_phone_number: string;
  active: boolean;
  created_at: string;
}

export default function ClientsPage(): React.ReactElement {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchClients = async (): Promise<void> => {
      try {
        const res = await fetch('/api/clients');
        const data = await res.json();
        setClients(data as ClientRow[]);
      } catch (err: unknown) {
        console.error('Failed to fetch clients:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your client businesses and their configurations
          </p>
        </div>
        <Link
          href="/onboard"
          className="px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors"
        >
          + New Client
        </Link>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i: number) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-48" />
                  <div className="h-3 bg-gray-100 rounded w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : clients.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <svg
            className="w-12 h-12 mx-auto text-gray-300 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No clients yet</h3>
          <p className="text-sm text-gray-500 mb-4">
            Get started by onboarding your first client business.
          </p>
          <Link
            href="/onboard"
            className="inline-flex px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors"
          >
            Onboard First Client
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client: ClientRow) => (
            <Link
              key={client.id}
              href={`/dashboard/clients/${client.id}`}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow block"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-brand-50 rounded-full flex items-center justify-center">
                  <span className="text-brand-600 font-bold text-sm">
                    {client.business_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                    client.active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {client.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900">{client.business_name}</h3>
              <p className="text-sm text-gray-500 mt-1">{client.owner_email}</p>
              <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                <span>{client.owner_phone}</span>
                <span>{client.twilio_phone_number}</span>
              </div>
              <div className="mt-3 text-xs text-gray-400">
                Added{' '}
                {new Date(client.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
