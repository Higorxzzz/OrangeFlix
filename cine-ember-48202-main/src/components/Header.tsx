import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, Heart, User, LogOut, Shield } from "lucide-react";
import { Input } from "./ui/input";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { user, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error("Erro ao fazer logout");
    } else {
      toast.success("Logout realizado com sucesso");
      navigate("/");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-blur border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold">
              Prime<span className="text-primary">Vício</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/") ? "text-primary" : "text-foreground/80"
              }`}
            >
              Início
            </Link>
            <Link
              to="/movies"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/movies") ? "text-primary" : "text-foreground/80"
              }`}
            >
              Filmes
            </Link>
            <Link
              to="/series"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/series") ? "text-primary" : "text-foreground/80"
              }`}
            >
              Séries
            </Link>
            <Link
              to="/favorites"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/favorites") ? "text-primary" : "text-foreground/80"
              }`}
            >
              Favoritos
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar filmes e séries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64 bg-secondary/50 border-border/50"
            />
          </div>

          <Link to="/favorites" className="p-2 hover:text-primary transition-colors">
            <Heart className="h-5 w-5" />
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/admin")}>
                  <Shield className="mr-2 h-4 w-4" />
                  Painel Admin
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
              Entrar
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
