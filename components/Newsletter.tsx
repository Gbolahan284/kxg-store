'use client';

import { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevents page refresh
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setMessage('Subscribed!');
        setEmail('');
      } else {
        setMessage('Something went wrong.');
      }
    } catch (err) {
      setMessage('Failed to send.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-white text-black font-bold px-6 py-2 rounded-lg hover:bg-neutral-200 transition-colors"
        >
          {loading ? '...' : 'SUBSCRIBE'}
        </button>
      </form>
      {message && <p className="text-xs text-neutral-400 mt-2">{message}</p>}
    </div>
  );
}