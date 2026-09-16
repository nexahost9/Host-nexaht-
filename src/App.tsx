import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { Benefits } from './components/Benefits.tsx';
import { PlansSection } from './components/PlansSection.tsx';
import { AboutSection } from './components/AboutSection.tsx';
import { PartnershipSection } from './components/PartnershipSection.tsx';
import { FAQSection } from './components/FAQSection.tsx';
import { SupportContactSection } from './components/SupportContactSection.tsx';
import { Footer } from './components/Footer.tsx';
import { TopBanner } from './components/TopBanner.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { LegalModal } from './components/LegalModals.tsx';
import { ClientDashboard } from './components/ClientDashboard.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { Plan } from './types/index.ts';

function MainContent() {
  const { user, openAuthModal } = useAuth();

  // Current view state: 'home' | 'client' | 'admin'
  const [currentView, setCurrentView] = useState<'home' | 'client' | 'admin'>('home');
  const [clientInitialTab, setClientInitialTab] = useState<'dashboard' | 'orders' | 'vps' | 'payments' | 'tickets' | 'profile'>('dashboard');

  // Checkout modal
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<Plan | null>(null);

  // Legal modal
  const [legalModalType, setLegalModalType] = useState<'terms' | 'privacy' | 'refund' | null>(null);

  // Navigation handlers
  const handleNavigateHome = () => {
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateClient = (tab: 'dashboard' | 'orders' | 'vps' | 'payments' | 'tickets' | 'profile' = 'dashboard') => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    setClientInitialTab(tab);
    setCurrentView('client');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateAdmin = () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    if (user.role !== 'admin') {
      alert('Acesso restrito a administradores.');
      return;
    }
    setCurrentView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCheckout = (plan?: Plan) => {
    setSelectedPlanForCheckout(plan || null);
    setCheckoutOpen(true);
  };

  const handleScrollToSection = (sectionId: string) => {
    if (currentView !== 'home') {
      setCurrentView('home');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-['Inter'] selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Announcements Banner */}
      <TopBanner />

      {/* Main Navbar (shown on home & client view) */}
      {currentView !== 'admin' && (
        <Navbar
          onOpenCheckout={() => handleOpenCheckout()}
          onNavigateClient={() => handleNavigateClient('dashboard')}
          onNavigateAdmin={handleNavigateAdmin}
          onNavigateHome={handleNavigateHome}
        />
      )}

      {/* VIEWS */}
      {currentView === 'home' && (
        <main className="flex-1">
          <Hero
            onViewPlans={() => handleScrollToSection('plans')}
            onHireNow={() => handleOpenCheckout()}
          />
          <Benefits />
          <PlansSection onSelectPlan={plan => handleOpenCheckout(plan)} />
          <AboutSection />
          <PartnershipSection />
          <FAQSection />
          <SupportContactSection onOpenTicket={() => handleNavigateClient('tickets')} />
        </main>
      )}

      {currentView === 'client' && (
        <main className="flex-1">
          <ClientDashboard
            initialTab={clientInitialTab}
            onNavigateHome={handleNavigateHome}
            onOpenCheckout={() => handleOpenCheckout()}
          />
        </main>
      )}

      {currentView === 'admin' && (
        <main className="flex-1">
          <AdminPanel onNavigateHome={handleNavigateHome} />
        </main>
      )}

      {/* Footer (shown on home & client view) */}
      {currentView !== 'admin' && (
        <Footer
          onNavigate={(target) => {
            if (target.startsWith('client')) {
              const tab = target.replace('client-', '') as any;
              handleNavigateClient(tab === 'client' ? 'dashboard' : tab);
            } else {
              handleScrollToSection(target);
            }
          }}
          onOpenLegal={type => setLegalModalType(type)}
        />
      )}

      {/* MODALS */}
      <AuthModal />
      <CheckoutModal
        isOpen={checkoutOpen}
        initialPlan={selectedPlanForCheckout}
        onClose={() => setCheckoutOpen(false)}
        onOrderCompleted={() => {
          handleNavigateClient('orders');
        }}
      />
      <LegalModal
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
