import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'NeuPhiLLM — Database of Indonesian Medicinal Plants & Anticancer Activities',
  description:
    'NeuPhiLLM: A Database of Indonesian Medicinal Plants, Phytochemical Compounds, and Anticancer Activities Extracted from Biomedical Literature. Search species, compounds, genes, and diseases from PubMed.',
  keywords: [
    'Indonesian medicinal plants', 'anticancer', 'phytochemicals', 'bioinformatics',
    'NLP', 'PubMed', 'drug discovery', 'NeuPhiLLM',
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${inter.variable} ${poppins.variable}`}>
      <body
        className="min-h-full flex flex-col antialiased"
        style={{ fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif' }}
      >
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
