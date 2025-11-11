import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Heart, Play, Clock, Calendar, Star, X, Loader2 } from "lucide-react";
import { useParams, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MovieData {
  id: string;
  title: string;
  poster_url: string | null;
  synopsis: string | null;
  tmdb_id: number;
  embed_url: string | null;
  last_check_status: string;
}

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState<MovieData | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    fetchMovie();
  }, [id]);

  const fetchMovie = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('media_items')
        .select('*')
        .eq('id', id)
        .eq('type', 'movie')
        .eq('published', true)
        .single();

      if (error) throw error;
      
      if (data) {
        setMovie(data);
        const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
        setIsFavorite(
          favorites.some((fav: any) => fav.id === data.id && fav.type === "movie")
        );
      }
    } catch (error) {
      console.error('Error fetching movie:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!movie) {
    return <Navigate to="/movies" />;
  }

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    const itemIndex = favorites.findIndex(
      (fav: any) => fav.id === movie.id && fav.type === "movie"
    );

    if (itemIndex >= 0) {
      favorites.splice(itemIndex, 1);
    } else {
      favorites.push({
        id: movie.id,
        title: movie.title,
        cover: movie.poster_url,
        type: "movie",
      });
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));
    setIsFavorite(!isFavorite);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-16">
        <div className="relative h-[60vh] w-full overflow-hidden">
          <img
            src={movie.poster_url || 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400'}
            alt={movie.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>

        <div className="container mx-auto px-4 -mt-40 relative z-10">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-shrink-0">
              <img
                src={movie.poster_url || 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400'}
                alt={movie.title}
                className="w-64 rounded-lg shadow-2xl"
              />
            </div>

            <div className="flex-1 space-y-6">
              <div>
                <h1 className="text-5xl font-bold mb-4">{movie.title}</h1>
                
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  {movie.last_check_status === 'ok' && (
                    <span className="px-4 py-2 bg-green-500/20 border border-green-500 rounded-lg text-green-500 font-semibold">
                      Disponível
                    </span>
                  )}
                  {movie.last_check_status === 'not_found' && (
                    <span className="px-4 py-2 bg-red-500/20 border border-red-500 rounded-lg text-red-500 font-semibold">
                      Indisponível
                    </span>
                  )}
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Star className="h-4 w-4" />
                    TMDB ID: {movie.tmdb_id}
                  </span>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-2">Sinopse</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {movie.synopsis || 'Sinopse não disponível.'}
                </p>
              </div>

              <div className="flex gap-3">
                {movie.embed_url && movie.last_check_status === 'ok' ? (
                  <Button 
                    size="lg" 
                    className="gap-2 bg-primary hover:bg-primary/90 text-black font-semibold"
                    onClick={() => setShowPlayer(true)}
                  >
                    <Play className="h-5 w-5" />
                    Assistir Agora
                  </Button>
                ) : (
                  <div className="px-6 py-3 bg-secondary rounded-lg text-muted-foreground">
                    Indisponível no momento
                  </div>
                )}
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
        </div>

        <div className="h-20" />
      </main>

      {showPlayer && movie.embed_url && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <div className="relative w-full max-w-6xl aspect-video">
            <Button
              variant="secondary"
              size="icon"
              className="absolute -top-12 right-0 z-10"
              onClick={() => setShowPlayer(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            <iframe
              src={movie.embed_url}
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

export default MovieDetails;
