import { Header } from "@/components/Header";
import { MediaCard } from "@/components/MediaCard";
import { movies, allGenres } from "@/data/mockData";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const Movies = () => {
  const [selectedGenre, setSelectedGenre] = useState<string>("Todos");
  const [displayedMovies, setDisplayedMovies] = useState(20);

  const filteredMovies =
    selectedGenre === "Todos"
      ? movies
      : movies.filter((m) => m.genre.includes(selectedGenre));

  const visibleMovies = filteredMovies.slice(0, displayedMovies);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 500
      ) {
        setDisplayedMovies((prev) => Math.min(prev + 20, filteredMovies.length));
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [filteredMovies.length]);

  useEffect(() => {
    setDisplayedMovies(20);
  }, [selectedGenre]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8">Filmes</h1>

          <div className="flex flex-wrap gap-2 mb-8">
            <Button
              variant={selectedGenre === "Todos" ? "default" : "secondary"}
              onClick={() => setSelectedGenre("Todos")}
              className={selectedGenre === "Todos" ? "bg-primary text-black" : ""}
            >
              Todos
            </Button>
            {allGenres.map((genre) => (
              <Button
                key={genre}
                variant={selectedGenre === genre ? "default" : "secondary"}
                onClick={() => setSelectedGenre(genre)}
                className={selectedGenre === genre ? "bg-primary text-black" : ""}
              >
                {genre}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {visibleMovies.map((movie) => (
              <MediaCard
                key={movie.id}
                id={movie.id}
                title={movie.title}
                cover={movie.cover}
                rating={movie.rating}
                year={movie.year}
                type="movie"
              />
            ))}
          </div>

          {displayedMovies < filteredMovies.length && (
            <div className="text-center mt-8">
              <p className="text-muted-foreground">Carregando mais filmes...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Movies;
