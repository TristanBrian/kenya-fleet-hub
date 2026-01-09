import { Home, Truck, Users, MapPin, Wrench, BarChart3, Settings, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRole, AppRole } from "@/hooks/useRole";

interface NavItem {
  title: string;
  url: string;
  icon: any;
  roles: AppRole[]; // Roles that can access this item
}

const allNavItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: Home, roles: ["fleet_manager", "operations", "driver", "finance"] },
  { title: "Vehicles", url: "/vehicles", icon: Truck, roles: ["fleet_manager", "operations", "finance"] },
  { title: "Drivers", url: "/drivers", icon: Users, roles: ["fleet_manager", "operations"] },
  { title: "Live Tracking", url: "/live-tracking", icon: MapPin, roles: ["fleet_manager", "operations"] },
  { title: "Maintenance", url: "/maintenance", icon: Wrench, roles: ["fleet_manager", "operations", "finance"] },
  { title: "Analytics", url: "/analytics", icon: BarChart3, roles: ["fleet_manager", "finance"] },
  { title: "Settings", url: "/settings", icon: Settings, roles: ["fleet_manager"] },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { role, hasAnyRole } = useRole();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed out successfully" });
    navigate("/auth");
  };

  // Filter nav items based on user role
  const navItems = allNavItems.filter((item) => {
    if (!role) return false;
    return hasAnyRole(item.roles);
  });

  return (
    <Sidebar collapsible="icon" className="border-r">
      <div className="p-4 border-b flex items-center gap-2">
        <Truck className="h-6 w-6 text-primary" />
        {!collapsed && (
          <div>
            <h2 className="font-bold text-lg">Safiri Smart</h2>
            <p className="text-xs text-muted-foreground">Fleet Management</p>
          </div>
        )}
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink 
                      to={item.url} 
                      className="flex items-center gap-3"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Button 
                variant="ghost" 
                onClick={handleSignOut}
                className="w-full justify-start"
              >
                <LogOut className="h-4 w-4" />
                {!collapsed && <span>Sign Out</span>}
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
