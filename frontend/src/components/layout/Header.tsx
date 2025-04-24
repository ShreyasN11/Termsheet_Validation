
import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function Header() {
  const [searchActive, setSearchActive] = useState(false);
  const [unreadCount] = useState(3);

  return (
    <header className="h-16 border-b border-border sticky top-0 z-20 bg-background/95 backdrop-blur-sm flex items-center px-6 gap-4">
      <div className={cn("flex-1 transition-all", searchActive ? "mr-0" : "mr-auto")}>
        <div className="relative">
          <Search 
            size={18} 
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-opacity",
              searchActive ? "opacity-100" : "opacity-70"
            )} 
          />
          <Input 
            placeholder="Search term sheets, companies, clauses..." 
            className={cn(
              "pl-10 transition-all bg-transparent focus-visible:bg-muted/30",
              searchActive ? "w-full" : "w-64 md:w-80 focus:w-96"
            )}
            onFocus={() => setSearchActive(true)}
            onBlur={() => setSearchActive(false)}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={18} />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[18px] flex items-center justify-center">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-[300px] overflow-y-auto">
              <DropdownMenuItem className="py-2 cursor-pointer">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span className="font-medium">New validation completed</span>
                    <span className="text-xs text-muted-foreground">2m ago</span>
                  </div>
                  <p className="text-sm text-muted-foreground">The term sheet for Acme Corp has been validated.</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="py-2 cursor-pointer">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span className="font-medium">Compliance issue detected</span>
                    <span className="text-xs text-muted-foreground">1h ago</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Critical compliance issue detected in section 3.2.</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="py-2 cursor-pointer">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span className="font-medium">System update</span>
                    <span className="text-xs text-muted-foreground">6h ago</span>
                  </div>
                  <p className="text-sm text-muted-foreground">New financial terms validation model deployed.</p>
                </div>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center font-medium text-sm">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <User size={18} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>API Keys</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
