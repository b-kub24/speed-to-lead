import Link from 'next/link';

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular: boolean;
}

const features: Feature[] = [
  {
    title: 'Under 60 Seconds',
    description:
      'Every lead gets an AI-personalized SMS and email within 60 seconds of submitting their inquiry. No human delay, no missed opportunities.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'AI-Personalized Messages',
    description:
      'Claude AI crafts unique messages that reference the prospect\'s specific inquiry, match your brand voice, and include a clear next step.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 14.5M14.25 3.104c.251.023.501.05.75.082M19.8 14.5l-2.147 2.146m0 0l2.909 2.909M17.653 16.646a2.25 2.25 0 01-3.182 0l-2.909-2.909m0 0L8.415 16.89" />
      </svg>
    ),
  },
  {
    title: 'Two-Way SMS',
    description:
      'Prospects reply directly. Replies are forwarded to you and logged. Hot-lead keywords trigger instant alerts to your phone.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    title: 'Any Lead Source',
    description:
      'Web forms, Facebook Lead Ads, Google Lead Forms, CRM webhooks — one webhook URL handles them all. Universal lead ingress.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
  },
  {
    title: 'Time-to-Contact Dashboard',
    description:
      'Track your average response time, reply rates, and booking rates. See exactly how fast you are reaching every lead.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    title: 'Hot Lead Alerts',
    description:
      'When a prospect replies with buying intent — "interested", "schedule", "how much" — you get an instant SMS alert. Strike while the iron is hot.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
  },
];

