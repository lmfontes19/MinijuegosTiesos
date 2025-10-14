import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Shield, CreditCard, Gamepad2, Layers, Trophy, Zap } from 'lucide-react';

export default function ValueProposition() {
  // Variants para animaciones
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

  const features = [
    { 
      icon: Gamepad2, 
      title: 'Mini-Games Collection', 
      description: 'Enjoy classic games like Snake, Memory Match, Flappy Bird, CoinClick, and Spacing Layer — all in one place and playable from any browser.',
      color: 'text-[#6366F1]'
    },
    { 
      icon: Zap, 
      title: 'Fast and Fun Gameplay', 
      description: 'Jump straight into action with lightweight games that load instantly and run smoothly on any device.',
      color: 'text-[#10B981]'
    },
    { 
      icon: Trophy, 
      title: 'Compete and Achieve', 
      description: 'Climb the rankings, unlock achievements, and challenge your friends to beat your high scores.',
      color: 'text-[#EAB308]'
    }
  ];



  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] to-[#A5B4FC]">
          Why Choose MinijuegosTiesos?
        </h2>
        <motion.div 
          initial="hidden"
          whileInView="visible"
          variants={containerVariants}
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              variants={itemVariants}
              className="bg-[#1E293B] p-8 rounded-xl shadow-lg text-center hover:scale-105 transition-transform"
            >
              <feature.icon className={`mx-auto w-16 h-16 mb-4 ${feature.color}`} />
              <h3 className="text-xl font-bold mb-4 text-white">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
} 