'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface NavItem {
  href: string;
  label: string;
  show?: boolean;
  danger?: boolean;
  accent?: boolean;
  divider?: boolean;
}

interface DashboardNavProps {
  items: NavItem[];
  userLabel: string;
  isAdmin?: boolean;
  adminBadge?: boolean;
  section?: string; // 'ADMIN' or undefined
}

export default function DashboardNav({ items, userLabel, adminBadge, section }: DashboardNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const visibleItems = items.filter(i => i.show !== false);

  const navContent = (
    <>
      <Link href="/" className="block">
        <Image
          src="/logo.png"
          alt="Med Review"
          width={120}
          height={120}
          className="h-14 w-auto mb-1 mx-auto mix-blend-screen"
        />
      </Link>
      {section && (
        <span className="text-xs text-center text-accent font-semibold mb-6 block">{section}</span>
      )}
      {!section && <div className="mb-6" />}

      <nav className="flex flex-col gap-1 flex-1">
        {visibleItems.map((item, idx) => {
          if (item.divider) {
            return <div key={idx} className="border-t border-border my-2" />;
          }
          const isActive = pathname === item.href || (item.href !== '/dashboard' && item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                isActive
                  ? 'bg-primary/20 text-primary'
                  : item.accent
                    ? 'text-accent hover:bg-card-hover'
                    : item.danger
                      ? 'text-danger hover:bg-card-hover'
                      : 'hover:bg-card-hover'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border pt-4 mt-4">
        <p className="text-muted text-xs truncate mb-1">{userLabel}</p>
        {adminBadge && (
          <span className="inline-block text-[10px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full mb-2">
            ADMIN
          </span>
        )}
        <form action="/api/auth/logout" method="POST">
          <button type="submit" className="text-danger text-sm hover:underline">
            Sair
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="Med Review"
            width={80}
            height={80}
            className="h-10 w-auto mix-blend-screen"
          />
        </Link>
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-lg hover:bg-card-hover transition-colors"
          aria-label="Menu"
        >
          {open ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <aside
            className="absolute left-0 top-0 bottom-0 w-72 bg-card border-r border-border p-6 flex flex-col overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {navContent}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-card border-r border-border p-6 flex-col">
        {navContent}
      </aside>
    </>
  );
}
