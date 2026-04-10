'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Class, ClassSlot } from '@/types/database';

interface Slot {
  id?: string;
  date: string;
  start_time: string;
  end_time: string;
}

interface ClassFormProps {
  classData?: Class;
  existingSlots?: ClassSlot[];
}

export default function ClassForm({ classData, existingSlots }: ClassFormProps) {
  const [grandeTema, setGrandeTema] = useState(classData?.grande_tema || '');
  const [subtema, setSubtema] = useState(classData?.subtema || '');
  const [thumbnailUrl, setThumbnailUrl] = useState(classData?.thumbnail_url || '');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(classData?.thumbnail_url || '');
  const [slots, setSlots] = useState<Slot[]>(
    existingSlots?.map((s) => ({
      id: s.id,
      date: s.date,
      start_time: s.start_time,
      end_time: s.end_time,
    })) || [{ date: '', start_time: '', end_time: '' }]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  function handleThumbnailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('A imagem deve ter no máximo 2MB.');
        return;
      }
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  }

  function addSlot() {
    setSlots([...slots, { date: '', start_time: '', end_time: '' }]);
  }

  function removeSlot(index: number) {
    setSlots(slots.filter((_, i) => i !== index));
  }

  function updateSlot(index: number, field: keyof Slot, value: string) {
    const updated = [...slots];
    updated[index] = { ...updated[index], [field]: value };
    setSlots(updated);
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

    let finalThumbnailUrl = thumbnailUrl;

    // Upload thumbnail if changed
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

    // Valid slots (with all fields filled)
    const validSlots = slots.filter((s) => s.date && s.start_time && s.end_time);

    if (classData) {
      // Update class
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

      // Delete old slots that were removed
      const keepIds = validSlots.filter((s) => s.id).map((s) => s.id!);
      if (existingSlots) {
        const toDelete = existingSlots.filter((s) => !keepIds.includes(s.id));
        for (const slot of toDelete) {
          await supabase.from('class_slots').delete().eq('id', slot.id);
        }
      }

      // Upsert slots
      for (const slot of validSlots) {
        if (slot.id) {
          await supabase
            .from('class_slots')
            .update({ date: slot.date, start_time: slot.start_time, end_time: slot.end_time })
            .eq('id', slot.id);
        } else {
          await supabase.from('class_slots').insert({
            class_id: classData.id,
            date: slot.date,
            start_time: slot.start_time,
            end_time: slot.end_time,
          });
        }
      }
    } else {
      // Create class
      const { data: newClass, error: createError } = await supabase
        .from('classes')
        .insert({
          professor_id: professor.id,
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

      // Insert slots
      if (validSlots.length > 0) {
        const { error: slotError } = await supabase.from('class_slots').insert(
          validSlots.map((s) => ({
            class_id: newClass.id,
            date: s.date,
            start_time: s.start_time,
            end_time: s.end_time,
          }))
        );
        if (slotError) {
          setError('Aula criada, mas erro ao adicionar horários: ' + slotError.message);
          setLoading(false);
          return;
        }
      }
    }

    router.push('/dashboard/classes');
    router.refresh();
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

      {/* Slots */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium">Datas e Horários Disponíveis</label>
          <button
            type="button"
            onClick={addSlot}
            className="text-sm text-accent hover:underline"
          >
            + Adicionar Horário
          </button>
        </div>
        <div className="space-y-2">
          {slots.map((slot, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="date"
                value={slot.date}
                onChange={(e) => updateSlot(index, 'date', e.target.value)}
                className="flex-1 rounded-lg bg-background border border-border px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="time"
                value={slot.start_time}
                onChange={(e) => updateSlot(index, 'start_time', e.target.value)}
                className="rounded-lg bg-background border border-border px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="text-muted text-sm">até</span>
              <input
                type="time"
                value={slot.end_time}
                onChange={(e) => updateSlot(index, 'end_time', e.target.value)}
                className="rounded-lg bg-background border border-border px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {slots.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSlot(index)}
                  className="text-danger hover:underline text-sm px-2"
                >
                  X
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-danger text-sm">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary px-6 py-2.5 font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
        >
          {loading ? 'Salvando...' : classData ? 'Salvar Alterações' : 'Criar Aula'}
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
