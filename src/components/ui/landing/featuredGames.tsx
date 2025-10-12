'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function FeaturedGames() {
  const games = [
    {
      name: 'Puzzle Master',
      image: '/images/placeholder.png',
      alt: 'Puzzle game icon'
    }
    // More games can be added here
  ];

  return (
    <section className="py-6 bg-white" aria-labelledby="featured-games-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 id="featured-games-title" className="text-2xl font-bold text-gray-800">
            Featured Games
          </h2>
          <p className="text-lg text-gray-600">Explore our collection of exciting mini-games.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {games.map((game, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              <div className="bg-gray-50 rounded-lg p-4 hover:shadow-lg transition-shadow duration-300">
                <div className="relative h-40 w-full mb-4">
                  <Image
                    src={game.image}
                    alt={game.alt}
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{game.name}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}