import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Home, Baby, Activity, FileText, MapPin } from "lucide-react";
import { Link } from "wouter";

interface NavigationItem {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  path: string;
  color: string;
}

const navigationItems: NavigationItem[] = [
  {
    title: "All Families",
    description: "Ghar-wise data access",
    icon: Users,
    path: "/families",
    color: "text-blue-600",
  },
  {
    title: "Pregnancy Care",
    description: "ANC, checkups, risk alerts",
    icon: Home,
    path: "/pregnancy",
    color: "text-pink-600",
  },
  {
    title: "Child Care",
    description: "Vaccination, growth tracking",
    icon: Baby,
    path: "/children",
    color: "text-green-600",
  },
  {
    title: "TB / Diseases",
    description: "Patient tracking & medicine",
    icon: Activity,
    path: "/diseases",
    color: "text-red-600",
  },
  {
    title: "Reports",
    description: "Monthly / weekly reports",
    icon: FileText,
    path: "/reports",
    color: "text-purple-600",
  },
  {
    title: "Village Map",
    description: "Ghar locations & alerts",
    icon: MapPin,
    path: "/map",
    color: "text-orange-600",
  },
];

export default function NavigationGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {navigationItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <Link key={item.title} href={item.path}>
            <Card 
              className="hover-elevate active-elevate-2 cursor-pointer transition-all duration-200 hover:scale-105" 
              style={{
                animationDelay: `${index * 100}ms`,
                animation: "fadeInUp 0.5s ease-out forwards",
                opacity: 0,
                transform: "translateY(20px)"
              }}
              data-testid={`card-nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <CardContent className="p-6 text-center">
                <div className="flex flex-col items-center space-y-3">
                  <div className={`p-3 rounded-lg bg-muted ${item.color}`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}