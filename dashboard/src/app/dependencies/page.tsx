"use client"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const services = [
    { id: 'gateway', name: 'API Gateway', x: 250, y: 50, type: 'entry', status: 'healthy', fragility: 'Low' },
    { id: 'auth', name: 'Auth Service', x: 100, y: 200, type: 'critical', status: 'degraded', fragility: 'High' },
    { id: 'business', name: 'Business Logic', x: 400, y: 200, type: 'service', status: 'healthy', fragility: 'Medium' },
    { id: 'db', name: 'Database', x: 250, y: 350, type: 'db', status: 'healthy', fragility: 'Low' },
]

const edges = [
    { from: 'gateway', to: 'auth' },
    { from: 'gateway', to: 'business' },
    { from: 'business', to: 'auth' }, // verifying business calls auth
    { from: 'business', to: 'db' },
    { from: 'auth', to: 'db' },
]

export default function DependenciesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Service Dependency Graph</h2>
                <p className="text-muted-foreground">Interactive map of system fragility and traffic flow.</p>
            </div>

            <Card className="h-[600px] relative overflow-hidden bg-dot-pattern">
                <CardContent className="h-full p-0 relative">
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <defs>
                            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
                            </marker>
                        </defs>
                        {edges.map((edge, i) => {
                            const source = services.find(s => s.id === edge.from)!
                            const target = services.find(s => s.id === edge.to)!
                            return (
                                <line
                                    key={i}
                                    x1={source.x + 100} y1={source.y + 40}
                                    x2={target.x + 100} y2={target.y + 40}
                                    stroke="#334155"
                                    strokeWidth="2"
                                    markerEnd="url(#arrowhead)"
                                    className="opacity-50"
                                />
                            )
                        })}
                    </svg>

                    {services.map((service) => (
                        <motion.div
                            key={service.id}
                            className="absolute"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            style={{ left: service.x, top: service.y }}
                        >
                            <Card className={`w-[200px] shadow-lg border-2 ${service.status === 'degraded' ? 'border-yellow-500/50' : 'border-border'}`}>
                                <CardHeader className="p-4 pb-2">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-sm font-bold">{service.name}</CardTitle>
                                        <Badge variant={service.status === 'healthy' ? 'outline' : 'destructive'}
                                            className={service.status === 'degraded' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : ''}>
                                            {service.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-2">
                                    <div className="text-xs text-muted-foreground">
                                        Fragility: <span className={service.fragility === 'High' ? 'text-red-400 font-bold' : ''}>{service.fragility}</span>
                                    </div>
                                    <div className="mt-2 h-1 w-full bg-secondary rounded-full overflow-hidden">
                                        <div className="h-full bg-primary/50" style={{ width: '60%' }} />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </CardContent>
            </Card>

            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Critical Paths</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">2</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Fragility Score</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-yellow-500">65/100</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Cyclic Dependencies</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-500">0</div></CardContent>
                </Card>
            </div>
        </div>
    )
}
