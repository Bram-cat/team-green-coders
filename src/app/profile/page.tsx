import { SignOutButton, UserProfile } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function ProfilePage() {
    return (
        <div className="container py-12 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8">Profile</h1>
            <UserProfile routing="hash" />
        </div>
    );
}
