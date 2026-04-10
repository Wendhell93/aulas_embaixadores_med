'use client';

import { createClient } from '@/lib/supabase/client';
import { GRANDE_AREAS } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [grandeArea, setGrandeArea] = useState(GRANDE_AREAS[0]);
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [message, setMessage] = useState('');
  const [professorId, setProfessorId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: professor } = await supabase
        .from('professors')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (professor) {
        setProfessorId(professor.id);
        setName(professor.name);
        setWhatsapp(professor.whatsapp || '');
        setGrandeArea(professor.grande_area as typeof grandeArea);
        setPhotoUrl(professor.photo_url || '');
        setPhotoPreview(professor.photo_url || '');
      }
      setLoadingProfile(false);
    }
    loadProfile();
  }, []);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage('A imagem deve ter no máximo 2MB.');
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let finalPhotoUrl = photoUrl;

    // Upload photo if changed
    if (photoFile) {
      const ext = photoFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('professor-photos')
        .upload(fileName, photoFile, { upsert: true });

      if (uploadError) {
        setMessage('Erro ao enviar foto: ' + uploadError.message);
        setLoading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('professor-photos')
        .getPublicUrl(fileName);
      finalPhotoUrl = publicUrl;
    }

    if (professorId) {
      // Update
      const { error } = await supabase
        .from('professors')
        .update({
          name,
          whatsapp,
          grande_area: grandeArea,
          photo_url: finalPhotoUrl,
        })
        .eq('id', professorId);

      if (error) {
        setMessage('Erro ao atualizar: ' + error.message);
      } else {
        setMessage('Perfil atualizado com sucesso!');
      }
    } else {
      // Create
      const { error } = await supabase
        .from('professors')
        .insert({
          user_id: user.id,
          name,
          whatsapp,
          grande_area: grandeArea,
          photo_url: finalPhotoUrl,
        });

      if (error) {
        setMessage('Erro ao criar perfil: ' + error.message);
      } else {
        setMessage('Perfil criado com sucesso!');
        router.refresh();
      }
    }

    setLoading(false);
  }

  if (loadingProfile) {
    return <div className="text-muted">Carregando...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        {professorId ? 'Editar Perfil' : 'Completar Perfil'}
      </h1>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
        {/* Photo */}
        <div>
          <label className="block text-sm font-medium mb-2">Foto</label>
          <div className="flex items-center gap-4">
            {photoPreview && (
              <img
                src={photoPreview}
                alt="Preview"
                className="w-20 h-20 rounded-full object-cover border border-border"
              />
            )}
            <label className="cursor-pointer rounded-lg bg-card border border-border px-4 py-2 text-sm hover:bg-card-hover transition-colors">
              Escolher Foto
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Nome Completo
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-lg bg-background border border-border px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* WhatsApp */}
        <div>
          <label htmlFor="whatsapp" className="block text-sm font-medium mb-1">
            WhatsApp (com DDD)
          </label>
          <input
            id="whatsapp"
            type="text"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="w-full rounded-lg bg-background border border-border px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="5511999999999"
          />
        </div>

        {/* Grande Area */}
        <div>
          <label htmlFor="grandeArea" className="block text-sm font-medium mb-1">
            Grande Área
          </label>
          <select
            id="grandeArea"
            value={grandeArea}
            onChange={(e) => setGrandeArea(e.target.value as typeof grandeArea)}
            required
            className="w-full rounded-lg bg-background border border-border px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {GRANDE_AREAS.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>

        {message && (
          <p className={`text-sm ${message.includes('sucesso') ? 'text-primary' : 'text-danger'}`}>
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary px-6 py-2.5 font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
        >
          {loading ? 'Salvando...' : 'Salvar Perfil'}
        </button>
      </form>
    </div>
  );
}
