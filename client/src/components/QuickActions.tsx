import { Button } from "@/components/ui/button";
import { Plus, QrCode, UserPlus, FileText } from "lucide-react";
import { useState } from "react";

interface QuickActionsProps {
  onAddFamily?: () => void;
  onAddPatient?: () => void;
  onScanQR?: () => void;
}

export default function QuickActions({ 
  onAddFamily, 
  onAddPatient, 
  onScanQR 
}: QuickActionsProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (action: () => void, actionName: string) => {
    setIsAnimating(true);
    console.log(`${actionName} triggered`);
    action();
    setTimeout(() => setIsAnimating(false), 200);
  };

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      <Button
        size="lg"
        className={`hover-elevate active-elevate-2 transition-all duration-200 ${
          isAnimating ? "scale-95" : "scale-100"
        }`}
        onClick={() => handleClick(() => onAddFamily?.(), "Add New Family")}
        data-testid="button-add-family"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add New Family
      </Button>

      <Button
        variant="outline"
        size="lg"
        className="hover-elevate active-elevate-2"
        onClick={() => handleClick(() => onAddPatient?.(), "Add Patient")}
        data-testid="button-add-patient"
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Add Patient
      </Button>

      <Button
        variant="secondary"
        size="lg"
        className="hover-elevate active-elevate-2"
        onClick={() => handleClick(() => onScanQR?.(), "Scan QR Code")}
        data-testid="button-scan-qr"
      >
        <QrCode className="h-4 w-4 mr-2" />
        Scan QR Code
      </Button>
    </div>
  );
}