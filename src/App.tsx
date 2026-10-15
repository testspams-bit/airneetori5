/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Logo } from './components/Logo.tsx';
import { SocialModal } from './components/SocialModal.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import { GetInTouchModal } from './components/GetInTouchModal.tsx';
import { Footer } from './components/Footer.tsx';
import { DesktopNav, MobileBottomNav } from './components/Navigation.tsx';
import { AnimatedCursor } from './components/AnimatedCursor.tsx';
import { SupportAgentIcon } from './components/SupportAgentIcon.tsx';
import { AIChatModal } from './components/AIChatModal.tsx';
import { supabase, type AccountRole } from './lib/supabase.ts';
import type { Session } from '@supabase/supabase-js';
import { AboutSection } from './components/AboutSection.tsx';
import { NeetTimer } from './components/NeetTimer.tsx';
import {
  Sun,
  Moon,
  LogIn,
  Mail,
} from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const isDark = theme === 'dark';

  const [activeNav, setActiveNav] = useState<string>('home');
  const [isSocialOpen, setIsSocialOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isGetInTouchOpen, setIsGetInTouchOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [signedInEmail, setSignedInEmail] = useState<string | null>(null);

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    const syncSession = async (session: Session | null) => {
      setSignedInEmail(session?.user.email ?? null);
      if (!session) return;

      const url = new URL(window.location.href);
      const callbackRole = url.searchParams.get('authRole');
      const storedRole = localStorage.getItem('airneet-auth-role');
      const role = (callbackRole || storedRole) as AccountRole | null;
      const currentRole = session.user.user_metadata?.air_neetwork_role;

      const pendingRegistration = localStorage.getItem('airneet-auth-registration');
      let registrationData: { full_name: string; contact_phone: string; contact_email: string } | null = null;
      if (pendingRegistration) {
        try {
          const parsed = JSON.parse(pendingRegistration) as Record<string, unknown>;
          if (typeof parsed.full_name === 'string' && typeof parsed.contact_phone === 'string' && typeof parsed.contact_email === 'string') {
            registrationData = {
              full_name: parsed.full_name,
              contact_phone: parsed.contact_phone,
              contact_email: parsed.contact_email,
            };
          }
        } catch {
          localStorage.removeItem('airneet-auth-registration');
        }
      }

      const userMetadata = {
        ...(role && !currentRole ? { air_neetwork_role: role } : {}),
        ...(registrationData ?? {}),
      };
      if (Object.keys(userMetadata).length > 0) {
        const { error } = await client.auth.updateUser({ data: userMetadata });
        if (!error && registrationData) localStorage.removeItem('airneet-auth-registration');
      }
      localStorage.removeItem('airneet-auth-role');
      if (callbackRole) {
        url.searchParams.delete('authRole');
        window.history.replaceState({}, '', url.toString());
      }
    };

    void client.auth.getSession().then(({ data }) => syncSession(data.session));
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => void syncSession(session), 0);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLoginButton = async () => {
    if (signedInEmail && supabase) {
      await supabase.auth.signOut();
    } else {
      setIsLoginOpen(true);
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 flex flex-col justify-between pb-16 md:pb-0 ${
        isDark
          ? 'bg-[#080808] text-white selection:bg-[#CCFF00] selection:text-black'
          : 'bg-white text-slate-900 selection:bg-[#0066FF] selection:text-white'
      }`}
    >
      {/* Top Header / Navigation Bar */}
      <header
        className={`w-full sticky top-0 z-40 backdrop-blur-md transition-colors ${
          isDark ? 'bg-[#080808]/90 border-b border-zinc-900' : 'bg-white/90 border-b border-slate-200 shadow-xs'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Zone 1 (Left): Brand Logo & Wordmark */}
          <button
            type="button"
            onClick={() => setIsSocialOpen(true)}
            className="flex items-center shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CCFF00] rounded-xl transition-transform active:scale-98 cursor-pointer text-left"
            title="Click to visit Instagram & YouTube channels"
            aria-label="Air NEETwork — Open Instagram and YouTube channels"
          >
            <Logo theme={theme} size="sm" />
          </button>

          {/* Zone 2 (Center): Main Navigation Icons (Balanced in the middle) */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <DesktopNav
              theme={theme}
              activeId={activeNav}
              onSelect={setActiveNav}
            />
          </div>

          {/* Zone 3 (Right): User Controls Cluster (Theme Switcher + Log in) */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Sliding Theme Toggle Switch */}
            <button
              type="button"
              role="switch"
              aria-checked={isDark}
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`relative w-15 sm:w-16 h-8 rounded-full p-1 transition-colors duration-300 ease-in-out border focus:outline-none flex items-center justify-between cursor-pointer select-none shrink-0 ${
                isDark
                  ? 'bg-zinc-900 border-zinc-700'
                  : 'bg-slate-200 border-slate-300'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle dark and light mode"
            >
              {/* Track Background Icons */}
              <Sun
                className={`w-3.5 h-3.5 ml-1 transition-opacity duration-200 ${
                  isDark ? 'text-zinc-600 opacity-60' : 'text-[#0066FF] opacity-90'
                }`}
              />
              <Moon
                className={`w-3.5 h-3.5 mr-1 transition-opacity duration-200 ${
                  isDark ? 'text-[#CCFF00] opacity-90' : 'text-slate-400 opacity-60'
                }`}
              />

              {/* Sliding Thumb Knob */}
              <div
                className={`absolute top-1 left-1 w-6 h-6 rounded-full shadow-md transition-transform duration-300 ease-out flex items-center justify-center ${
                  isDark
                    ? 'translate-x-7 sm:translate-x-8 bg-black text-[#CCFF00] border border-zinc-700'
                    : 'translate-x-0 bg-white text-[#0066FF]'
                }`}
              >
                {isDark ? (
                  <Moon className="w-3.5 h-3.5" />
                ) : (
                  <Sun className="w-3.5 h-3.5" />
                )}
              </div>
            </button>

            {/* Subtle Divider between Theme Control and Log in */}
            <div className={`hidden sm:block h-5 w-px ${isDark ? 'bg-zinc-800' : 'bg-slate-200'}`} />

            {/* Log In Button */}
            <button
              type="button"
              onClick={handleLoginButton}
              className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer active:scale-95 shadow-sm ${
                isDark
                  ? 'bg-[#CCFF00] text-black hover:bg-[#d8ff33]'
                  : 'bg-[#0066FF] text-white hover:bg-[#0052cc] shadow-[#0066FF]/20 shadow-md'
              }`}
              title={signedInEmail ? 'Sign out of your account' : 'Log in to your account'}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{signedInEmail ? 'Sign out' : 'Log in'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* NEET Countdown Urgency Banner Below Navigation Bar */}
      <NeetTimer theme={theme} />

      {/* Main Content Area - Full height so footer is hidden until scroll */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 w-full flex-1 flex flex-col justify-between min-h-[calc(100vh-4rem)]">
        {activeNav === 'about' ? (
          <AboutSection theme={theme} />
        ) : (
          <div className="flex-1" aria-hidden="true" />
        )}

        {/* End of Screen: "Get in touch" Button (Positioned at the end of content, strictly OUTSIDE the footer) */}
        <div className="py-12 flex flex-col items-center justify-center text-center border-t border-zinc-800/50">
          <p className="text-xs font-mono text-zinc-400 mb-4">
            Have questions about mentorship or admissions?
          </p>
          <button
            type="button"
            onClick={() => setIsGetInTouchOpen(true)}
            className={`inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider font-mono transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-lg ${
              isDark
                ? 'bg-[#CCFF00] text-black hover:bg-[#d8ff33]'
                : 'bg-[#0066FF] text-white hover:bg-[#0052cc]'
            }`}
            title="Open contact & callback options"
          >
            <Mail className="w-4 h-4" />
            <span>Get in touch</span>
          </button>
        </div>
      </main>

      {/* Footer Section - Located below the fold, only visible upon scrolling */}
      <Footer theme={theme} />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        theme={theme}
        activeId={activeNav}
        onSelect={setActiveNav}
      />

      {/* Fixed customer support representative icon */}
      <SupportAgentIcon theme={theme} onOpenAIChat={() => setIsAIChatOpen(true)} />

      <AIChatModal
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        theme={theme}
      />

      {/* Get In Touch Modal (WhatsApp, Mobile Number, Request Callback Form) */}
      <GetInTouchModal
        isOpen={isGetInTouchOpen}
        onClose={() => setIsGetInTouchOpen(false)}
        theme={theme}
      />

      {/* Student & Mentor Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        theme={theme}
      />

      {/* Instagram & YouTube Pop-up Modal */}
      <SocialModal
        isOpen={isSocialOpen}
        onClose={() => setIsSocialOpen(false)}
        theme={theme}
      />

      {/* Fluid Animated Mouse Cursor Bubble */}
      <AnimatedCursor theme={theme} />
    </div>
  );
}
