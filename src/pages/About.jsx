import React from 'react';
import { FaBrain } from 'react-icons/fa';
import { FiTarget, FiTrendingUp, FiShield } from 'react-icons/fi';

const About = () => {
  const features = [
    {
      icon: <FiTarget />,
      title: 'Precise Targeting',
      description: 'AI-powered audience segmentation and targeting capabilities'
    },
    {
      icon: <FaBrain />,
      title: 'Smart Content',
      description: 'AI-generated personalized content that converts'
    },
    {
      icon: <FiTrendingUp />,
      title: 'Real-time Optimization',
      description: 'Continuous campaign optimization for maximum ROI'
    },
    {
      icon: <FiShield />,
      title: 'Data Security',
      description: 'Enterprise-grade security for your marketing data'
    }
  ];

  return (
    <div className="min-h-screen bg-base-200">
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <h1 className="text-5xl font-bold mb-6">About Us</h1>
              <p className="text-lg mb-8">
                We're revolutionizing digital marketing with artificial intelligence. Our platform combines cutting-edge AI technology with marketing expertise to help businesses identify their perfect audience, create compelling content, and optimize campaigns in real-time.
              </p>
              <p className="text-lg mb-8">
                Founded by marketing experts and AI specialists, we're on a mission to make advanced marketing technology accessible to businesses of all sizes.
              </p>
            </div>
            <div className="lg:w-1/2">
              <img 
                src="/about.png"
                alt="About BrainFox" 
                className="w-full max-w-lg mx-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* What Sets Us Apart Section */}
      <section className="py-20 bg-base-100">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">What Sets Us Apart</h2>
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

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="text-4xl font-bold mb-4 text-center">Our Mission</h2>
              <p className="text-lg text-center max-w-3xl mx-auto">
                To empower businesses with AI-driven marketing solutions that deliver personalized experiences, maximize conversions, and drive sustainable growth through data-driven decision making.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;