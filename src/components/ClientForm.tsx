'use client';

import { useState, FormEvent, ChangeEvent } from 'react';

interface ClientFormData {
  business_name: string;
  owner_email: string;
  owner_phone: string;
  twilio_phone_number: string;
  brand_voice_prompt: string;
  booking_link: string;
}

interface ClientFormProps {
  initialData?: Partial<ClientFormData>;
  onSubmit: (data: ClientFormData) => Promise<void>;
  submitLabel?: string;
  loading?: boolean;
}

export default function ClientForm({
  initialData,
  onSubmit,
  submitLabel = 'Save Client',
  loading = false,
}: ClientFormProps): React.ReactElement {
  const [formData, setFormData] = useState<ClientFormData>({
    business_name: initialData?.business_name || '',
    owner_email: initialData?.owner_email || '',
    owner_phone: initialData?.owner_phone || '',
    twilio_phone_number: initialData?.twilio_phone_number || '',
    brand_voice_prompt: initialData?.brand_voice_prompt || '',
    booking_link: initialData?.booking_link || '',
  });

  const [error, setError] = useState<string>('');

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    setFormData((prev: ClientFormData) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');

    if (!formData.business_name || !formData.owner_email || !formData.owner_phone || !formData.twilio_phone_number) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="business_name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Business Name *
          </label>
          <input
            id="business_name"
            name="business_name"
            type="text"
            required
            value={formData.business_name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
            placeholder="Acme Plumbing"
          />
        </div>

        <div>
          <label
            htmlFor="owner_email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Owner Email *
          </label>
          <input
            id="owner_email"
            name="owner_email"
            type="email"
            required
            value={formData.owner_email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
            placeholder="owner@business.com"
          />
        </div>

        <div>
          <label
            htmlFor="owner_phone"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Owner Phone (for alerts) *
          </label>
          <input
            id="owner_phone"
            name="owner_phone"
            type="tel"
            required
            value={formData.owner_phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
            placeholder="+15551234567"
          />
        </div>

        <div>
          <label
            htmlFor="twilio_phone_number"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Twilio Phone Number *
          </label>
          <input
            id="twilio_phone_number"
            name="twilio_phone_number"
            type="tel"
            required
            value={formData.twilio_phone_number}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
            placeholder="+15559876543"
          />
          <p className="mt-1 text-xs text-gray-400">
            The Twilio number assigned to this client for sending SMS
          </p>
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="booking_link"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Booking Link
          </label>
          <input
            id="booking_link"
            name="booking_link"
            type="url"
            value={formData.booking_link}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors"
            placeholder="https://calendly.com/your-business"
          />
          <p className="mt-1 text-xs text-gray-400">
            If provided, the AI will include this in follow-up emails
          </p>
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="brand_voice_prompt"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Brand Voice Prompt
          </label>
          <textarea
            id="brand_voice_prompt"
            name="brand_voice_prompt"
            rows={4}
            value={formData.brand_voice_prompt}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors resize-y"
            placeholder="Describe the personality and tone for AI-generated messages. E.g.: 'Friendly, casual, use the prospect's first name, mention our 24/7 emergency service, emphasize our 20 years of experience.'"
          />
          <p className="mt-1 text-xs text-gray-400">
            This guides the AI when generating personalized SMS and email responses
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-brand-500 text-white font-medium rounded-lg hover:bg-brand-600 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
