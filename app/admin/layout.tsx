'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  LayoutDashboard, BookOpen, Briefcase, Microscope,
  Library, Users, Tv, Film, Flag, Settings,
  MessageSquare, Radio, ShoppingCart, Newspaper,
  Hammer, LogOut, Menu, X, ShieldAlert, Workflow, Award, Monitor
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuth, setIsAuth] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token && !pathname.includes('/login')) {
      router.push('/admin/login');
    } else {
      setIsAuth(!!token);
    }

    // Close sidebar by default on mobile
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [router, pathname]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    router.push('/admin/login');
  };

  const menuItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Courses', href: '/admin/courses', icon: BookOpen },
    { name: 'Positions', href: '/admin/positions', icon: Briefcase },
    { name: 'Labs', href: '/admin/labs', icon: Microscope },
    { name: 'Resources', href: '/admin/resources', icon: Library },
    { name: 'Challenges', href: '/admin/challenges', icon: Flag },
    { name: 'Team', href: '/admin/team', icon: Users },
    { name: 'Channels', href: '/admin/channels', icon: Tv },
    { name: 'Docs', href: '/admin/documentaries', icon: Film },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Chats', href: '/admin/chat', icon: MessageSquare },
    { name: 'Broadcast', href: '/admin/broadcast', icon: Radio },
    { name: 'Store', href: '/admin/store', icon: ShoppingCart },
    { name: 'News', href: '/admin/news', icon: Newspaper },
    { name: "DevOps", href: "/admin/devops", icon: Workflow },
    { name: "Badges", href: "/admin/badges", icon: Award },
    { name: "Sessions", href: "/admin/sessions", icon: Monitor },
    { name: "Audit Logs", href: "/admin/logs", icon: Hammer },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  if (pathname.includes('/login')) {
    return children;
  }

  if (!isAuth) {
    return null;
  }

  return (
    <div className="flex h-screen bg-black text-white selection:bg-blue-500/30 overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 md:relative md:translate-x-0 transition-transform duration-300 transform ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-20'
          } bg-black/80 backdrop-blur-xl border-r border-white/10 flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between border-b border-white/10 h-16">
          {(sidebarOpen || !sidebarOpen) && (
            <div className={`flex items-center gap-2 font-bold text-xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 ${!sidebarOpen && 'md:hidden'}`}>
              <ShieldAlert className="h-6 w-6 text-blue-500" />
              {sidebarOpen && "HackXtras"}
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} className="md:hidden" />}
            {!sidebarOpen && <Menu size={20} className="hidden md:block" />}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-hide">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} onClick={() => {
                if (window.innerWidth < 768) setSidebarOpen(false);
              }}>
                <div
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white hover:border-white/10 border border-transparent'
                    }`}
                >
                  <Icon size={20} className={isActive ? 'animate-pulse' : ''} />
                  <span className={`font-medium text-sm ${!sidebarOpen ? 'md:hidden' : 'block'}`}>{item.name}</span>

                  {isActive && sidebarOpen && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_5px_currentColor]" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 bg-black/20">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <LogOut size={20} />
            {sidebarOpen && "Logout System"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <header className="h-16 bg-black/50 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-white/10 rounded-lg md:hidden text-gray-400"
            >
              <Menu size={22} />
            </button>
            <h2 className="text-lg md:text-xl font-bold text-gray-200 flex items-center gap-2">
              <span className="text-blue-500">/</span>
              {menuItems.find(i => i.href === pathname)?.name || 'Admin'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden lg:block">
              <div className="text-[10px] text-gray-500 uppercase font-mono leading-none">Logged in as</div>
              <div className="text-sm font-bold text-gray-300 font-mono">{localStorage.getItem('adminEmail')}</div>
            </div>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 ring-2 ring-white/10" />
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {children}
        </main>
      </div>
    </div>
  );
}
