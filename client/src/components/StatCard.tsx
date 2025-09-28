import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";
import { useState, useEffect } from "react";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  status?: "complete" | "pending" | "warning" | "normal";
  subtitle?: string;
  className?: string;
}

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  status = "normal", 
  subtitle,
  className = "" 
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  // Animate count from 0 to actual value
  useEffect(() => {
    const animationDuration = 1000; // 1 second
    const steps = 30;
    const increment = value / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(increment * currentStep));
      }
    }, animationDuration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const getStatusColor = () => {
    switch (status) {
      case "complete":
        return "bg-chart-1 text-white";
      case "pending":
        return "bg-chart-2 text-black";
      case "warning":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-primary text-primary-foreground";
    }
  };

  return (
    <Card className={`hover-elevate transition-all duration-300 ${className}`} data-testid={`card-stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold" data-testid={`text-count-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {displayValue}
          </div>
          {status !== "normal" && (
            <Badge 
              className={getStatusColor()}
              data-testid={`badge-status-${status}`}
            >
              {status}
            </Badge>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}