import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Rocket, Shield, Zap } from 'lucide-react';

// Función que hace una llamada real al backend
const fetchStats = async () => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/landing/stats`);
    
    if (!response.ok) {
      throw new Error('Error fetching stats');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching stats:', error);
    // Datos de respaldo en caso de error
    return {
      activeUsers: '0',
      tasksCompleted: '0',
      satisfactionRate: '100%',
      support: '24/7'
    };
  }
};

export default function Stats() {
  const [stats, setStats] = useState({
    activeUsers: '...',
    tasksCompleted: '...',
    satisfactionRate: '100%',
    support: '24/7'
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getStats = async () => {
      try {
        setLoading(true);
        const data = await fetchStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    getStats();
  }, []);

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

  const statItems = [
    { value: stats.activeUsers, label: 'Active Users', color: 'text-[#6366F1]', icon: Users },
    { value: stats.tasksCompleted, label: 'Tasks Completed', color: 'text-[#10B981]', icon: Rocket },
    { value: stats.satisfactionRate, label: 'Satisfaction Rate', color: 'text-[#EAB308]', icon: Shield },
    { value: stats.support, label: 'Support', color: 'text-[#EC4899]', icon: Zap }
  ];

  return (
    <section id='stats'>
      <motion.section 
        initial="hidden"
        whileInView="visible"
        variants={containerVariants}
        viewport={{ once: true }}
        className="py-16 bg-[#1E293B]/50"
      >
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 text-center">
          {statItems.map((stat, index) => (
            <motion.div 
              key={index} 
              variants={itemVariants}
              className="bg-[#0F172A]/30 p-6 rounded-xl shadow-lg hover:scale-105 transition-transform"
            >
              <div className="mb-4">
                <stat.icon className={`mx-auto w-12 h-12 ${stat.color}`} />
              </div>
              <div className={`text-4xl font-bold mb-2 ${stat.color} ${loading ? 'animate-pulse' : ''}`}>
                {stat.value}
              </div>
              <div className="text-gray-300">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </section>
  );
} 