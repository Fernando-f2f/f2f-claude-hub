import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'F2F Claude HUB — Repositório de IA para Marketing',
  description: 'Prompts, vídeos, cursos e recomendações sobre Claude AI curados pela equipe F2F Digital. Acelere seu trabalho com inteligência artificial.',
  keywords: ['Claude AI', 'prompts', 'inteligência artificial', 'marketing', 'F2F Digital', 'agência'],
  openGraph: {
    title: 'F2F Claude HUB',
    description: 'Repositório de conhecimento sobre Claude AI para equipes de marketing e publicidade.',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'F2F Claude HUB',
  },
  twitter: {
    card: 'summary',
    title: 'F2F Claude HUB',
    description: 'Prompts, vídeos e recursos sobre Claude AI para marketing.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
