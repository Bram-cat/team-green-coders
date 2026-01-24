'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function HistoryPage() {
    return (
        <div className="container py-12">
            <h1 className="text-3xl font-bold mb-6">History</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Recent Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">No history available yet.</p>
                </CardContent>
            </Card>
        </div>
    )
}
