import { useState } from 'react'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@radix-ui/react-switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs'
import { Save, Lock, Bell, Palette } from 'lucide-react'

export function SettingsPage() {
  const [formData, setFormData] = useState({
    fullName: 'John Doe',
    email: 'john@bank.com',
    department: 'Approvals',
    phone: '+1 (555) 000-0000',
  })

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    twoFactor: true,
    darkMode: false,
  })

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account and preferences</p>
        </div>

        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette size={20} />
              Profile Settings
            </CardTitle>
            <CardDescription>Update your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
            <Button className="gap-2">
              <Save size={16} />
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock size={20} />
              Security
            </CardTitle>
            <CardDescription>Manage your security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Change Password</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Update your password</p>
              </div>
              <Button variant="outline">Change</Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {preferences.twoFactor ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <Button
                variant={preferences.twoFactor ? 'default' : 'outline'}
                onClick={() => setPreferences({ ...preferences, twoFactor: !preferences.twoFactor })}
              >
                {preferences.twoFactor ? 'Disable' : 'Enable'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell size={20} />
              Notifications
            </CardTitle>
            <CardDescription>Manage how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Receive updates via email</p>
              </div>
              <div className="w-12 h-6 bg-gray-200 rounded-full cursor-pointer" />
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-2">
                <input type="checkbox" className="w-4 h-4" defaultChecked />
                <span className="text-sm">Request submitted notifications</span>
              </label>
              <label className="flex items-center gap-3 p-2">
                <input type="checkbox" className="w-4 h-4" defaultChecked />
                <span className="text-sm">Request approved notifications</span>
              </label>
              <label className="flex items-center gap-3 p-2">
                <input type="checkbox" className="w-4 h-4" defaultChecked />
                <span className="text-sm">Request rejected notifications</span>
              </label>
              <label className="flex items-center gap-3 p-2">
                <input type="checkbox" className="w-4 h-4" defaultChecked />
                <span className="text-sm">System alerts</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="destructive" className="w-full">
              Delete Account
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Once you delete your account, there is no going back. Please be certain.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
