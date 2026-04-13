interface ProfessorAvatarProps {
  name: string;
  photoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = {
  sm: { container: 'w-8 h-8', text: 'text-sm' },
  md: { container: 'w-12 h-12', text: 'text-lg' },
  lg: { container: 'w-16 h-16', text: 'text-2xl' },
};

export default function ProfessorAvatar({ name, photoUrl, size = 'md' }: ProfessorAvatarProps) {
  const { container, text } = SIZES[size];

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className={`${container} rounded-full object-cover border-2 border-primary/30 flex-shrink-0`}
      />
    );
  }

  return (
    <div className={`${container} rounded-full bg-gradient-to-br from-[#5B392D] to-[#D5A891] flex items-center justify-center flex-shrink-0`}>
      <span className={`${text} font-bold text-white`}>
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}
