'use client'
import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import of form content to avoid issues with useSearchParams
const SignupFormContent = dynamic(() => import('@/components/ui/signup/SignupFormContent'), { 
  ssr: false,
  loading: () => <SignupFormLoading />
});

// Componente de carga para mostrar mientras se carga el SignupFormContent
const SignupFormLoading = () => (
  <section className="py-20 bg-[#1E293B]/50">
    <div className="w-full bg-[#1E293B]/80 py-16 text-center">
      <h1 className="text-5xl font-bold text-white tracking-tight mb-4">
        Join MinijuegosTiesos
      </h1>
      <p className="text-[#6366F1] text-xl font-medium">
        Create an account and start earning XRP today
      </p>
    </div>
    <div className="max-w-3xl mx-auto px-4 pt-12">
      <div className="bg-[#1E293B] rounded-xl shadow-lg overflow-hidden p-8">
        <div className="flex justify-center">
          <p className="text-white">Loading form...</p>
        </div>
      </div>
    </div>
  </section>
);

// Main component to be exported
const SignupPage = () => {
  return (
    <Suspense fallback={<SignupFormLoading />}>
      <SignupFormContent />
    </Suspense>
  );
};

export default SignupPage;