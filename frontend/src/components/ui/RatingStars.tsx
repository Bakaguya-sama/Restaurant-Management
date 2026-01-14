import React from "react";

interface RatingStarsProps {
  rating: number; // 0-5
  totalReviews?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
}

export function RatingStars({
  rating,
  totalReviews = 0,
  size = "md",
  showCount = true,
}: RatingStarsProps) {
  // Clamp rating between 0 and 5
  const clampedRating = Math.max(0, Math.min(5, rating));
  const filledStars = Math.floor(clampedRating);
  const hasHalfStar = clampedRating % 1 >= 0.5;

  // Size configurations
  const sizeMap = {
    sm: { star: "w-4 h-4", text: "text-sm" },
    md: { star: "w-5 h-5", text: "text-base" },
    lg: { star: "w-6 h-6", text: "text-lg" },
  };

  const { star, text } = sizeMap[size];

  return (
    <div className="flex items-center gap-2">
      {/* Stars */}
      <div className="flex items-center gap-1">
        {/* Filled Stars */}
        {Array.from({ length: filledStars }).map((_, i) => (
          <svg
            key={`filled-${i}`}
            className={`${star} fill-yellow-400 text-yellow-400`}
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}

        {/* Half Star */}
        {hasHalfStar && (
          <div className={`${star} relative`}>
            <svg
              className="w-full h-full fill-gray-300 text-gray-300"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <svg
                className="w-full h-full fill-yellow-400 text-yellow-400"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            </div>
          </div>
        )}

        {/* Empty Stars */}
        {Array.from({ length: 5 - filledStars - (hasHalfStar ? 1 : 0) }).map(
          (_, i) => (
            <svg
              key={`empty-${i}`}
              className={`${star} fill-gray-300 text-gray-300`}
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
          )
        )}
      </div>

      {/* Rating Text & Count */}
      {showCount && (
        <span className={`${text} font-medium text-gray-700`}>
          {clampedRating.toFixed(1)} ⭐
          {totalReviews > 0 && (
            <span className="text-gray-500 ml-1">({totalReviews})</span>
          )}
        </span>
      )}
    </div>
  );
}
