import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  variant?: 'navy' | 'gold' | 'emerald' | 'amber' | 'blue' | 'default' | 'warning' | 'success' | 'danger';
  actionText?: string;
  onActionClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: IconInput,
  variant = 'default',
  actionText,
  onActionClick,
  className = ''
}) => {
  const getColors = () => {
    switch (variant) {
      case 'gold':
        return {
          iconBg: 'bg-amber-50 text-amber-800 border border-amber-200/80',
          accent: 'border-l-amber-500'
        };
      case 'success':
      case 'emerald':
        return {
          iconBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
          accent: 'border-l-emerald-500'
        };
      case 'warning':
      case 'amber':
        return {
          iconBg: 'bg-amber-50 text-amber-700 border border-amber-200/80',
          accent: 'border-l-amber-500'
        };
      case 'danger':
        return {
          iconBg: 'bg-rose-50 text-rose-700 border border-rose-200/80',
          accent: 'border-l-rose-500'
        };
      case 'blue':
        return {
          iconBg: 'bg-blue-50 text-blue-700 border border-blue-200/80',
          accent: 'border-l-blue-500'
        };
      default:
        return {
          iconBg: 'bg-slate-100 text-slate-700 border border-slate-200',
          accent: 'border-l-slate-700'
        };
    }
  };

  const colors = getColors();

  // Handle both component type and JSX element
  const renderIcon = () => {
    if (!IconInput) return null;
    if (React.isValidElement(IconInput)) {
      return React.cloneElement(IconInput as React.ReactElement<any>, {
        className: 'w-4 h-4 shrink-0'
      });
    }
    const Component = IconInput;
    return <Component className="w-4 h-4 shrink-0" />;
  };

  return (
    <div
      className={`bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 border-l-4 ${colors.accent} overflow-hidden min-w-0 flex flex-col justify-between ${className}`}
    >
      <div className="flex items-start justify-between gap-2.5 min-w-0">
        <div className="min-w-0 flex-1">
          <span
            className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block truncate"
            title={title}
          >
            {title}
          </span>
          <div
            className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1 truncate"
            title={String(value)}
          >
            {value}
          </div>
        </div>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colors.iconBg}`}>
          {renderIcon()}
        </div>
      </div>

      {subtitle && (
        <p
          className="text-[11px] text-slate-500 mt-2 font-medium truncate"
          title={subtitle}
        >
          {subtitle}
        </p>
      )}

      {actionText && onActionClick && (
        <div className="mt-3 pt-2.5 border-t border-slate-100">
          <button
            type="button"
            onClick={onActionClick}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>{actionText}</span>
            <span>&rarr;</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default StatCard;
