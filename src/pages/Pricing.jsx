import React, { useState } from 'react';
import { FiCheck } from 'react-icons/fi';

const Pricing = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const plans = [
    {
      name: 'Basic',
      price: '₹99',
      period: '/month',
      description: 'Perfect for small businesses',
      features: [
        'AI audience analysis',
        'Basic content generation',
        'Email campaign optimization',
        'Real-time analytics',
        'Basic reporting',
        'Email support'
      ],
      buttonText: 'Get Started',
      highlighted: false
    },
    {
      name: 'Pro',
      price: '₹499',
      period: '/month',
      description: 'Ideal for growing businesses',
      features: [
        'Everything in Basic',
        'Advanced audience segmentation',
        'Multi-channel campaigns',
        'A/B testing automation',
        'Custom content templates',
        'Priority support',
        'Advanced analytics',
        'API access'
      ],
      buttonText: 'Go Pro',
      highlighted: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large organizations with complex needs',
      features: [
        'Everything in Pro',
        'Custom AI model training',
        'Dedicated success manager',
        'White-label solutions',
        'Custom integrations',
        'Advanced security features',
        'SLA guarantees',
        '24/7 premium support'
      ],
      buttonText: 'Contact Sales',
      highlighted: false
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow py-20 bg-base-200">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4">Choose Your Plan</h1>
            <p className="text-xl text-base-content/70">
              Get started with our flexible pricing options
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`card bg-base-100 shadow-xl ${
                  plan.highlighted ? 'border-4 border-primary' : ''
                }`}
              >
                <div className="card-body">
                  {plan.highlighted && (
                    <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                      <div className="badge badge-primary">Most Popular</div>
                    </div>
                  )}
                  
                  <h2 className="card-title text-2xl font-bold">{plan.name}</h2>
                  <div className="my-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-base-content/70">{plan.period}</span>
                  </div>
                  <p className="text-base-content/70 mb-6">{plan.description}</p>
                  
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <FiCheck className="text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="card-actions mt-auto">
                    <button 
                      className={`btn btn-block ${
                        plan.highlighted ? 'btn-primary' : 'btn-outline'
                      }`}
                    >
                      {plan.buttonText}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                {
                  question: "Can I switch plans later?",
                  answer: "Yes, you can upgrade or downgrade your plan at any time. Your AI models and campaign data will be preserved when switching plans."
                },
                {
                  question: "What payment methods do you accept?",
                  answer: "We accept all major credit cards, debit cards, and UPI payments. Enterprise customers can opt for invoice-based payments."
                },
                {
                  question: "Do you offer a free trial?",
                  answer: "Yes, we offer a 14-day free trial on our Basic and Pro plans so you can experience the power of AI-driven marketing."
                }
              ].map((faq, index) => (
                <div key={index} className="rounded-3xl bg-base-100 shadow-sm">
                  <button
                    className="w-full px-6 py-4 flex justify-between items-center hover:bg-opacity-50 transition-all duration-200"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <span className="text-xl font-medium">{faq.question}</span>
                    <svg
                      className={`w-6 h-6 transform transition-transform duration-200 ${
                        openFaq === index ? 'rotate-45' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </button>
                  <div
                    className={`px-6 overflow-hidden transition-all duration-200 ${
                      openFaq === index ? 'max-h-40 py-4' : 'max-h-0'
                    }`}
                  >
                    <p className="text-base-content/70">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
