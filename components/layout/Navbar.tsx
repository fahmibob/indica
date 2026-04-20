'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/search', label: 'Search' },
  { href: '/about', label: 'About' },
  { href: '/help', label: 'Help' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-14 gap-4">

        {/* Logo + Name */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <Image src="/logo.png" alt="NeuPhiLLM logo" width={64} height={64} className="rounded-lg" />
          <div className="flex flex-col leading-tight">
            <span
              className="font-bold text-base tracking-tight"
              style={{ fontFamily: 'var(--font-poppins), Poppins, sans-serif', color: 'var(--color-primary)' }}
            >
              NeuPhiLLM
            </span>
            <span className="text-[10px] text-gray-400 font-medium hidden sm:block" style={{ marginTop: '-1px' }}>
              Medicinal Plant Database
            </span>
          </div>
          {/* Beta badge */}
          <span className="beta-badge hidden sm:inline-flex">β</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-0.5 ml-auto">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ${
                pathname === l.href
                  ? 'text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              style={pathname === l.href ? { backgroundColor: 'var(--color-primary)' } : {}}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden ml-auto p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden px-4 pb-4 pt-2 flex flex-col gap-1 bg-white border-t border-gray-100">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                pathname === l.href
                  ? 'text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={pathname === l.href ? { backgroundColor: 'var(--color-primary)' } : {}}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
