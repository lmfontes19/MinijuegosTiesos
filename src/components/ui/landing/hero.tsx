'use client'
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 pt-16 md:pt-20 overflow-hidden">
      {/* Background with dimming gradient */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero.jpg"
          alt="Gaming background"
          fill
          quality={90}
          priority
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          className="opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 to-slate-800/90" />
      </div>

      {/* Animated Grid Background */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:32px_32px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-5xl mx-auto px-6 py-20">
        <motion.h1
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] to-[#A5B4FC]"
        >
          Experience the Best Mini-Games Collection
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
        >
          Join our exciting gaming platform and compete with players worldwide. Discover a variety of fun mini-games, climb the leaderboards, and unlock achievements.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/signup"
            className="px-6 py-3 rounded-lg bg-[#6366F1] hover:bg-[#4F46E5] text-white font-medium transition-colors text-center flex items-center justify-center gap-2 group"
          >
            Start Playing Now
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}