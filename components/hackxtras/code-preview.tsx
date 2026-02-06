"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Play, Copy, Check, Crown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useProStatus } from "@/hooks/use-pro-status";

const codeExample = `// Secure authentication implementation
import { hash, verify } from '@/lib/crypto'
import { createSession } from '@/lib/session'

export async function authenticate(
  credentials: Credentials
): Promise<AuthResult> {
  const user = await db.user.findUnique({
    where: { email: credentials.email }
  })

  if (!user) {
    return { success: false, error: 'Invalid credentials' }
  }

  const isValid = await verify(
    credentials.password,
    user.passwordHash
  )

  if (!isValid) {
    await logFailedAttempt(user.id)
    return { success: false, error: 'Invalid credentials' }
  }

  const session = await createSession(user.id)
  return { success: true, session }
}`;

export function CodePreview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [copied, setCopied] = useState(false);
  const isPro = useProStatus();

  const handleCopy = () => {
    navigator.clipboard.writeText(codeExample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="labs" className="relative py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Content */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -15 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -15 }}
            transition={{ duration: 0.5 }}
          >
            <span className={`font-mono text-sm uppercase tracking-wider ${isPro ? 'text-yellow-500' : 'text-primary'}`}>
              Hands-on Labs
            </span>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Learn by building secure systems
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Our interactive labs let you practice real-world security
              scenarios in a safe environment. Write secure code, exploit
              vulnerabilities, and learn defensive techniques hands-on.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                "Real-world vulnerability simulations",
                "Instant feedback and guided solutions",
                "Progress tracking and certifications",
                "Collaborative team challenges",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full ${isPro ? 'bg-yellow-500/10 text-yellow-500' : 'bg-primary/10 text-primary'}`}>
                    <Check className="h-3 w-3" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <Button className={`mt-8 ${isPro ? 'bg-yellow-500 text-black hover:bg-yellow-400 font-bold shadow-[0_0_20px_rgba(234,179,8,0.3)]' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>
              <Play className="mr-2 h-4 w-4" />
              Try a Lab
            </Button>
          </motion.div>

          {/* Code Block */}
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 15 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative"
          >
            <div className={`overflow-hidden rounded-xl border ${isPro ? 'border-yellow-500/20 bg-yellow-500/5 shadow-[0_0_40px_rgba(234,179,8,0.1)]' : 'border-border/50 bg-card/80 shadow-2xl'} backdrop-blur-sm`}>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-muted" />
                    <span className="h-3 w-3 rounded-full bg-muted" />
                    <span className="h-3 w-3 rounded-full bg-muted" />
                  </div>
                  <span className="ml-3 font-mono text-xs text-muted-foreground">
                    auth.ts
                  </span>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>

              {/* Code */}
              <div className="overflow-x-auto p-4">
                <pre className="font-mono text-sm leading-relaxed">
                  <code className="text-muted-foreground">
                    {codeExample.split("\n").map((line, i) => (
                      <div key={i} className="flex">
                        <span className="mr-4 inline-block w-6 text-right text-muted-foreground/50 select-none">
                          {i + 1}
                        </span>
                        <span
                          className={
                            line.startsWith("//")
                              ? "text-muted-foreground/70"
                              : line.includes("export") || line.includes("import") || line.includes("async") || line.includes("const") || line.includes("if") || line.includes("return")
                                ? (isPro ? "text-yellow-500 font-medium" : "text-primary")
                                : "text-foreground/80"
                          }
                        >
                          {line || " "}
                        </span>
                      </div>
                    ))}
                  </code>
                </pre>
              </div>
            </div>

            {/* Glow effect */}
            <div className={`absolute -inset-4 -z-10 rounded-2xl ${isPro ? 'bg-yellow-500/10' : 'bg-primary/5'} blur-xl`} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
