import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiFileText, FiCpu, FiTrendingUp, FiShield } from 'react-icons/fi';
import useTypewriter from '../hooks/useTypewriter';
import EventTrigger from '../components/EventTrigger';

const Home = () => {
  const titleText = useTypewriter([
    "Create Personalized Content",
    "Maximize Conversions",
    "Boost Customer Satisfaction"
  ], 100, 50, 3000);
  const [openFaq, setOpenFaq] = useState(null);

  const features = [
    { 
      icon: <FiFileText />, 
      title: 'Smart Audience Analysis', 
      description: 'Identify and understand your target audience with AI-powered insights' 
    },
    { 
      icon: <FiCpu />, 
      title: 'Personalized Content', 
      description: 'Create tailored marketing content that resonates with your audience' 
    },
    { 
      icon: <FiTrendingUp />, 
      title: 'Real-time Adaptation', 
      description: 'Automatically adjust campaigns based on performance metrics' 
    },
    { 
      icon: <FiShield />, 
      title: 'Conversion Optimization', 
      description: 'Maximize ROI with AI-driven campaign optimization' 
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Marketing Director',
      image: 'https://api.uifaces.co/our-content/donated/xZ4wg2Xj.jpg',
      content: "ReachBee has transformed our marketing strategy. The AI-powered insights helped us increase our conversion rates by 45% in just three months."
    },
    {
      name: 'Michael Rodriguez',
      role: 'Digital Marketing Manager',
      image: 'https://randomuser.me/api/portraits/men/42.jpg',
      content: "The personalized content generation is incredible. We're saving hours of work while delivering more engaging campaigns to our audience."
    },
    {
      name: 'Emily Thompson',
      role: 'E-commerce Director',
      image: 'https://randomuser.me/api/portraits/women/32.jpg',
      content: "The real-time optimization has been a game-changer for our campaigns. Our ROI has improved significantly since we started using ReachBee."
    }
  ];

  const faqs = [
    {
      question: 'How does the AI identify target audiences?',
      answer: 'Our AI analyzes customer data, behavior patterns, and market trends to create detailed audience segments and personas.'
    },
    {
      question: 'Can I customize the content generation?',
      answer: 'Yes, you can set brand guidelines, tone preferences, and specific marketing goals to guide the AI content creation.'
    },
    {
      question: 'How quickly does the system adapt to changes?',
      answer: 'Our platform monitors campaign performance in real-time and makes instant adjustments to optimize results.'
    },
    {
      question: 'What types of campaigns can I create?',
      answer: 'You can create email, social media, content marketing, and digital advertising campaigns, all optimized by our AI.'
    }
  ];

  return (
    <div className="min-h-screen">
      <EventTrigger />
      {/* Hero Section */}
      <section className="hero bg-base-200 min-h-screen">
        <div className="hero-content flex-col lg:flex-row">
          <div className="ml-12">
            <h1 className="text-5xl font-bold">{titleText}
              <span className="animate-blink">|</span>
            </h1>
            <p className="py-6">
              Transform your marketing strategy with ReachBee's AI-powered platform. Identify your perfect audience, create personalized content, and optimize campaigns in real-time for maximum impact and ROI.
            </p>
            <Link to="/dashboard" className="btn btn-primary">
              Get Started
            </Link>
          </div>
          <img
            src="/photo2.png"
            className="max-w-xl rounded-lg" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-base-100">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Transform Your Marketing Strategy</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card bg-base-200 shadow-xl">
                <div className="card-body items-center text-center">
                  <div className="text-4xl text-primary mb-4">{feature.icon}</div>
                  <h3 className="card-title">{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-base-200">
        <div>
          <h2 className="text-4xl font-bold text-center mb-12">What Our Clients Say</h2>
          <div className="relative w-full overflow-hidden">
            <div className="flex w-[230%] animate-scroll hover:pause">
              {[...testimonials, ...testimonials].map((testimonial, index) => (
                <div 
                  key={index} 
                  className="w-1/6 flex-shrink-0 px-4"
                >
                  <div className="card bg-base-100 shadow-xl h-full">
                    <div className="card-body items-center text-center">
                      <div className="avatar mb-4">
                        <div className="w-24 rounded-full">
                          <img src={testimonial.image} alt={testimonial.name} />
                        </div>
                      </div>
                      <p className="mb-4">{testimonial.content}</p>
                      <h3 className="font-bold">{testimonial.name}</h3>
                      <p className="text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features That Set Us Apart Section */}
      <section className="py-20 bg-base-100">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Features That Set Us Apart</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-2xl mb-4">Advanced AI Technology</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Next-gen AI models for audience analysis and content creation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Real-time optimization with 99% accuracy</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Predictive analytics for campaign performance</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-2xl mb-4">Marketing Excellence</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Multi-channel campaign management</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Personalized content at scale</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Advanced audience segmentation and targeting</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section Summary */}
      <section className="py-20 bg-base-200">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to dive into your documents?</h2>
          <p className="text-xl mb-4 text-sm">Get started for free today</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {['Basic', 'Pro', 'Enterprise'].map((plan) => (
              <div key={plan} className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="text-2xl font-bold">{plan}</h3>
                  <div className="text-3xl font-bold my-4">
                    {plan === 'Enterprise' ? 'Custom' : `₹${plan === 'Basic' ? '29' : '99'}`}
                    {plan !== 'Enterprise' && <span className="text-sm">/month</span>}
                  </div>
                  <Link to="/pricing" className="btn btn-primary">View Details</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-base-100">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="max-w-2xl mx-auto">
            {faqs.map((faq, index) => (
              <div key={index} className="mb-4 rounded-3xl bg-base-200 shadow-sm">
                <button
                  className="w-full px-6 py-4 flex justify-between items-center hover:bg-opacity-50 transition-all duration-200"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="text-xl font-medium text-left">{faq.question}</span>
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
      </section>
    </div>
  );
};

export default Home;