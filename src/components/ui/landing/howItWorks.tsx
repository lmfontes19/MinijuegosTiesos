import React from 'react';
import { motion } from 'framer-motion';

export default function HowItWorks() {
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

  const tasksCompleterSteps = [
    { step: 1, title: 'Create Your Account', description: 'Sign up and create your gaming profile' },
    { step: 2, title: 'Browse Games', description: 'Find games that match your interests and skill level' },
    { step: 3, title: 'Play & Compete', description: 'Join games and compete with other players' },
    { step: 4, title: 'Earn Points', description: 'Get points and climb the leaderboard rankings' }
  ];

  const taskCreatorSteps = [
    { step: 1, title: 'Define Tasks', description: 'Create detailed task requirements' },
    { step: 2, title: 'Set Rewards', description: 'Set rewards for task completion' },
    { step: 3, title: 'Verify Submissions', description: 'Review and approve completed tasks' }
  ];

  return (
    <section className="py-16 px-4 bg-[#1E293B]/50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] to-[#A5B4FC]">
          How MinijuegosTiesos Works
        </h2>
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={containerVariants}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-8"
        >
          {/* Task Completers Flow */}
          <motion.div
            variants={itemVariants}
            className="bg-[#1E293B] p-8 rounded-xl shadow-lg"
          >
            <h3 className="text-2xl font-bold mb-6 text-[#6366F1]">For Task Completers</h3>
            {tasksCompleterSteps.map((item) => (
              <div key={item.step} className="flex items-start mb-6">
                <div className="mr-4">
                  <div className="w-10 h-10 bg-[#6366F1]/20 text-[#6366F1] rounded-full flex items-center justify-center font-bold">
                    {item.step}
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-2">{item.title}</h4>
                  <p className="text-gray-400">{item.description}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Task Creators Flow */}
          <motion.div
            variants={itemVariants}
            className="bg-[#1E293B] p-8 rounded-xl shadow-lg"
          >
            <h3 className="text-2xl font-bold mb-6 text-[#10B981]">For Task Creators</h3>
            {taskCreatorSteps.map((item) => (
              <div key={item.step} className="flex items-start mb-6">
                <div className="mr-4">
                  <div className="w-10 h-10 bg-[#10B981]/20 text-[#10B981] rounded-full flex items-center justify-center font-bold">
                    {item.step}
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-2">{item.title}</h4>
                  <p className="text-gray-400">{item.description}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
} 