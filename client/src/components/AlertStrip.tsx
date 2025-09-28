import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info, X, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

interface AlertItem {
  id: string;
  type: "warning" | "info" | "urgent";
  title: string;
  description: string;
  count?: number;
}

const mockAlerts: AlertItem[] = [
  {
    id: "1",
    type: "urgent",
    title: "High-Risk Pregnancy Alert",
    description: "2 women require immediate medical attention",
    count: 2,
  },
  {
    id: "2", 
    type: "warning",
    title: "Vaccination Due",
    description: "5 children have pending vaccinations this week",
    count: 5,
  },
  {
    id: "3",
    type: "info",
    title: "ANC Visits Scheduled",
    description: "3 antenatal checkups scheduled for tomorrow",
    count: 3,
  },
];

export default function AlertStrip() {
  const [alerts, setAlerts] = useState<AlertItem[]>(mockAlerts); // TODO: remove mock functionality
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Auto-scroll through alerts
  useEffect(() => {
    if (alerts.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % alerts.length);
    }, 4000); // Change alert every 4 seconds

    return () => clearInterval(interval);
  }, [alerts.length]);

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    console.log(`Alert ${alertId} dismissed`);
  };

  const getAlertColor = (type: AlertItem["type"]) => {
    switch (type) {
      case "urgent":
        return "border-destructive bg-destructive/10 text-destructive";
      case "warning":
        return "border-chart-2 bg-chart-2/10 text-chart-2";
      case "info":
        return "border-primary bg-primary/10 text-primary";
      default:
        return "border-border";
    }
  };

  const getIcon = (type: AlertItem["type"]) => {
    switch (type) {
      case "urgent":
      case "warning":
        return <AlertTriangle className="h-4 w-4" />;
      case "info":
        return <Info className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  if (!isVisible || alerts.length === 0) return null;

  const currentAlert = alerts[currentIndex];

  return (
    <div className="w-full">
      <Alert 
        className={`${getAlertColor(currentAlert.type)} transition-all duration-500 animate-in slide-in-from-top-2`}
        data-testid={`alert-${currentAlert.type}`}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-3 flex-1">
            {getIcon(currentAlert.type)}
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-sm">{currentAlert.title}</span>
                {currentAlert.count && (
                  <Badge variant="secondary" className="text-xs" data-testid={`badge-alert-count-${currentAlert.count}`}>
                    {currentAlert.count}
                  </Badge>
                )}
              </div>
              <AlertDescription className="text-xs mt-1">
                {currentAlert.description}
              </AlertDescription>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {alerts.length > 1 && (
              <div className="flex space-x-1">
                {alerts.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                      index === currentIndex ? "bg-current" : "bg-current/30"
                    }`}
                  />
                ))}
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover-elevate"
              onClick={() => console.log("View alert details")}
              data-testid="button-alert-details"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover-elevate"
              onClick={() => dismissAlert(currentAlert.id)}
              data-testid="button-alert-dismiss"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </Alert>
    </div>
  );
}