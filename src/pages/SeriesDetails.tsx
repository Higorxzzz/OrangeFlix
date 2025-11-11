import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { series } from "@/data/mockData";
import { Heart, Play, Calendar, Star, X, Loader2 } from "lucide-react";
import { useParams, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SeriesDetails = () => {
  const { id } = useParams();
  const show = series.find((s) => s.id === Number(id));
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodeAvailability, setEpisodeAvailability] = useState<Record<string, boolean>>({});
  const [checkingEpisodes, setCheckingEpisodes] = useState<Record<string, boolean>>({});
  const [showPlayer, setShowPlayer] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState<{ season: number; episode: number } | null>(null);

  useEffect(() => {
    if (show) {
      const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
      setIsFavorite(
        favorites.some((fav: any) => fav.id === show.id && fav.type === "series")
      );
    }
  }, [show]);

  useEffect(() => {
    if (show) {
      checkSeasonAvailability(selectedSeason);
    }
  }, [selectedSeason, show]);

  const checkSeasonAvailability = async (seasonNumber: number) => {
    if (!show) return;
    
    const season = show.seasons.find((s) => s.number === seasonNumber);
    if (!season) return;

    for (const episode of season.episodes) {
      const key = `${seasonNumber}-${episode.number}`;
      setCheckingEpisodes((prev) => ({ ...prev, [key]: true }));

      try {
        const response = await fetch(
          `https://primevicio.lat/api/stream/series/${show.id}/${seasonNumber}/${episode.number}`
        );
        setEpisodeAvailability((prev) => ({
          ...prev,
          [key]: response.status === 200,
        }));
      } catch (error) {
        setEpisodeAvailability((prev) => ({ ...prev, [key]: false }));
      } finally {
        setCheckingEpisodes((prev) => ({ ...prev, [key]: false }));
      }
    }
  };

  const handlePlayEpisode = (season: number, episode: number) => {
    setCurrentEpisode({ season, episode });
    setShowPlayer(true);
  };

  if (!show) {
    return <Navigate to="/series" />;
  }

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    const itemIndex = favorites.findIndex(
      (fav: any) => fav.id === show.id && fav.type === "series"
    );

    if (itemIndex >= 0) {
      favorites.splice(itemIndex, 1);
    } else {
      favorites.push({
        id: show.id,
        title: show.title,
        cover: show.cover,
        rating: show.rating,
        year: show.year,
        type: "series",
      });
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));
    setIsFavorite(!isFavorite);
  };

  const currentSeason = show.seasons.find((s) => s.number === selectedSeason);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-16">
        <div className="relative h-[60vh] w-full overflow-hidden">
          <img
            src={show.cover}
            alt={show.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>

        <div className="container mx-auto px-4 -mt-40 relative z-10">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-shrink-0">
              <img
                src={show.cover}
                alt={show.title}
                className="w-64 rounded-lg shadow-2xl"
              />
            </div>

            <div className="flex-1 space-y-6">
            <div>
                <h1 className="text-5xl font-bold mb-4">{show.title}</h1>
                
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <span className="flex items-center gap-2 px-4 py-2 bg-primary rounded-lg text-black font-semibold">
                    <Star className="h-5 w-5 fill-current" />
                    {show.rating}
                  </span>
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {show.year}
                  </span>
                  <span className="text-muted-foreground">
                    {show.seasons.length} {show.seasons.length === 1 ? "Temporada" : "Temporadas"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {show.genre.map((g) => (
                    <span
                      key={g}
                      className="px-3 py-1 bg-secondary rounded-full text-sm"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-2">Sinopse</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {show.synopsis}
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={toggleFavorite}
                  className="gap-2"
                >
                  <Heart
                    className={`h-5 w-5 ${
                      isFavorite ? "fill-primary text-primary" : ""
                    }`}
                  />
                  {isFavorite ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Episódios</h2>
              <Select
                value={String(selectedSeason)}
                onValueChange={(value) => setSelectedSeason(Number(value))}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {show.seasons.map((season) => (
                    <SelectItem key={season.number} value={String(season.number)}>
                      Temporada {season.number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4">
              {currentSeason?.episodes.map((episode) => {
                const key = `${selectedSeason}-${episode.number}`;
                const isChecking = checkingEpisodes[key];
                const isAvailable = episodeAvailability[key];

                return (
                  <div
                    key={episode.number}
                    className="flex gap-4 p-4 bg-card rounded-lg transition-colors"
                  >
                    <div className="flex-shrink-0 w-40 h-24 rounded overflow-hidden bg-secondary">
                      <img
                        src={episode.thumbnail}
                        alt={episode.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">
                          {episode.number}. {episode.title}
                        </h3>
                        <span className="text-sm text-muted-foreground">
                          {episode.duration}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {episode.synopsis}
                      </p>
                      <div>
                        {isChecking ? (
                          <Button size="sm" disabled className="gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Verificando...
                          </Button>
                        ) : isAvailable ? (
                          <Button
                            size="sm"
                            className="gap-2 bg-primary hover:bg-primary/90 text-black font-semibold"
                            onClick={() => handlePlayEpisode(selectedSeason, episode.number)}
                          >
                            <Play className="h-4 w-4" />
                            Assistir
                          </Button>
                        ) : (
                          <span className="text-sm text-muted-foreground px-3 py-1.5 bg-secondary rounded">
                            Indisponível
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="h-20" />
      </main>

      {showPlayer && currentEpisode && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <div className="relative w-full max-w-6xl aspect-video">
            <Button
              variant="secondary"
              size="icon"
              className="absolute -top-12 right-0 z-10"
              onClick={() => {
                setShowPlayer(false);
                setCurrentEpisode(null);
              }}
            >
              <X className="h-5 w-5" />
            </Button>
            <iframe
              src={`https://primevicio.lat/embed/tv/${show.id}/${currentEpisode.season}/${currentEpisode.episode}`}
              className="w-full h-full rounded-lg"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SeriesDetails;
