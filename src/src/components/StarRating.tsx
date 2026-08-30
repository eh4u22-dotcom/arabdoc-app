import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  score: number; // 1 to 10
  maxStars?: number;
  interactive?: boolean;
  onChange?: (score: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showBadge?: boolean;
  className?: string;
}

export function getConditionStatus(score: number): {
  label: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  description: string;
} {
  if (score <= 3) {
    return {
      label: 'تدهور',
      colorClass: 'text-rose-700',
      bgClass: 'bg-rose-50',
      borderClass: 'border-rose-200',
      description: 'الحالة تحتاج عناية خاصة وتعديل خطة العلاج',
    };
  }
  if (score <= 5) {
    return {
      label: 'ضعيفة',
      colorClass: 'text-amber-700',
      bgClass: 'bg-amber-50',
      borderClass: 'border-amber-200',
      description: 'استجابة بطيئة أو أعراض مستمرة',
    };
  }
  if (score <= 7) {
    return {
      label: 'متوسطة',
      colorClass: 'text-sky-700',
      bgClass: 'bg-sky-50',
      borderClass: 'border-sky-200',
      description: 'تحسن تدريجي واستقرار في الأعراض العامة',
    };
  }
  if (score <= 9) {
    return {
      label: 'تحسن جيد',
      colorClass: 'text-teal-700',
      bgClass: 'bg-teal-50',
      borderClass: 'border-teal-200',
      description: 'استجابة ممتازة للعلاج واختفاء معظم الأعراض',
    };
  }
  return {
    label: 'تحسن ممتاز',
    colorClass: 'text-emerald-700',
    bgClass: 'bg-emerald-50',
    borderClass: 'border-emerald-200',
    description: 'شفاء تام واستقرار كامل للوظائف الحيوية',
  };
}

export const StarRating: React.FC<StarRatingProps> = ({
  score,
  maxStars = 10,
  interactive = false,
  onChange,
  size = 'md',
  showLabel = true,
  showBadge = true,
  className = '',
}) => {
  const status = getConditionStatus(score);

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const currentScore = Math.max(1, Math.min(maxStars, score || 1));

  return (
    <div className={`inline-flex flex-wrap items-center gap-2 ${className}`}>
      {/* Stars row */}
      <div className="flex items-center gap-0.5" dir="ltr">
        {Array.from({ length: maxStars }).map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= currentScore;

          return (
            <button
              key={starValue}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange && onChange(starValue)}
              className={`transition-all duration-150 ${
                interactive ? 'cursor-pointer hover:scale-125 focus:outline-none' : 'cursor-default'
              }`}
              title={`${starValue} من 10`}
            >
              <Star
                className={`${starSizes[size]} transition-colors ${
                  isFilled
                    ? starValue <= 3
                      ? 'fill-rose-500 text-rose-500'
                      : starValue <= 5
                      ? 'fill-amber-500 text-amber-500'
                      : starValue <= 7
                      ? 'fill-sky-500 text-sky-500'
                      : 'fill-teal-500 text-teal-500'
                    : 'fill-slate-100 text-slate-300'
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Numeric Score */}
      {showLabel && (
        <span className="font-bold text-slate-700 text-sm tracking-tight" dir="ltr">
          {currentScore}/10
        </span>
      )}

      {/* Condition Category Badge */}
      {showBadge && (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${status.bgClass} ${status.colorClass} ${status.borderClass}`}
        >
          {status.label}
        </span>
      )}
    </div>
  );
};
