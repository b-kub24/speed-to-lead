'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import ClientForm from '@/components/ClientForm';
import LeadSourceSetup from '@/components/LeadSourceSetup';

interface ClientFormData {
  business_name: string;
  owner_email: string;
  owner_phone: string;
  twilio_phone_number: string;
  brand_voice_prompt: string;
  booking_link: string;
}

interface StepConfig {
  number: number;
  title: string;
  description: string;
}

const steps: StepConfig[] = [
  { number: 1, title: 'Business Details', description: 'Set up your client profile' },
  { number: 2, title: 'Lead Source', description: 'Connect your first lead source' },
  { number: 3, title: 'Ready!', description: 'Start receiving leads' },
];

export default function OnboardPage(): React.ReactElement {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [clientId, setClientId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleClientSubmit = async (data: ClientFormData): Promise<void> => {
    setLoading(true);
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to create client');
      }

      setClientId(result.id as string);
      setCurrentStep(2);
    } catch (err: unknown) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step: StepConfig, index: number) => (
              <div
                key={step.number}
                className={`flex items-center ${
                  index < steps.length - 1 ? 'flex-1' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      currentStep > step.number
                        ? 'bg-green-500 text-white'
                        : currentStep === step.number
                          ? 'bg-brand-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-sm font-medium text-gray-900">{step.title}</div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Client details */}
        {currentStep === 1 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Set Up Your Business Profile
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Enter your business details. This information is used to configure SMS
              sending and personalize AI-generated messages.
            </p>
            <ClientForm
              onSubmit={handleClientSubmit}
              submitLabel="Continue to Lead Sources"
              loading={loading}
            />
          </div>
        )}

        {/* Step 2: Lead source */}
        {currentStep === 2 && clientId && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Connect Your First Lead Source
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Create a webhook endpoint that your lead forms, Facebook Ads, or CRM can
              send leads to.
            </p>
            <LeadSourceSetup
              clientId={clientId}
              onCreated={() => setCurrentStep(3)}
            />
            <div className="mt-4 text-center">
              <button
                onClick={() => setCurrentStep(3)}
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                Skip for now
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Done */}
        {currentStep === 3 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              You&apos;re All Set!
            </h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Your client is configured and ready to receive leads. When a lead comes
              in through your webhook, they will get an AI-personalized SMS and email
              within 60 seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => router.push(`/dashboard/clients/${clientId}`)}
                className="px-6 py-2.5 bg-brand-500 text-white font-medium rounded-lg hover:bg-brand-600 transition-colors"
              >
                Go to Client Dashboard
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-2.5 bg-white text-gray-700 font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                View Main Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
