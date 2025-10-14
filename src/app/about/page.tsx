'use client'
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  Target,
  Globe,
  Shield
} from 'lucide-react';

export default function AboutUs() {
  const missionValues = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'Bring people together through fun and fair competition in order to create a global community where players can enjoy exciting mini-games, challenge others, and celebrate their achievements.',
      color: 'text-[#6366F1]'
    },
    {
      icon: Globe,
      title: 'Global Community',
      description: 'Connect players from around the world, allowing everyone to compete, collaborate, and climb the leaderboards regardless of location or device.',
      color: 'text-[#10B981]'
    },
    {
      icon: Shield,
      title: 'Fair Play & Security',
      description: 'Enjoy a safe and transparent gaming experience. Our verified scoring system ensure that every achievement and victory truly reflects your skills.',
      color: 'text-[#EAB308]'
    }

  ];

  return (
    <section id="about" className="py-20 bg-[#1E293B]/50">
      <div className="w-full bg-[#1E293B]/80 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-bold text-white tracking-tight mb-4">
            About Us
          </h1>
          <p className="text-[#6366F1] text-xl font-medium">
            Learn About Us and Our Goals
          </p>
        </motion.div>
      </div>
      <div className="max-w-7xl pt-12 mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Left content */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0 }}/*  */
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h1 className="text-3xl font-bold text-white mb-4">
                About MinijuegosTiesos
              </h1>
              <p className="text-slate-300 max-w-2xl mb-8">
                MinijuegosTiesos is an innovative platform that offers a collection of exciting mini-games. Our system ensures a fair and efficient experience for all players, featuring leaderboards and fun competitions.
              </p>
            </motion.div>

            <div className="text-white mb-12">
              <h2 className="text-xl font-semibold mb-4">Our Core Values</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {missionValues.map((item, index) => (
                  <div
                    key={index}
                    className="bg-[#0F172A]/50 p-4 rounded-lg"
                  >
                    <item.icon className={`w-8 h-8 mb-2 ${item.color}`} />
                    <h3 className={`font-bold mb-2 ${item.color}`}>
                      {item.title}
                    </h3>
                    <p className="text-slate-300 text-sm">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right image */}
          <div className="relative flex-1">
            <Image
              src="/images/logo.png"
              alt="Gaming platform illustration"
              width={700}
              height={700}
              className="rounded-lg shadow-lg object-cover sticky top-20"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}