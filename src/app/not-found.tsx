import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center max-w-md">
        <Image
          src="/logo.png"
          alt="Med Review"
          width={120}
          height={120}
          className="h-24 w-auto mx-auto mb-6 mix-blend-screen"
        />
        <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-[#5B392D] via-[#D5A891] to-[#FDE5D9] bg-clip-text text-transparent mb-2">
          404
        </h1>
        <h2 className="text-xl font-bold mb-2">Pagina nao encontrada</h2>
        <p className="text-muted text-sm mb-6">
          A pagina que voce procurou nao existe ou foi movida.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-gradient-to-r from-[#5B392D] to-[#D5A891] px-6 py-2.5 font-semibold text-white hover:opacity-90 transition-opacity"
        >
          Voltar ao Inicio
        </Link>
      </div>
    </div>
  );
}
