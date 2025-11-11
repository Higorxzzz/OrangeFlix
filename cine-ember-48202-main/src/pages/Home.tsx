import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { HeroCarousel } from "@/components/HeroCarousel";
import { CategoryRow } from "@/components/CategoryRow";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Movie, Series } from "@/data/mockData";

interface DbMediaItem {
  id: string;
  title: string;
  poster_url: string | null;
  type: 'movie' | 'series';
  synopsis: string | null;
  tmdb_id: number;
}

const Home = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublishedItems();
  }, []);

  const fetchPublishedItems = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('media_items')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const moviesList = data
          .filter((item: DbMediaItem) => item.type === 'movie')
          .map((item: DbMediaItem) => ({
            id: item.id,
            title: item.title,
            cover: item.poster_url || 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400',
            year: new Date().getFullYear(),
            rating: 0,
            genre: [],
            synopsis: item.synopsis || '',
            duration: '0min'
          }));
          
        const seriesList = data
          .filter((item: DbMediaItem) => item.type === 'series')
          .map((item: DbMediaItem) => ({
            id: item.id,
            title: item.title,
            cover: item.poster_url || 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400',
            year: new Date().getFullYear(),
            rating: 0,
            genre: [],
            synopsis: item.synopsis || '',
            seasons: []
          }));
        
        setMovies(moviesList);
        setSeries(seriesList);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        <HeroCarousel />

        <div className="space-y-8 py-8">
          {movies.length > 0 && (
            <CategoryRow
              title="Filmes"
              items={movies}
              type="movie"
            />
          )}
          
          {series.length > 0 && (
            <CategoryRow
              title="Séries"
              items={series}
              type="series"
            />
          )}

          {movies.length === 0 && series.length === 0 && (
            <div className="container mx-auto px-4 text-center py-20">
              <p className="text-muted-foreground text-lg">
                Nenhum conteúdo publicado ainda.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
