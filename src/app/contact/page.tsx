'use client'
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  MapPin, 
  Phone 
} from 'lucide-react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Reset form after successful submission
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });

      alert('Message sent successfully. We will get back to you soon!');
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitError('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      content: 'support@minijuegostiesos.com',
      color: 'text-[#6366F1]'
    }
  ];

  return (
    <div className="max-w mx-auto pt-20 bg-[#1E293B]/50">
      {/* Enhanced Page Title Section */}
      <div className="w-full bg-[#1E293B]/80 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-bold text-white tracking-tight mb-4">
            Contact Us
          </h1>
          <p className="text-[#6366F1] text-xl font-medium">
            Connect with Our Team - We're Here to Help
          </p>
        </motion.div>
      </div>

      <div className="max-w-7xl px-4 py-20 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid md:grid-cols-2 gap-12"
        >
          {/* Rest of the component remains the same as in the previous version */}
          {/* Contact Form */}
          <div className="bg-[#1E293B]/50 p-8 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] to-[#A5B4FC]">
              Get in Touch
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Form inputs remain the same */}
              <div>
                <label htmlFor="name" className="block text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0F172A] text-white px-4 py-2 rounded-md border border-[#6366F1]/30 focus:ring-2 focus:ring-[#6366F1]"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0F172A] text-white px-4 py-2 rounded-md border border-[#6366F1]/30 focus:ring-2 focus:ring-[#6366F1]"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#0F172A] text-white px-4 py-2 rounded-md border border-[#6366F1]/30 focus:ring-2 focus:ring-[#6366F1]"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full bg-[#0F172A] text-white px-4 py-2 rounded-md border border-[#6366F1]/30 focus:ring-2 focus:ring-[#6366F1]"
                />
              </div>

              {submitError && (
                <div className="text-red-500 text-sm mb-4">
                  {submitError}
                </div>
              )}

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-[#6366F1] hover:bg-[#5B60F4] text-white py-3 rounded-md transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] to-[#A5B4FC]">
              Contact Information
            </h2>
            
            <div className="space-y-6 ">
              {contactInfo.map((info, index) => (
                <div 
                  key={index} 
                  className="bg-[#0F172A] p-6 rounded-xl flex items-center space-x-6 hover:scale-105 transition-transform"
                >
                  <info.icon className={`w-12 h-12 ${info.color}`} />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-300 mb-1">
                      {info.title}
                    </h3>
                    <p className="text-gray-400">{info.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;