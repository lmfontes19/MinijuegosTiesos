import React from 'react';
import { motion } from 'framer-motion';

export default function Testimonials() {
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

  const testimonials = [
    {
      quote: "MinijuegosTiesos has been amazing! I've had so much fun competing with players from around the world and improving my gaming skills.",
      name: "Paqui Sancio",
      role: "Freelance Designer"
    },
    {
      quote: "The variety of games and the competitive atmosphere make this platform unique. The ranking system is fair and the community is fantastic!",
      name: "Michael Vela",
      role: "Startup Founder"
    }
  ];

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] to-[#A5B4FC]">
          What Our Users Say
        </h2>
        <motion.div 
          initial="hidden"
          whileInView="visible"
          variants={containerVariants}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={index}
              variants={itemVariants}
              className="bg-[#1E293B] p-8 rounded-xl shadow-lg relative"
            >
              <div className="text-6xl absolute top-0 left-0 text-[#6366F1]/20">"</div>
              <p className="text-gray-300 mb-6 relative z-10">{testimonial.quote}</p>
              <div className="flex items-center">
                <div>
                  <h4 className="font-bold text-[#6366F1]">{testimonial.name}</h4>
                  <p className="text-gray-400 text-sm">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
} 