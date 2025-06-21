import React from 'react';
import { FiTarget, FiCpu, FiTrendingUp, FiShield, FiUsers, FiMail, FiPieChart, FiGlobe } from 'react-icons/fi';

const Features = () => {
  const features = [
    {
      icon: <FiTarget />,
      title: 'Smart Audience Targeting',
      description: 'Our AI analyzes customer behavior, demographics, and engagement patterns to identify and segment your ideal audience with precision.'
    },
    {
      icon: <FiCpu />,
      title: 'AI Content Generation',
      description: 'Create compelling, personalized marketing content at scale with our advanced AI that understands your brand voice and audience preferences.'
    },
    {
      icon: <FiTrendingUp />,
      title: 'Real-time Optimization',
      description: 'Automatically optimize your campaigns in real-time based on performance metrics and audience response patterns.'
    },
    {
      icon: <FiUsers />,
      title: 'Behavioral Analytics',
      description: 'Deep insights into customer behavior and engagement patterns to inform your marketing strategy.'
    },
    {
      icon: <FiMail />,
      title: 'Multi-channel Campaigns',
      description: 'Seamlessly manage and optimize campaigns across email, social media, and digital advertising platforms.'
    },
    {
      icon: <FiPieChart />,
      title: 'Advanced Analytics',
      description: 'Comprehensive reporting and analytics to track campaign performance, ROI, and audience engagement metrics.'
    },
    {
      icon: <FiGlobe />,
      title: 'Cross-platform Integration',
      description: 'Integrate with your existing marketing tools and platforms for a seamless workflow.'
    },
    {
      icon: <FiShield />,
      title: 'Data Security',
      description: 'Enterprise-grade security measures to protect your marketing data and customer information.'
    }
  ];

  return (
    <div className="min-h-screen bg-base-200">
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold mb-6">Powerful Features for Modern Marketing</h1>
            <p className="text-lg text-base-content/70">
              Discover how ReachBee's AI-powered features can transform your marketing strategy and drive better results.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-base-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <div className="text-4xl text-primary mb-4">{feature.icon}</div>
                  <h3 className="card-title">{feature.title}</h3>
                  <p className="text-base-content/70">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="card bg-base-100 text-primary-content">
            <div className="card-body text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Marketing?</h2>
              <p className="mb-6">Start using ReachBee today and see the power of AI-driven marketing in action.</p>
              <div className="flex justify-center gap-4">
                <button className="btn btn-primary">Get Started</button>
                <button className="btn btn-outline btn-primary">Request Demo</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features; 