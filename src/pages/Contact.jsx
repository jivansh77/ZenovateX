import React from 'react';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Contact = () => {
  return (
    <div className="min-h-screen bg-base-200 py-20">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-lg text-base-content/70 mb-8">
            Have questions? We're here to help! Fill out the form below and our team will get back to you shortly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-6">Send us a Message</h2>
              <form>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Full Name</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="John Doe" 
                    className="input input-bordered" 
                    required 
                  />
                </div>

                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <input 
                    type="email" 
                    placeholder="your@email.com" 
                    className="input input-bordered" 
                    required 
                  />
                </div>

                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Subject</span>
                  </label>
                  <select 
                    className="select select-bordered w-full"
                    defaultValue=""
                  >
                    <option value="" disabled>Select a topic</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="pricing">Pricing & Plans</option>
                    <option value="demo">Request Demo</option>
                    <option value="integration">Integration Questions</option>
                    <option value="partnership">Partnership Opportunities</option>
                  </select>
                </div>

                <div className="form-control mb-6">
                  <label className="label">
                    <span className="label-text">Message</span>
                  </label>
                  <textarea 
                    className="textarea textarea-bordered h-32" 
                    placeholder="Your message here..."
                    required
                  ></textarea>
                </div>

                <button className="btn btn-primary btn-block">Send Message</button>
              </form>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-6">Contact Information</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <FiMail className="text-2xl text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Email Us</h3>
                      <p className="text-base-content/70">support@aimarketing.com</p>
                      <p className="text-base-content/70">sales@aimarketing.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <FiPhone className="text-2xl text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Call Us</h3>
                      <p className="text-base-content/70">+91 (800) 123-4567</p>
                      <p className="text-base-content/70">24/7 Support Available</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <FiMapPin className="text-2xl text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Visit Us</h3>
                      <p className="text-base-content/70">
                        123 Innovation Hub, Cyber City<br />
                        Gurugram, Haryana 122002<br />
                        India
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Card */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-4">Quick Support</h2>
                <p className="mb-4">Check out our comprehensive FAQ section for instant answers:</p>
                <a href="/faq" className="btn btn-outline btn-primary">View FAQs</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
