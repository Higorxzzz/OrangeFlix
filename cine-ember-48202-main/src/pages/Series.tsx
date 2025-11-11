import { Header } from "@/components/Header";
import { MediaCard } from "@/components/MediaCard";
import { series, allGenres } from "@/data/mockData";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const Series = () => {
  const [selectedGenre, setSelectedGenre] = useState<string>("Todos");
  const [displayedSeries, setDisplayedSeries] = useState(20);

  const filteredSeries =
    selectedGenre === "Todos"
      ? series
      : series.filter((s) => s.genre.includes(selectedGenre));

  const visibleSeries = filteredSeries.slice(0, displayedSeries);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 500
      ) {
        setDisplayedSeries((prev) => Math.min(prev + 20, filteredSeries.length));
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [filteredSeries.length]);

  useEffect(() => {
    setDisplayedSeries(20);
  }, [selectedGenre]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8">Séries</h1>

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
            {visibleSeries.map((show) => (
              <MediaCard
                key={show.id}
                id={show.id}
                title={show.title}
                cover={show.cover}
                rating={show.rating}
                year={show.year}
                type="series"
              />
            ))}
          </div>

          {displayedSeries < filteredSeries.length && (
            <div className="text-center mt-8">
              <p className="text-muted-foreground">Carregando mais séries...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Series;
