'use client';

import React, { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    reason: 'Order enquiry',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send message.');
        return;
      }

      setSubmitted(true);
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F5EED8] text-[#2C1509] px-6 py-20">
      <div className="max-w-5xl mx-auto space-y-8">
        <p className="text-xl sm:text-2xl font-bold text-[#2C1509]">
          Orders, returns, or anything else. We answer within two business days.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-6">
          <div className="md:col-span-2 space-y-6">
            {submitted ? (
              <div className="bg-[#EDE2C4] border border-[#2C1509]/20 p-8 rounded-2xl text-center space-y-3">
                <h3 className="text-xl font-black uppercase text-[#2C1509]">Message Sent</h3>
                <p className="text-[#2C1509]/80 text-sm font-mono">
                  Thank you for reaching out! We received your message and will reply to{' '}
                  <span className="font-bold text-[#2C1509]">{formData.email}</span> within two business days.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#2C1509]">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    disabled={loading}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#EDE2C4] border border-[#2C1509]/20 rounded-lg px-4 py-3 text-sm text-[#2C1509] focus:outline-none focus:border-[#2C1509] transition-colors disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#2C1509]">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    disabled={loading}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#EDE2C4] border border-[#2C1509]/20 rounded-lg px-4 py-3 text-sm text-[#2C1509] focus:outline-none focus:border-[#2C1509] transition-colors disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#2C1509]">
                    Reason
                  </label>
                  <select
                    disabled={loading}
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full bg-[#EDE2C4] border border-[#2C1509]/20 rounded-lg px-4 py-3 text-sm text-[#2C1509] focus:outline-none focus:border-[#2C1509] transition-colors disabled:opacity-50"
                  >
                    <option value="Order enquiry">Order enquiry</option>
                    <option value="Returns & Exchanges">Returns &amp; Exchanges</option>
                    <option value="Shipping info">Shipping info</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#2C1509]">
                    Message
                  </label>
                  <textarea
                    rows={5}
                    required
                    disabled={loading}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-[#EDE2C4] border border-[#2C1509]/20 rounded-lg px-4 py-3 text-sm text-[#2C1509] focus:outline-none focus:border-[#2C1509] transition-colors resize-none disabled:opacity-50"
                  />
                </div>

                {error && <p className="text-xs font-semibold text-red-700">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2C1509] text-[#F5EED8] font-black text-xs uppercase tracking-widest py-4 rounded-full hover:bg-[#2C1509]/85 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

          <div className="md:border-l border-[#2C1509]/20 md:pl-10 space-y-8 font-mono">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#2C1509]/65 mb-1">
                Email
              </p>
              <a
                href="mailto:fitbykxg@gmail.com"
                className="text-sm font-semibold text-[#2C1509] underline hover:text-[#2C1509]/70 transition-colors underline-offset-4"
              >
                fitbykxg@gmail.com
              </a>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#2C1509]/65 mb-1">
                Phone / WhatsApp
              </p>
              <a
                href="https://wa.me/2347067913025"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-[#2C1509] underline hover:text-[#2C1509]/70 transition-colors underline-offset-4"
              >
                0706 791 3025
              </a>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#2C1509]/65 mb-1">
                Address
              </p>
              <p className="text-sm font-semibold text-[#2C1509]">KXG</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
