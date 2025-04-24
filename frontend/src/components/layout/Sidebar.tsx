
import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  BarChart2, 
  FileText, 
  Home, 
  Settings, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight,
  Search,
  FileCheck,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type SidebarItem = {
  icon: React.ElementType;
  label: string;
  path: string;
};

const sidebarItems: SidebarItem[] = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: FileText, label: "Documents", path: "/documents" },
  { icon: FileCheck, label: "Validations", path: "/validations" },
  { icon: BarChart2, label: "Analytics", path: "/analytics" },
  { icon: AlertTriangle, label: "Compliance", path: "/compliance" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "h-screen fixed left-0 top-0 z-30 flex flex-col bg-sidebar border-r border-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between h-16 px-4">
        {!collapsed && (
          <div className="text-xl font-semibold tracking-tight">
            <span className="text-primary">Sheet</span>Sense
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <TooltipProvider delayDuration={0}>
          <nav className="px-2 space-y-1">
            {sidebarItems.map((item) => (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2.5 rounded-md hover:bg-sidebar-accent group transition-colors",
                      {
                        "justify-center": collapsed,
                      }
                    )}
                  >
                    <item.icon size={20} className="text-muted-foreground group-hover:text-primary" />
                    {!collapsed && <span className="font-medium">{item.label}</span>}
                  </Link>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </nav>
        </TooltipProvider>
      </div>
    </div>
  );
}
