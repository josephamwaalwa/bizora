import React from 'react';
import { Card } from './Card';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconBgColor = 'bg-indigo-50 text-indigo-600',
  trend,
  onClick,
}) => {
  return (
    <Card
      variant={onClick ? 'interactive' : 'default'}
      padding="md"
      className="relative overflow-hidden group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-2xl font-bold tracking-tight text-slate-900">{value}</h4>
          </div>
        </div>
        <div className={`p-2.5 rounded-xl ${iconBgColor} shrink-0 shadow-subtle transition-transform group-hover:scale-105 duration-150`}>
          {icon}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-500 truncate">{subtitle}</span>}
          {trend && (
            <span
              className={`inline-flex items-center font-medium ${
                trend.isNeutral
                  ? 'text-slate-500'
                  : trend.isPositive
                  ? 'text-emerald-600'
                  : 'text-amber-600'
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}
    </Card>
  );
};
