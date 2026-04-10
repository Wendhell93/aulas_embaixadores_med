'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Email ou senha invalidos.');
      setLoading(false);
      return;
    }

    router.push('/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-card p-8 border border-border">
        <div className="flex justify-center mb-6">
          <Image
            src="/logo.png"
            alt="Med Review"
            width={100}
            height={100}
            className="h-20 w-auto"
          />
        </div>
        <h1 className="text-2xl font-bold text-center mb-1">Entrar</h1>
        <p className="text-muted text-center mb-6 text-sm">Acesse sua area de professor</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg bg-background border border-border px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg bg-background border border-border px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="********"
            />
          </div>

          {error && (
            <p className="text-danger text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-[#5B392D] to-[#D5A891] py-2.5 font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-muted text-sm text-center mt-4">
          Nao tem conta?{' '}
          <Link href="/auth/register" className="text-primary hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
