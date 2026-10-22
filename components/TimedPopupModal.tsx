'use client';

import React, { useState, useEffect } from 'react';
import { X, Mail } from 'lucide-react';
import { subscribeToNewsletter } from '@/app/actions/subscribe';

export default function TimedPopupModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'already_subscribed' | 'error'>('idle');

  useEffect(() => {
    // Check if the user already dismissed or submitted this popup during this session
    const hasSeenPopup = sessionStorage.getItem('kxg_timed_popup_seen');

    if (!hasSeenPopup) {
      // 5 seconds delay (5,000 ms)
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('kxg_timed_popup_seen', 'true');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');

    try {
      const res = await subscribeToNewsletter(email);

      if (res.success) {
        setStatus('success');
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else if (res.isAlreadySubscribed) {
        setStatus('already_subscribed');
        setTimeout(() => {
          handleClose();
        }, 2500);
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-neutral-950 border border-neutral-800 text-white rounded-3xl max-w-md w-full p-8 relative shadow-2xl text-center space-y-6">
        
        {/* Cancel / Close Button */}
        <button
          onClick={handleClose}
          type="button"
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 rounded-full transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Branding & Subtitle */}
        <div className="space-y-2 pt-2">
          <div className="w-12 h-12 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center mx-auto text-white">
            <Mail className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h3 className="text-xl font-black uppercase tracking-wider">
            JOIN THE KXG CLUB
          </h3>
          <p className="text-xs text-neutral-400 font-mono leading-relaxed">
            Get exclusive access to secret drops and VIP member discounts.
          </p>
        </div>

        {/* Form State Displays */}
        {status === 'success' ? (
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl text-xs font-mono text-green-400">
            ✓ YOU'RE IN. WELCOME TO THE COMMUNITY.
          </div>
        ) : status === 'already_subscribed' ? (
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl text-xs font-mono text-amber-400">
            ⚡ ALREADY A MEMBER! YOU'RE ALREADY IN THE CLUB.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              required
              placeholder="Enter your Gmail / email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3.5 text-xs text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-white transition-colors"
            />

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-neutral-200 active:scale-[0.98] transition-all text-xs shadow-lg cursor-pointer"
            >
              {status === 'loading' ? 'CHECKING...' : 'JOIN COMMUNITY'}
            </button>

            {status === 'error' && (
              <p className="text-[11px] text-red-400 font-mono mt-1">
                Failed to subscribe. Please try again.
              </p>
            )}
          </form>
        )}

        {/* Dismiss Link */}
        <button
          onClick={handleClose}
          className="text-xs text-neutral-500 hover:text-neutral-300 underline font-mono cursor-pointer transition-colors"
        >
          No thanks, I'd rather follow
        </button>
      </div>
    </div>
  );
}
