'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas nao coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);

    const { data: authorized, error: authCheckError } = await supabase
      .from('authorized_emails')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (authCheckError || !authorized) {
      setError('Este email nao esta autorizado para cadastro. Entre em contato com a administracao.');
      setLoading(false);
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    });

    if (signInError) {
      setError('Conta criada! Faca login para continuar.');
      setLoading(false);
      return;
    }

    router.push('/dashboard/profile');
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
            className="h-20 w-auto mix-blend-screen"
          />
        </div>
        <h1 className="text-2xl font-bold text-center mb-1">Cadastro de Professor</h1>
        <p className="text-muted text-center mb-6 text-sm">
          Apenas emails autorizados podem se cadastrar
        </p>

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
              placeholder="Minimo 6 caracteres"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
              Confirmar Senha
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full rounded-lg bg-background border border-border px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Repita a senha"
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
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <p className="text-muted text-sm text-center mt-4">
          Ja tem conta?{' '}
          <Link href="/auth/login" className="text-primary hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
