interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export function ScoreBadge({ score, size = 'md' }: ScoreBadgeProps) {
  const getColorClasses = () => {
    if (score >= 70) return 'bg-green-500 text-white';
    if (score >= 40) return 'bg-yellow-500 text-white';
    return 'bg-red-500 text-white';
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-14 h-14 text-xl';
      case 'lg': return 'w-28 h-28 text-5xl';
      default: return 'w-20 h-20 text-3xl';
    }
  };

  const getLabel = () => {
    if (score >= 70) return 'Excellent';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const getDescription = () => {
    if (score >= 70) return 'Great solar potential';
    if (score >= 40) return 'Moderate solar potential';
    return 'Limited solar potential';
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${getColorClasses()} ${getSizeClasses()} rounded-full flex items-center justify-center font-bold shadow-lg`}
      >
        {score}
      </div>
      <div className="text-center">
        <p className="text-lg font-semibold text-gray-900">{getLabel()}</p>
        <p className="text-sm text-gray-500">{getDescription()}</p>
      </div>
    </div>
  );
}
