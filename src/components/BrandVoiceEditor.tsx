'use client';

import { useState, ChangeEvent } from 'react';

interface BrandVoiceEditorProps {
  clientId: string;
  initialPrompt: string;
  onSaved?: (newPrompt: string) => void;
}

const presets: { label: string; prompt: string }[] = [
  {
    label: 'Professional & Warm',
    prompt:
      'Professional yet warm and approachable. Use the prospect\'s first name. Be enthusiastic about helping them. Mention our expertise and years of experience. Keep messages concise and action-oriented.',
  },
  {
    label: 'Casual & Friendly',
    prompt:
      'Super friendly and casual — like texting a helpful friend. Use first names, keep it short and punchy. Add some personality and energy. Use exclamation marks naturally but don\'t overdo it.',
  },
  {
    label: 'Premium & Exclusive',
    prompt:
      'Refined and polished. Convey exclusivity and premium quality. Use formal language but remain approachable. Emphasize personalized attention and bespoke service. Never sound salesy.',
  },
  {
    label: 'Urgent & Action-Oriented',
    prompt:
      'Direct and action-oriented. Create a sense of urgency without being pushy. Lead with value and specific benefits. Always include a clear next step. Reference limited availability or time-sensitive offers when relevant.',
  },
];

export default function BrandVoiceEditor({
  clientId,
  initialPrompt,
  onSaved,
}: BrandVoiceEditorProps): React.ReactElement {
  const [prompt, setPrompt] = useState<string>(initialPrompt);
  const [saving, setSaving] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSave = async (): Promise<void> => {
    setSaving(true);
    setError('');
    setSaved(false);

    try {
      const res = await fetch('/api/clients', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: clientId,
          brand_voice_prompt: prompt,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      setSaved(true);
      onSaved?.(prompt);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Brand Voice Prompt
        </label>
        <p className="text-xs text-gray-500 mb-3">
          This prompt is sent to the AI every time a new lead comes in. It controls the
          tone, personality, and style of the auto-generated SMS and email messages.
        </p>
        <textarea
          value={prompt}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-y text-sm"
          placeholder="Describe the personality and tone for AI-generated messages..."
        />
      </div>

      {/* Presets */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">
          Quick presets:
        </label>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset: { label: string; prompt: string }) => (
            <button
              key={preset.label}
              onClick={() => setPrompt(preset.prompt)}
              className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Brand voice saved successfully!
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Saving...' : 'Save Brand Voice'}
        </button>
      </div>
    </div>
  );
}