const pricingTiers: PricingTier[] = [
  {
    name: 'Starter',
    price: '$197',
    period: '/month',
    description: 'Perfect for solo operators and small teams just getting started.',
    features: [
      'Up to 100 leads/month',
      'AI-personalized SMS + Email',
      'One lead source',
      'Two-way SMS forwarding',
      'Hot lead alerts',
      'Basic dashboard',
      'Email support',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Growth',
    price: '$297',
    period: '/month',
    description: 'For growing businesses with multiple lead sources and campaigns.',
    features: [
      'Up to 500 leads/month',
      'AI-personalized SMS + Email',
      'Unlimited lead sources',
      'Two-way SMS forwarding',
      'Hot lead alerts',
      'Advanced dashboard & analytics',
      'Custom brand voice',
      'Priority support',
      'Booking link integration',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Scale',
    price: '$497',
    period: '/month',
    description: 'For agencies and multi-location businesses managing many clients.',
    features: [
      'Unlimited leads',
      'AI-personalized SMS + Email',
      'Unlimited lead sources',
      'Two-way SMS forwarding',
      'Hot lead alerts',
      'Full analytics suite',
      'Custom brand voice per client',
      'Multi-client management',
      'API access',
      'Dedicated account manager',
      'White-label options',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export default function LandingPage(): React.ReactElement {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-bold text-xl text-gray-900">
                Lead<span className="text-brand-500">Flash</span>
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-600 hover:text-gray-900">
                Features
              </a>
              <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">
                Pricing
              </a>
              <a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900">
                How It Works
              </a>
              <Link
                href="/dashboard"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </Link>
              <Link
                href="/onboard"
                className="px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-orange-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-100 text-brand-700 text-sm font-medium rounded-full mb-6">
              <span className="inline-block w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
              Responding to leads in under 60 seconds
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 tracking-tight leading-tight mb-6">
              Your Leads Deserve an
              <br />
              <span className="text-brand-500">Instant Response</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              50% of leads go to the first business that responds. LeadFlash sends
              AI-personalized SMS and email to every inbound lead within 60 seconds —
              from any source, 24/7.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/onboard"
                className="px-8 py-3.5 bg-brand-500 text-white font-semibold rounded-xl hover:bg-brand-600 shadow-lg shadow-brand-500/25 transition-all hover:shadow-xl hover:shadow-brand-500/30 text-lg"
              >
                Start Your Free Trial
              </Link>
              <a
                href="#how-it-works"
                className="px-8 py-3.5 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors text-lg"
              >
                See How It Works
              </a>
            </div>

            {/* Social proof */}
            <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                <span>Set up in 10 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { stat: '<60s', label: 'Average response time' },
              { stat: '391%', label: 'More likely to convert' },
              { stat: '24/7', label: 'Always-on follow-up' },
              { stat: '2-way', label: 'SMS conversations' },
            ].map(
              (item: { stat: string; label: string }) => (
                <div key={item.label}>
                  <div className="text-2xl md:text-3xl font-bold text-brand-400">
                    {item.stat}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">{item.label}</div>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Win More Leads
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From instant response to two-way conversations, LeadFlash handles the
              entire speed-to-lead process automatically.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature: Feature) => (
              <div
                key={feature.title}
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center text-brand-500 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How LeadFlash Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Set it up once. Every lead gets a lightning-fast, personal response.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                title: 'Connect Your Sources',
                description:
                  'Plug in your web forms, Facebook Lead Ads, Google Ads, or CRM webhooks with a single URL.',
              },
              {
                step: '2',
                title: 'Customize Your Voice',
                description:
                  'Set your brand voice prompt so every AI-generated message sounds authentically you.',
              },
              {
                step: '3',
                title: 'Lead Comes In',
                description:
                  'A prospect fills out your form. Their data hits our webhook in milliseconds.',
              },
              {
                step: '4',
                title: 'Instant Follow-Up',
                description:
                  'AI crafts a personalized SMS + email and sends both within 60 seconds. You get notified.',
              },
            ].map(
              (
                item: {
                  step: string;
                  title: string;
                  description: string;
                }
              ) => (
                <div key={item.step} className="text-center">
                  <div className="w-12 h-12 bg-brand-500 text-white font-bold text-lg rounded-full flex items-center justify-center mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Start with a 14-day free trial. No credit card required. Cancel anytime.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingTiers.map((tier: PricingTier) => (
              <div
                key={tier.name}
                className={`rounded-2xl p-8 ${
                  tier.popular
                    ? 'bg-gray-900 text-white ring-4 ring-brand-500 relative'
                    : 'bg-white border border-gray-200'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-500 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3
                    className={`text-lg font-semibold mb-2 ${
                      tier.popular ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {tier.name}
                  </h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span
                      className={`text-4xl font-bold ${
                        tier.popular ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {tier.price}
                    </span>
                    <span
                      className={`text-sm ${
                        tier.popular ? 'text-gray-300' : 'text-gray-500'
                      }`}
                    >
                      {tier.period}
                    </span>
                  </div>
                  <p
                    className={`text-sm mt-2 ${
                      tier.popular ? 'text-gray-300' : 'text-gray-500'
                    }`}
                  >
                    {tier.description}
                  </p>
                </div>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature: string) => (
                    <li key={feature} className="flex items-start gap-2">
                      <svg
                        className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                          tier.popular ? 'text-brand-400' : 'text-green-500'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span
                        className={`text-sm ${
                          tier.popular ? 'text-gray-200' : 'text-gray-600'
                        }`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/onboard"
                  className={`block w-full text-center py-3 rounded-xl font-semibold transition-colors ${
                    tier.popular
                      ? 'bg-brand-500 text-white hover:bg-brand-600'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-gradient-to-r from-brand-500 to-orange-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Stop Losing Leads to Slow Follow-Up
          </h2>
          <p className="text-lg text-orange-100 mb-10 max-w-2xl mx-auto">
            Every minute you wait, your chance of converting a lead drops by 10%.
            Start responding instantly today.
          </p>
          <Link
            href="/onboard"
            className="inline-block px-8 py-4 bg-white text-brand-600 font-bold rounded-xl hover:bg-gray-50 shadow-lg transition-all text-lg"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-brand-500 rounded flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-bold text-white">
                Lead<span className="text-brand-400">Flash</span>
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <a href="#features" className="hover:text-white transition-colors">
                Features
              </a>
              <a href="#pricing" className="hover:text-white transition-colors">
                Pricing
              </a>
              <Link href="/dashboard" className="hover:text-white transition-colors">
                Dashboard
              </Link>
            </div>
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} LeadFlash. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
