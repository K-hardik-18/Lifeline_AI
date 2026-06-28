import { Inter, Outfit } from 'next/font/google';
import "./globals.css";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

export const metadata = {
  title: "LifeLine AI — Your AI-Powered Productivity Companion",
  description: "Stop missing deadlines. LifeLine AI is your intelligent productivity companion that goes beyond reminders — it actively helps you take action, prioritize tasks, and stay on top of everything that matters.",
  keywords: "AI productivity, task management, smart reminders, deadline tracker, AI assistant, Google Gemini",
  openGraph: {
    title: "LifeLine AI — Never Miss a Deadline Again",
    description: "AI-powered productivity companion that prioritizes, plans, and helps you take action before deadlines are missed.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#FDFBF7" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
