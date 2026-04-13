'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import type { Class } from '@/types/database';

interface ClassFormProps {
  classData?: Class;
}

export default function ClassForm({ classData }: ClassFormProps) {
  const [grandeTema, setGrandeTema] = useState(classData?.grande_tema || '');
  const [subtema, setSubtema] = useState(classData?.subtema || '');
  const [thumbnailUrl, setThumbnailUrl] = useState(classData?.thumbnail_url || '');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(classData?.thumbnail_url || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  function handleThumbnailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('A imagem deve ter no maximo 2MB.');
        return;
      }
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: professor } = await supabase
      .from('professors')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!professor) {
      setError('Complete seu perfil antes de criar aulas.');
      setLoading(false);
      return;
    }

    const professorId = (professor as { id: string }).id;
    let finalThumbnailUrl = thumbnailUrl;

    if (thumbnailFile) {
      const ext = thumbnailFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('class-thumbnails')
        .upload(fileName, thumbnailFile, { upsert: true });

      if (uploadError) {
        setError('Erro ao enviar imagem: ' + uploadError.message);
        setLoading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('class-thumbnails')
        .getPublicUrl(fileName);
      finalThumbnailUrl = publicUrl;
    }

    if (classData) {
      const { error: updateError } = await supabase
        .from('classes')
        .update({
          grande_tema: grandeTema,
          subtema: subtema || null,
          thumbnail_url: finalThumbnailUrl || null,
        })
        .eq('id', classData.id);

      if (updateError) {
        setError('Erro ao atualizar aula: ' + updateError.message);
        setLoading(false);
        return;
      }
      router.push('/dashboard/classes');
      router.refresh();
    } else {
      const { data: newClass, error: createError } = await supabase
        .from('classes')
        .insert({
          professor_id: professorId,
          grande_tema: grandeTema,
          subtema: subtema || null,
          thumbnail_url: finalThumbnailUrl || null,
        })
        .select()
        .single();

      if (createError || !newClass) {
        setError('Erro ao criar aula: ' + (createError?.message || 'Erro desconhecido'));
        setLoading(false);
        return;
      }

      // Redireciona para pagina de disponibilidade apos criar
      router.push(`/dashboard/classes/${(newClass as { id: string }).id}/availability`);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      {/* Thumbnail */}
      <div>
        <label className="block text-sm font-medium mb-1">Imagem de Capa</label>
        <p className="text-xs text-muted mb-2">Recomendado: 1080x1080px (quadrada) ou 1080x608px (16:9). Max 2MB.</p>
        <div className="flex items-start gap-4">
          {thumbnailPreview && (
            <img
              src={thumbnailPreview}
              alt="Preview"
              className="w-32 h-32 sm:w-32 sm:h-20 rounded-lg object-cover border border-border"
            />
          )}
          <label className="cursor-pointer rounded-lg bg-card border border-border px-4 py-2 text-sm hover:bg-card-hover transition-colors">
            Escolher Imagem
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Grande Tema */}
      <div>
        <label htmlFor="grandeTema" className="block text-sm font-medium mb-1">
          Grande Tema
        </label>
        <input
          id="grandeTema"
          type="text"
          value={grandeTema}
          onChange={(e) => setGrandeTema(e.target.value)}
          required
          className="w-full rounded-lg bg-background border border-border px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Ex: Cardiologia"
        />
      </div>

      {/* Subtema */}
      <div>
        <label htmlFor="subtema" className="block text-sm font-medium mb-1">
          Subtema
        </label>
        <input
          id="subtema"
          type="text"
          value={subtema}
          onChange={(e) => setSubtema(e.target.value)}
          className="w-full rounded-lg bg-background border border-border px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Ex: Bradiarritmias"
        />
      </div>

      {/* Link para gerenciar disponibilidade (apenas em edicao) */}
      {classData && (
        <div className="rounded-xl bg-primary/10 border border-primary/30 p-4">
          <p className="text-sm mb-2">
            <strong>Disponibilidade</strong>
          </p>
          <p className="text-xs text-muted mb-3">
            Defina os dias da semana e horarios que voce pode dar esta aula em cada mes.
          </p>
          <Link
            href={`/dashboard/classes/${classData.id}/availability`}
            className="inline-block rounded-lg border border-primary/40 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
          >
            Gerenciar Disponibilidade
          </Link>
        </div>
      )}

      {!classData && (
        <div className="rounded-xl bg-muted/10 border border-border p-4">
          <p className="text-xs text-muted">
            Apos criar a aula, voce podera definir os dias e horarios disponiveis.
          </p>
        </div>
      )}

      {error && <p className="text-danger text-sm">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-gradient-to-r from-[#5B392D] to-[#D5A891] px-6 py-2.5 font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? 'Salvando...' : classData ? 'Salvar Alteracoes' : 'Criar Aula'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-border px-6 py-2.5 font-semibold hover:bg-card-hover transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
