import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { BrainCircuit, Shield, TrendingUp, History } from "lucide-react"

export default function AIInsightsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">AI Decision Logic</h2>
                <p className="text-muted-foreground">Explainability engine for autonomous failure injection.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Narrative Card */}
                <Card className="col-span-2 md:col-span-1">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <BrainCircuit className="h-5 w-5 text-violet-500" />
                            <CardTitle>Decision #8492: Latency Injection on Auth</CardTitle>
                        </div>
                        <CardDescription>Executed 5 minutes ago • Confidence: 92%</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                <Shield className="h-4 w-4 text-blue-500" /> Hypothesize
                            </h4>
                            <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                                "If the Auth Service experiences 500ms latency, the Gateway should retry twice and then degrade gracefully, maintaining 99% success rate for non-critical paths."
                            </p>
                        </div>

                        <div className="relative border-l-2 border-border pl-4 space-y-4 ml-2">
                            <div className="absolute -left-[5px] top-0 h-2.5 w-2.5 rounded-full bg-violet-500" />
                            <div>
                                <h5 className="text-sm font-medium">Why this target?</h5>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Auth Service has had 3 verified deployments this week. Traffic analysis shows a 20% increase in dependency calls from Business Logic. It hasn't been tested for latency in 14 days.
                                </p>
                            </div>
                            <div className="absolute -left-[5px] top-[50%] h-2.5 w-2.5 rounded-full bg-violet-500" />
                            <div>
                                <h5 className="text-sm font-medium">Risk Assessment</h5>
                                <div className="flex gap-2 mt-1">
                                    <Badge variant="outline">Impact: Low</Badge>
                                    <Badge variant="outline">Recoverability: High</Badge>
                                    <Badge variant="outline">Blast Radius: 15%</Badge>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-green-500" /> Outcome Analysis
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-green-500/10 p-2 rounded border border-green-500/20">
                                    <span className="text-xs font-bold text-green-500 block">Expected</span>
                                    <span className="text-sm">Gateway Retry (x2)</span>
                                </div>
                                <div className="bg-red-500/10 p-2 rounded border border-red-500/20">
                                    <span className="text-xs font-bold text-red-500 block">Actual</span>
                                    <span className="text-sm">Gateway Timeout (502)</span>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                <span className="text-red-400 font-bold">Deviation Detected:</span> Gateway did not retry. Configuration mismatch suspect.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Factors Card */}
                <Card className="col-span-2 md:col-span-1">
                    <CardHeader>
                        <CardTitle>Factors Considered</CardTitle>
                        <CardDescription>Weighted signals influencing the decision.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            { name: 'Service Criticality', weight: 85, status: 'High' },
                            { name: 'Change Frequency', weight: 60, status: 'Moderate' },
                            { name: 'Time Since Last Test', weight: 95, status: 'Critical' },
                            { name: 'Historical Fragility', weight: 40, status: 'Low' },
                            { name: 'Current Traffic Load', weight: 20, status: 'Safe' },
                        ].map((factor, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium">{factor.name}</p>
                                    <div className="h-1.5 w-32 bg-secondary rounded-full mt-1 overflow-hidden">
                                        <div className="h-full bg-violet-500" style={{ width: `${factor.weight}%` }} />
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-muted-foreground">{factor.weight}%</span>
                                </div>
                            </div>
                        ))}

                        <div className="pt-4">
                            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                <History className="h-4 w-4" /> Past Decisions
                            </h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex justify-between items-center hover:bg-muted p-1 rounded cursor-pointer">
                                    <span>Business Logic CPU Spike</span>
                                    <Badge variant="outline" className="text-xs">Success</Badge>
                                </li>
                                <li className="flex justify-between items-center hover:bg-muted p-1 rounded cursor-pointer">
                                    <span>DB Packet Loss</span>
                                    <Badge variant="outline" className="text-xs">Aborted</Badge>
                                </li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
