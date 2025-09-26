import { useEffect, useState } from 'react';

const TechBackground = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const generateParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 20; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 4 + 2,
          opacity: Math.random() * 0.5 + 0.1,
          duration: Math.random() * 4 + 4,
        });
      }
      setParticles(newParticles);
    };

    generateParticles();
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-green-500/10 animate-pulse-slow" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div 
          className="w-full h-full" 
          style={{
            backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Floating Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="tech-particle bg-gradient-to-r from-purple-500 to-blue-500 absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}

      {/* Geometric Shapes */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-purple-500/20 animate-rotate" />
      <div className="absolute bottom-1/3 right-1/4 w-24 h-24 border border-blue-500/20 animate-rotate-reverse" />
      <div className="absolute top-2/3 left-1/3 w-16 h-16 bg-green-500/10 rounded-full animate-rotate" />
      
      {/* Additional rotating shapes */}
      <div className="absolute top-1/3 right-1/3 w-20 h-20 border-2 border-purple-400/15 rotate-45 animate-rotate" />
      <div className="absolute bottom-1/4 left-1/2 w-28 h-28 border border-blue-400/15 rounded-lg animate-rotate-reverse" />
      
      {/* Code-like elements */}
      <div className="absolute top-1/2 left-8 transform -translate-y-1/2 space-y-2 opacity-20">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
          <div className="w-20 h-2 bg-purple-500 rounded animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="w-16 h-2 bg-blue-500 rounded animate-pulse" style={{ animationDelay: '1.5s' }} />
        </div>
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="w-24 h-2 bg-green-500 rounded animate-pulse" style={{ animationDelay: '2.5s' }} />
        </div>
      </div>

      {/* Large Gradient Circle */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-tr from-green-500/5 to-purple-500/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
    </div>
  );
};

export default TechBackground;
