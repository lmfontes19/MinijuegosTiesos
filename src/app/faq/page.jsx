'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, HelpCircle } from 'lucide-react';

const faqData = {
  general: [
    {
      question: "What is MinijuegosTiesos?",
      answer: "MinijuegosTiesos is an online platform where users can enjoy a wide variety of exciting mini-games, compete against other players, and earn points to climb the leaderboard."
    },
    {
      question: "How does MinijuegosTiesos work?",
      answer: "Players can sign up and start playing right away. Each game awards points based on your performance, and those points are reflected on the global leaderboard. You can also join tournaments and special events for extra rewards and challenges."
    },
    {
      question: "What types of games are available?",
      answer: "We offer a diverse collection of mini-games — from skill-based challenges to memory and logic games. New titles are added regularly to keep the experience fun, dynamic, and fresh."
    }
  ],
  platform_usage: [
    {
      question: "How do I start playing?",
      answer: "Getting started is simple! Create a free account, explore our growing library of mini-games, and start playing instantly. Each game includes clear instructions and multiple difficulty levels so you can play at your own pace."
    },
    {
      question: "How does the ranking system work?",
      answer: "Your position on the leaderboard is determined by your total score across all games. You earn points based on performance, and we also feature separate rankings for each game category as well as tournament-specific leaderboards."
    }
  ],
  verification: [
    {
      question: "How are game scores verified?",
      answer: "Our automated system tracks and verifies every score to ensure fair play. Anti-cheat measures are constantly active, and all high scores are reviewed to maintain transparency and competitiveness."
    }
  ]
};

const categories = {
  all: 'All',
  general: 'General',
  platform_usage: 'Platform Usage',
  verification: 'Verification',
  payment: 'Payment',
  administration: 'Administration'
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

const FAQComponent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredFAQs = Object.entries(faqData)
    .filter(([category]) => selectedCategory === 'all' || category === selectedCategory)
    .flatMap(([_, questions]) =>
      questions.filter(({ question, answer }) =>
        (question + answer).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

  return (
    <section className="py-20 bg-[#1E293B]/50 min-h-screen">
      <div className="w-full bg-[#1E293B]/80 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <HelpCircle className="w-16 h-16 text-[#6366F1] mx-auto mb-4" />
          <h1 className="text-5xl font-bold text-white tracking-tight mb-4">
            MinijuegosTiesos FAQ
          </h1>
          <p className="text-[#6366F1] text-xl font-medium">
            Find answers about our task-based XRP platform
          </p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-12">
        <div className="mb-8 relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search FAQ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#1E293B]/50 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
          />
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {Object.entries(categories).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${selectedCategory === key
                ? 'bg-[#6366F1] text-white'
                : 'bg-[#1E293B]/50 text-gray-300 hover:bg-gray-600'
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-4"
        >
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq, index) => (
              <FAQItem key={index} {...faq} />
            ))
          ) : (
            <div className="text-center text-gray-400 py-8 bg-[#1E293B] p-8 rounded-xl shadow-lg">No results found for your search</div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      variants={itemVariants}
      className="bg-[#1E293B] rounded-xl shadow-lg overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex justify-between items-center text-left hover:bg-[#1E293B]/70 transition-colors"
      >
        <span className="text-gray-100 font-medium">{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-5 h-5 text-[#6366F1]" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-[#1E293B]/50 text-gray-300 border-t border-gray-700">{answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FAQComponent;