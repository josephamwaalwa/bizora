import React from 'react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  onClick,
  className = '',
}) => {
  return (
    <div
      onClick={onClick}
      className={`py-6 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <p className="text-[14px] font-medium text-ink-secondary">{title}</p>
      <h4 className="figure-sm mt-3">{value}</h4>
      {(subtitle || trend) && (
        <div className="mt-3 flex items-center justify-between gap-3 text-[14px] text-ink-secondary">
          {subtitle && <span>{subtitle}</span>}
          {trend && (
            <span
              className={`num font-medium ${
                trend.isNeutral ? 'text-ink-secondary' : trend.isPositive ? 'text-teal-800' : 'text-[#8E3B32]'
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
