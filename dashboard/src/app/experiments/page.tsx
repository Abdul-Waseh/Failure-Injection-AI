import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Play, Square, AlertOctagon } from "lucide-react"

const experiments = [
    { id: 'exp-101', name: 'Auth Latency Spike', target: 'auth-service', type: 'Latency', status: 'Running', duration: '5m', impact: 'High' },
    { id: 'exp-100', name: 'DB Connection Drop', target: 'database', type: 'Blackhole', status: 'Completed', duration: '2m', impact: 'Critical' },
    { id: 'exp-099', name: 'Gateway CPU Stress', target: 'gateway', type: 'Resource', status: 'Completed', duration: '10m', impact: 'Medium' },
    { id: 'exp-098', name: 'Business Logic Error', target: 'business', type: 'Exception', status: 'Aborted', duration: '1m', impact: 'Low' },
]

export default function ExperimentsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Chaos Experiments</h2>
                    <p className="text-muted-foreground">Control plane for failure injection.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="destructive" className="gap-2">
                        <AlertOctagon className="h-4 w-4" />
                        Emergency Stop
                    </Button>
                    <Button className="gap-2">
                        <Play className="h-4 w-4" />
                        New Experiment
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active & Recent Experiments</CardTitle>
                    <CardDescription>History of automated and manual injections.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Status</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Target</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {experiments.map((exp) => (
                                <TableRow key={exp.id}>
                                    <TableCell>
                                        <Badge variant={
                                            exp.status === 'Running' ? 'default' :
                                                exp.status === 'Completed' ? 'secondary' : 'outline'
                                        } className={exp.status === 'Running' ? 'bg-green-500 hover:bg-green-600' : ''}>
                                            {exp.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">{exp.name}</TableCell>
                                    <TableCell>{exp.target}</TableCell>
                                    <TableCell>{exp.type}</TableCell>
                                    <TableCell>{exp.duration}</TableCell>
                                    <TableCell>
                                        {exp.status === 'Running' ? (
                                            <Button size="sm" variant="outline" className="h-8 gap-1">
                                                <Square className="h-3 w-3 fill-current" /> Stop
                                            </Button>
                                        ) : (
                                            <Button size="sm" variant="ghost" className="h-8">Details</Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
