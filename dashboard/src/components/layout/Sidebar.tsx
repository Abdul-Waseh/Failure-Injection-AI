"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Network, TestTube, BrainCircuit, ShieldAlert, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
    { name: 'Overview', href: '/', icon: LayoutDashboard },
    { name: 'Dependencies', href: '/dependencies', icon: Network },
    { name: 'Chaos Experiments', href: '/experiments', icon: TestTube },
    { name: 'AI Decisions', href: '/ai-insights', icon: BrainCircuit },
    { name: 'Weaknesses', href: '/weaknesses', icon: ShieldAlert },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="flex flex-col h-screen w-64 bg-card border-r border-border text-card-foreground">
            <div className="p-6 border-b border-border flex items-center gap-2">
                <Activity className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold tracking-tight">Failure AI</h1>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>
            <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-muted-foreground">System Active</span>
                </div>
            </div>
        </div>
    )
}
