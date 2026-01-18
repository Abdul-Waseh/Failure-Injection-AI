import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Zap, Check, ExternalLink } from "lucide-react"

export default function WeaknessesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Discovered Weaknesses</h2>
                <p className="text-muted-foreground">Resilience gaps identified by chaos experiments.</p>
            </div>

            <div className="grid gap-4">
                <Card className="border-l-4 border-l-red-500">
                    <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-start">
                        <div className="p-3 bg-red-500/10 rounded-full">
                            <AlertTriangle className="h-6 w-6 text-red-500" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold">Unbounded Retry Storm</h3>
                                <Badge variant="destructive">Critical</Badge>
                                <Badge variant="outline">Auth Service</Badge>
                            </div>
                            <p className="text-muted-foreground text-sm">
                                When the Database slows down, the Auth Service retries infinitely without exponential backoff, causing a localized DoS and eventual crash of the Auth pod.
                            </p>
                            <div className="pt-2 flex items-center gap-4 text-sm font-medium">
                                <span className="text-red-400">Fix Confidence: 98%</span>
                                <span className="text-muted-foreground flex items-center gap-1">
                                    <Zap className="h-3 w-3" /> Auto-Fix Available
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 min-w-[150px]">
                            <Button className="w-full">Apply Fix</Button>
                            <Button variant="outline" className="w-full">View Trace</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-yellow-500">
                    <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-start">
                        <div className="p-3 bg-yellow-500/10 rounded-full">
                            <AlertTriangle className="h-6 w-6 text-yellow-500" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold">Missing Fallback UI</h3>
                                <Badge className="bg-yellow-500 hover:bg-yellow-600">High</Badge>
                                <Badge variant="outline">Frontend / Gateway</Badge>
                            </div>
                            <p className="text-muted-foreground text-sm">
                                If Business Service returns 503, the Gateway exposes the raw error to the client instead of serving cached or stale data.
                            </p>
                            <div className="pt-2 flex items-center gap-4 text-sm font-medium">
                                <span className="text-yellow-500">Fix Confidence: 75%</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 min-w-[150px]">
                            <Button variant="outline" className="w-full gap-2">
                                <ExternalLink className="h-4 w-4" /> Jira Ticket
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500 opacity-60">
                    <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-start">
                        <div className="p-3 bg-green-500/10 rounded-full">
                            <Check className="h-6 w-6 text-green-500" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold">Resolved: Connection Leak</h3>
                                <Badge variant="outline">Resolved</Badge>
                            </div>
                            <p className="text-muted-foreground text-sm">
                                Fixed connection leak in Go-Redis client v8 implementation. Verified by Chaos Run #99.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
