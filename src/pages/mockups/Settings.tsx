import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Bell, 
  Mail, 
  MessageSquare, 
  Shield, 
  FileText, 
  HelpCircle,
  LogOut,
  ChevronRight
} from "lucide-react";

export default function Settings() {
  return (
    <div className="min-h-screen bg-surface pb-8">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">Settings</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Notifications Section */}
        <div className="bg-white rounded-card p-5 shadow-soft space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notifications
          </h3>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <Label htmlFor="push" className="text-sm font-medium cursor-pointer">
                    Push Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">Get notified about new replies</p>
                </div>
              </div>
              <Switch id="push" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <Label htmlFor="sms" className="text-sm font-medium cursor-pointer">
                    SMS Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">Receive text messages</p>
                </div>
              </div>
              <Switch id="sms" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-medium cursor-pointer">
                    Email Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">Updates via email</p>
                </div>
              </div>
              <Switch id="email" defaultChecked />
            </div>
          </div>
        </div>

        {/* Account & Legal Section */}
        <div className="bg-white rounded-card shadow-soft divide-y divide-border">
          <button className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">Privacy Policy</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>

          <button className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">Terms of Service</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>

          <button className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">Help & Support</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Logout Button */}
        <Button 
          variant="outline" 
          className="w-full h-12 rounded-xl border-2 border-destructive/20 text-destructive hover:bg-destructive hover:text-white"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Log Out
        </Button>

        {/* App Version */}
        <div className="text-center pt-4">
          <p className="text-sm text-muted-foreground">Fayvrs v1.0</p>
        </div>
      </div>
    </div>
  );
}