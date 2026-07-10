import { Inter, Outfit, Caveat } from 'next/font/google';
import "./globals.css";
import { RoutineProvider } from "@/context/RoutineContext";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";

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

const caveat = Caveat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-caveat',
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
    <html lang="en" className={`${inter.variable} ${outfit.variable} ${caveat.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#4F6EF7" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <RoutineProvider>
              {children}
            </RoutineProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
