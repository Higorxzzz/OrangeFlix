import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Play, Info } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { movies } from "@/data/mockData";

export const HeroCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const featuredMovies = movies.slice(0, 5);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
        setIsTransitioning(false);
      }, 500);
    }, 6000);

    return () => clearInterval(timer);
  }, [featuredMovies.length]);

  const goToPrevious = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length);
      setIsTransitioning(false);
    }, 500);
  };

  const goToNext = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
      setIsTransitioning(false);
    }, 500);
  };

  const current = featuredMovies[currentIndex];

  return (
    <div className="relative h-[85vh] w-full overflow-hidden">
      {featuredMovies.map((movie, index) => (
        <div
          key={movie.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={movie.cover}
            alt={movie.title}
            className={`h-full w-full object-cover transition-transform duration-[8000ms] ${
              index === currentIndex && !isTransitioning ? "scale-105" : "scale-100"
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>
      ))}

      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-4 md:px-8">
          <div className={`max-w-2xl space-y-6 transition-all duration-1000 ${
            isTransitioning ? "opacity-0 translate-y-8" : "opacity-100 translate-y-0"
          }`}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              {current.title}
            </h1>
            <p className="text-base md:text-lg text-gray-200 line-clamp-3 leading-relaxed">
              {current.synopsis}
            </p>
            
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="flex items-center gap-2 px-4 py-2 bg-primary rounded-lg text-white font-semibold shadow-lg">
                ★ {current.rating}
              </span>
              <span className="text-gray-300 font-medium">{current.year}</span>
              <span className="text-gray-300">{current.duration}</span>
              <span className="text-gray-400">{current.genre.slice(0, 3).join(" • ")}</span>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button 
                size="lg" 
                className="gap-2 bg-primary hover:bg-primary/90 text-white font-semibold btn-primary-hover shadow-2xl"
              >
                <Play className="h-5 w-5 fill-current" />
                Assistir Agora
              </Button>
              <Link to={`/movie/${current.id}`}>
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="gap-2 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/30 font-semibold transition-all duration-300 hover:scale-105 shadow-xl"
                >
                  <Info className="h-5 w-5" />
                  Mais Informações
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={goToPrevious}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 backdrop-blur-md hover:bg-black/80 transition-all duration-300 hover:scale-110 border border-white/20"
      >
        <ChevronLeft className="h-7 w-7 text-white" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 backdrop-blur-md hover:bg-black/80 transition-all duration-300 hover:scale-110 border border-white/20"
      >
        <ChevronRight className="h-7 w-7 text-white" />
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {featuredMovies.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsTransitioning(true);
              setTimeout(() => {
                setCurrentIndex(index);
                setIsTransitioning(false);
              }, 500);
            }}
            className={`h-1 rounded-full transition-all duration-300 ${
              index === currentIndex ? "w-10 bg-primary shadow-lg shadow-primary/50" : "w-6 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
