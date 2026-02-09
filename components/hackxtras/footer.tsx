"use client";

import { motion } from "framer-motion";
import { Shield, Github, Twitter, Linkedin, Mail, Youtube, Crown } from "lucide-react";
import { useProStatus } from "@/hooks/use-pro-status";
import Link from "next/link";

const footerLinks = {
  company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
  ],
  resources: [
    { label: "Documentation", href: "#" },
    { label: "API Reference", href: "#" },
    { label: "Community", href: "/community" },
    { label: "Support", href: "#" },
  ],
  learning: [
    { label: "Courses", href: "/courses" },
    { label: "Labs", href: "/labs" },
    { label: "Resources", href: "/resources" },
    { label: "Documentary", href: "/documentary" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Youtube, href: "#", label: "YouTube" },
  { icon: Mail, href: "#", label: "Email" },
];

export function Footer() {
  const isPro = useProStatus();

  return (
    <footer className={`relative border-t ${isPro ? 'border-yellow-500/20 bg-black' : 'border-border/30 bg-background'}`}>
      <div className="mx-auto max-w-7xl px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Top Section */}
          <div className="mb-12 grid gap-12 md:grid-cols-4">
            {/* Brand */}
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center gap-2.5 mb-4">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${isPro ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-primary/10 border-primary/20'} border`}>
                  {isPro ? (
                    <Crown className="h-5 w-5 text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                  ) : (
                    <Shield className="h-5 w-5 text-primary" />
                  )}
                </div>
                <span className={`font-display text-lg font-semibold tracking-tight ${isPro ? 'text-yellow-500' : 'text-foreground'}`}>
                  HackXtras
                </span>
              </Link>
              <p className="text-sm text-muted-foreground max-w-xs">
                Elite platform for cybersecurity learning and hands-on training.
              </p>
              {/* Social Links */}
              <div className="flex items-center gap-3 mt-6">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      aria-label={social.label}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 bg-muted/50 text-muted-foreground transition-all duration-200 ${isPro ? 'hover:bg-yellow-500/10 hover:border-yellow-500/50 hover:text-yellow-500' : 'hover:bg-primary/10 hover:border-primary/50 hover:text-primary'}`}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Links Sections */}
            <div>
              <h3 className="font-semibold text-foreground text-sm mb-4">Company</h3>
              <ul className="space-y-3">
                {footerLinks.company.filter(link => link.href !== "#").map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground text-sm mb-4">Resources</h3>
              <ul className="space-y-3">
                {footerLinks.resources.filter(link => link.href !== "#").map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground text-sm mb-4">Learning</h3>
              <ul className="space-y-3">
                {footerLinks.learning.filter(link => link.href !== "#").map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className={`border-t ${isPro ? 'border-yellow-500/20' : 'border-border/30'} pt-8 flex flex-col items-center justify-between gap-4 md:flex-row`}>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} HackXtras. All rights reserved.
            </p>
            <p className={`text-sm ${isPro ? 'text-yellow-500/70 font-medium' : 'text-muted-foreground'}`}>
              Empowering the next generation of cybersecurity professionals.
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
