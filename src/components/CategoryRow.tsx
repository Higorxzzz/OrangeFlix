import { ChevronLeft, ChevronRight } from "lucide-react";
import { MediaCard } from "./MediaCard";
import { useRef, useState } from "react";
import { Movie, Series } from "@/data/mockData";

interface CategoryRowProps {
  title: string;
  items: (Movie | Series)[];
  type: "movie" | "series";
}

export const CategoryRow = ({ title, items, type }: CategoryRowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      const newScrollLeft =
        direction === "left"
          ? scrollRef.current.scrollLeft - scrollAmount
          : scrollRef.current.scrollLeft + scrollAmount;

      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftButton(scrollLeft > 0);
      setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  return (
    <div className="relative group">
      <h2 className="text-2xl font-bold mb-4 px-4">{title}</h2>

      {showLeftButton && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/70 backdrop-blur-sm rounded-r-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/90"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto scrollbar-hide px-4 pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item) => (
          <div key={item.id} className="flex-shrink-0 w-48">
            <MediaCard
              id={item.id}
              title={item.title}
              cover={item.cover}
              rating={item.rating}
              year={item.year}
              type={type}
            />
          </div>
        ))}
      </div>

      {showRightButton && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/70 backdrop-blur-sm rounded-l-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/90"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};
