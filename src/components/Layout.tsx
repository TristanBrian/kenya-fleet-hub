import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useRole } from "@/hooks/useRole";
import { Badge } from "@/components/ui/badge";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const { profile, role, loading } = useRole();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
    };

    checkAuth();
  }, [navigate]);

  const getRoleBadge = () => {
    if (!role) return null;
    
    const roleLabels: Record<string, string> = {
      fleet_manager: "Fleet Manager",
      operations: "Operations",
      driver: "Driver",
      finance: "Finance",
    };

    const roleColors: Record<string, string> = {
      fleet_manager: "bg-primary/10 text-primary border-primary",
      operations: "bg-blue-500/10 text-blue-600 border-blue-500",
      driver: "bg-green-500/10 text-green-600 border-green-500",
      finance: "bg-purple-500/10 text-purple-600 border-purple-500",
    };

    return (
      <Badge variant="outline" className={roleColors[role] || ""}>
        {roleLabels[role] || role}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b flex items-center justify-between px-4 bg-background sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <p className="text-sm text-muted-foreground">
                  Welcome back, <span className="font-medium text-foreground">{profile?.full_name || "User"}</span>
                </p>
              </div>
            </div>
            {getRoleBadge()}
          </header>

          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
