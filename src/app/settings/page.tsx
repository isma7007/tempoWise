import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CategoryManager } from "@/components/category-manager";

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Manage your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue="John Doe" disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="john.doe@example.com" disabled />
            </div>
            <Button disabled>Save Changes</Button>
          </CardContent>
        </Card>
        
        <Separator />

        <CategoryManager />

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
            <CardDescription>Connect with other services.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Google Calendar</h3>
                <p className="text-sm text-muted-foreground">Sync events to track time automatically.</p>
              </div>
              <Button variant="outline" disabled>Connect</Button>
            </div>
          </CardContent>
        </Card>
        
        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>Export or delete your application data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Export Data</h3>
                <p className="text-sm text-muted-foreground">Download all your activities in CSV format.</p>
              </div>
              <Button variant="secondary" disabled>Export CSV</Button>
            </div>
            <div className="flex items-center justify-between p-4 border border-destructive/50 rounded-lg">
              <div>
                <h3 className="font-semibold text-destructive">Delete Account</h3>
                <p className="text-sm text-muted-foreground">Permanently delete your account and all data.</p>
              </div>
              <Button variant="destructive" disabled>Delete</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
