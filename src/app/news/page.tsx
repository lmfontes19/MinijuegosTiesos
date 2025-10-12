'use client'
import React, { useState } from 'react';
import { ChevronDown, Calendar, Zap, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Head from 'next/head';

interface NewsItem {
  id: number;
  date: string;
  title: string;
  content: string;
  icon: React.ElementType;
}

const NewsComponent: React.FC = () => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const news: NewsItem[] = [
    {
      id: 1,
      date: "Sep 10, 2025",
      title: "[LAUNCH] MINIJUEGOSTIESOS IS NOW LIVE!",
      content: 'We are thrilled to announce the official launch of MinijuegosTiesos, your go-to platform for exciting mini-games and competitive fun! Start exploring our wide range of games, challenge other players, and begin your gaming journey today!',
      icon: Zap
    }
  ];

  return (
    <>
      <Head>
        <title>News & Updates - MinijuegosTiesos</title>
        <meta name="description" content="Stay up to date with the latest news and promotions from MinijuegosTiesos. Don't miss special events and exclusive game releases!" />
        <meta name="keywords" content="minijuegos, games, updates, promotions, bonus, tournaments, competitions, gaming" />
        <meta name="robots" content="index, follow" />
      </Head>
      <section className="min-h-screen bg-[#1E293B]/50 pt-16">
        {/* Header Section */}
        <header className="w-full bg-[#1E293B]/80 py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold text-white tracking-tight mb-4">Latest News</h1>
            <p className="text-[#6366F1] text-xl font-medium">
              Stay informed about the latest updates and promotions.
            </p>
          </div>
        </header>

        {/* News Content */}
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-6">
            {news.map((item) => (
              <article
                key={item.id}
                className="bg-[#1E293B]/50 rounded-lg border border-gray-700 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  className="w-full text-left p-6 focus:outline-none"
                  aria-expanded={expandedId === item.id}
                  aria-controls={`news-content-${item.id}`}
                >
                  <div className="flex items-center text-gray-400 mb-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    <time dateTime={item.date} className="text-sm font-medium">{item.date}</time>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <item.icon className="w-6 h-6 mr-3 text-[#6366F1]" />
                      <h2 className="text-xl font-bold text-white tracking-wide pr-8">
                        {item.title}
                      </h2>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedId === item.id ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-6 h-6 text-gray-400" />
                    </motion.div>
                  </div>
                </button>

                <AnimatePresence>
                  {expandedId === item.id && (
                    <motion.section
                      id={`news-content-${item.id}`}
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-6 pb-6 text-gray-300 border-t border-gray-700 pt-4 whitespace-pre-line"
                    >
                      {item.content}
                    </motion.section>
                  )}
                </AnimatePresence>
              </article>
            ))}
          </div>
        </main>
      </section>
    </>
  );
};

export default NewsComponent;