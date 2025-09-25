import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = 'default',
  className
}: StatCardProps) {
  const variantClasses = {
    default: 'border-border',
    success: 'border-dashboard-success/20 bg-dashboard-success/5',
    warning: 'border-dashboard-warning/20 bg-dashboard-warning/5',
    danger: 'border-dashboard-danger/20 bg-dashboard-danger/5',
    info: 'border-dashboard-info/20 bg-dashboard-info/5',
  };

  const iconVariantClasses = {
    default: 'text-muted-foreground',
    success: 'text-dashboard-success',
    warning: 'text-dashboard-warning',
    danger: 'text-dashboard-danger',
    info: 'text-dashboard-info',
  };

  return (
    <Card className={cn(
      "p-6 shadow-card hover:shadow-elevated transition-all duration-300",
      variantClasses[variant],
      className
    )}>
      <div className="flex items-start justify-between space-y-0">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>
          <div className="flex items-baseline space-x-2">
            <p className="text-2xl font-bold tracking-tight">
              {value}
            </p>
            {trend && (
              <span className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-dashboard-success" : "text-dashboard-danger"
              )}>
                {trend.isPositive ? "+" : ""}{trend.value}%
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">
              {description}
            </p>
          )}
        </div>
        <div className="flex-shrink-0">
          <Icon className={cn("h-5 w-5", iconVariantClasses[variant])} />
        </div>
      </div>
    </Card>
  );
}