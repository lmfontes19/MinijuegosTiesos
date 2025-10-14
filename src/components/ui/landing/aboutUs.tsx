'use client'
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function AboutUs() {
  return (
    <section id="about" className="py-20 bg-[#1E293B]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Left content */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h1 className="text-3xl font-bold text-white mb-4">
                About Us - MinijuegosTiesos
              </h1>
              <p className="text-slate-300 max-w-2xl mb-8">
                MinijuegosTiesos is an innovative platform that offers a collection of exciting mini-games. Our system ensures a fair and enjoyable experience for all players, featuring competitions and rewards for your achievements.
              </p>
            </motion.div>

            <div className="text-white">
              <h2 className="text-xl font-semibold mb-4">What is MinijuegosTiesos?</h2>
              <p className="text-slate-300 mb-6">
                MinijuegosTiesos is an exciting platform offering a collection of fun mini-games. Players can compete with others, earn points, and climb the leaderboard through their gaming achievements.
              </p>
              <p className="text-slate-300">
                Our platform features various game modes, from skill-based challenges to puzzle-solving adventures, creating an engaging and competitive gaming environment.
              </p>
            </div>
          </div>

          {/* Right image */}
          <div className="relative flex-1">
            <Image
              src="/images/logo.png"
              alt="Illustration representing our gaming platform"
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
