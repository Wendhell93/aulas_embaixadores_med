'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.toLowerCase().trim(),
      {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      }
    );

    if (error) {
      toast.error('Erro: ' + error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
    toast.success('Email enviado! Verifique sua caixa de entrada.');
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
        <h1 className="text-2xl font-bold text-center mb-1">Recuperar Senha</h1>
        <p className="text-muted text-center mb-6 text-sm">
          {sent
            ? 'Enviamos um link para seu email. Verifique sua caixa de entrada e spam.'
            : 'Digite seu email e enviaremos um link para redefinir sua senha.'}
        </p>

        {!sent && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full rounded-lg bg-background border border-border px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="seu@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-[#5B392D] to-[#D5A891] py-2.5 font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar Link'}
            </button>
          </form>
        )}

        <p className="text-muted text-sm text-center mt-4">
          <Link href="/auth/login" className="text-primary hover:underline">
            Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  );
}
