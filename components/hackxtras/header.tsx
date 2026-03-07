"use client";

import { useState, useEffect } from "react";
import { useProStatus } from "@/hooks/use-pro-status";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Shield, User, ChevronDown, LogOut, Settings, Mail, Search, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Grouped Nav Links
const navGroups = {
  Learn: [
    { name: "Courses", href: "/courses" },
    { name: "Labs", href: "/labs" },
    { name: "Resources", href: "/resources" },
    { name: "Kali Tools", href: "/tools" },
    { name: "DevOps", href: "/devops" },
  ],
  Community: [
    { name: "Community", href: "/community" },
    { name: "Team", href: "/team" },
    { name: "Leaderboard", href: "/leaderboard" },
    { name: "Store", href: "/store" },
    { name: "Contact", href: "/contact", icon: Mail }, // Added Mail icon here
  ],
  Media: [
    { name: "Channels", href: "/channels" },
    { name: "News", href: "/news" },
  ]
};

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { isPro, isAuthenticated } = useProStatus();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) { }
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    window.dispatchEvent(new Event('storage'));
    router.push('/');
    router.refresh();
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <nav className="mx-auto max-w-7xl px-6 py-5">
        <div className="flex items-center justify-between rounded-xl border border-border/50 bg-background/60 px-6 py-3 backdrop-blur-xl">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <span className="font-display text-lg font-semibold tracking-tight text-foreground">
              HackXtras
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-6 md:flex">
            {/* Learn Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground gap-1">
                  Learn <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {navGroups.Learn.map(link => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href} className="cursor-pointer">{link.name}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Community Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground gap-1">
                  Community <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {navGroups.Community.map(link => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href} className="cursor-pointer">{link.name}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Media Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground gap-1">
                  Media <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {navGroups.Media.map(link => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href} className="cursor-pointer">{link.name}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Standalone Link */}
            <Link href="/challenges" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Challenges
            </Link>
            {/* Premium Link */}
            <Link href="/pricing" className="text-sm font-bold bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent hover:from-yellow-400 hover:to-amber-500 transition-all">
              Premium
            </Link>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => window.dispatchEvent(new Event("open-search"))}
                >
                  <Search className="h-5 w-5" />
                </Button>
                <Link href="/dashboard/inbox">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Mail className="h-5 w-5" />
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isPro ? 'bg-yellow-500/20 ring-1 ring-yellow-500/50' : 'bg-primary/20'}`}>
                        {isPro ? (
                          <Crown className="h-3.5 w-3.5 text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                        ) : (
                          <User className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      {isPro ? "Pro Member" : "Profile"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer flex items-center gap-2">
                        <User className="h-4 w-4" /> Overview
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer flex items-center gap-2">
                        <Settings className="h-4 w-4" /> Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 focus:text-red-500 flex items-center gap-2">
                      <LogOut className="h-4 w-4" /> Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => window.dispatchEvent(new Event("open-search"))}
                >
                  <Search className="h-5 w-5" />
                </Button>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:hidden"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="mt-2 overflow-hidden rounded-xl border border-border/50 bg-background/95 backdrop-blur-2xl md:hidden shadow-2xl"
            >
              <div className="flex flex-col p-5 gap-6">
                {/* Search Bar Mobile */}
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    placeholder="Search platform..."
                    readOnly
                    onClick={() => {
                      setIsOpen(false);
                      window.dispatchEvent(new Event("open-search"));
                    }}
                    className="w-full bg-muted/50 border border-border/50 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer"
                  />
                </div>

                {/* Categorized Links */}
                <div className="grid grid-cols-2 gap-8">
                  {Object.entries(navGroups).map(([group, links]) => (
                    <div key={group} className="space-y-3">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-1">{group}</h4>
                      <div className="flex flex-col gap-2.5">
                        {links.map(link => (
                          <Link
                            key={link.name}
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
                          >
                            {link.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Primary Actions */}
                <div className="space-y-3 border-t border-border/50 pt-6">
                  <Link
                    href="/challenges"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between rounded-lg bg-primary/5 border border-primary/20 px-4 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary/10"
                  >
                    <span>Challenges</span>
                    <Shield className="h-4 w-4 opacity-50" />
                  </Link>
                  <Link
                    href="/pricing"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between rounded-lg bg-yellow-500/5 border border-yellow-500/20 px-4 py-3 text-sm font-bold text-yellow-600 transition-colors hover:bg-yellow-500/10"
                  >
                    <span>Premium Unlocked</span>
                    <Crown className="h-4 w-4 opacity-50 shadow-[0_0_8px_currentColor]" />
                  </Link>
                </div>

                {/* User Info / Auth */}
                <div className="border-t border-border/50 pt-6 pb-2">
                  {isAuthenticated ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 px-2 mb-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPro ? 'bg-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'bg-primary/20'}`}>
                          {isPro ? <Crown className="h-5 w-5 text-yellow-500" /> : <User className="h-5 w-5 text-primary" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">{isPro ? "Pro Member" : "Standard Account"}</p>
                          <p className="text-xs text-muted-foreground truncate">Logged in successfully</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Link href="/profile" onClick={() => setIsOpen(false)} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full gap-2 border-border/50">
                            <Settings className="h-4 w-4" /> Account
                          </Button>
                        </Link>
                        <Link href="/dashboard/inbox" onClick={() => setIsOpen(false)} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full gap-2 border-border/50">
                            <Mail className="h-4 w-4" /> Inbox
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" onClick={handleLogout} className="col-span-2 text-red-500 hover:text-red-400 hover:bg-red-500/5 gap-2 mt-2">
                          <LogOut className="h-4 w-4" /> Sign Out
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <Link href="/login" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full border-border/50">Sign In</Button>
                      </Link>
                      <Link href="/signup" onClick={() => setIsOpen(false)}>
                        <Button className="w-full bg-primary text-primary-foreground">Get Started</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
}
