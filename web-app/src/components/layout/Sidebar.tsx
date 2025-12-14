 "use client";
 import { useState } from 'react';
 import Link from 'next/link';
 import { 
   LayoutDashboard, 
   Factory, 
   Users, 
   ClipboardCheck, 
   Truck, 
   AlertTriangle, 
   Settings, 
   ChevronLeft,
   ChevronRight,
   Gauge,
   Package
 } from 'lucide-react';
 import { cn } from '@/src/lib/utils';

const navigationItems = [
  { icon: LayoutDashboard, label: 'Panel', view: 'dashboard' },
  { icon: Factory, label: 'İstehsal', view: 'production' },
  { icon: Package, label: 'Xammal', view: 'materials' },
  { icon: ClipboardCheck, label: 'Keyfiyyət Nəzarəti', view: 'quality' },
  { icon: Truck, label: 'Logistika', view: 'logistics' },
  { icon: Users, label: 'Təchizatçılar', view: 'suppliers' },
  { icon: AlertTriangle, label: 'Bildirişlər', view: 'alerts' },
  { icon: Gauge, label: 'Performans', view: 'performance' },
  { icon: Settings, label: 'Ayarlar', view: 'settings' },
  { icon: Users, label: 'Admin', view: 'admin' },
];

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const currentView = (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('view') : null) || 'dashboard';

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col z-50 transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-effect">
              <Factory className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-foreground text-lg tracking-tight">PipeFlow</h1>
              <p className="text-xs text-muted-foreground">Pipeline Management</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 mx-auto rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-effect">
            <Factory className="w-5 h-5 text-primary-foreground" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => (
          <Link
            key={item.view}
            href={`/?view=${item.view}`}
            className={cn(
              "sidebar-link",
              currentView === item.view && "sidebar-link-active",
              collapsed && "justify-center px-3"
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* User Info */}
      <div className={cn(
        "p-4 border-t border-sidebar-border",
        collapsed && "px-3"
      )}>
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/50 to-accent/50 flex items-center justify-center text-sm font-semibold text-foreground">
            AD
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Admin User</p>
              <p className="text-xs text-muted-foreground truncate">System Admin</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
