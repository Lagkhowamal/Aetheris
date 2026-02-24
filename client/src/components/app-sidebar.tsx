import { Link, useLocation } from "wouter";
import { Users, MessageSquare, Activity, Settings, LogOut, Stethoscope } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AppSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <Sidebar className="border-r border-border/50 bg-sidebar">
      <SidebarHeader className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-lg tracking-tight leading-none text-foreground">Aetheris</h2>
            <p className="text-xs text-muted-foreground font-medium">Medical Intelligence</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-2 pt-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-2">
            Clinical
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === "/" || location.startsWith("/patients")}>
                  <Link href="/">
                    <Users className="w-5 h-5" />
                    <span className="font-medium">Patients</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.startsWith("/chat")}>
                  <Link href="/chat">
                    <MessageSquare className="w-5 h-5" />
                    <span className="font-medium">AI Assistant</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/50">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-9 w-9 border border-border">
            <AvatarImage src={user?.profileImageUrl || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "Dr"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="text-sm font-semibold truncate">
              {user?.firstName ? `Dr. ${user.lastName}` : "Provider"}
            </span>
            <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
          </div>
        </div>
        <button 
          onClick={() => logout()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors w-full px-2 py-1.5 rounded-md hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-medium">Log out</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
