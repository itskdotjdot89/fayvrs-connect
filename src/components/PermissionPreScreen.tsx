import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Camera, Bell } from "lucide-react";

interface PermissionPreScreenProps {
  type: "location" | "camera" | "notifications";
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

const permissionContent = {
  location: {
    icon: MapPin,
    title: "Location Access",
    description: "Fayvrs uses your location to match you with nearby service providers and local favor requests.",
    bullets: [
      "Find service providers in your area",
      "Show your requests to nearby providers",
      "Get accurate distance estimates",
      "Enable location-based matching",
    ],
  },
  camera: {
    icon: Camera,
    title: "Camera & Photos Access",
    description: "Fayvrs needs access to your camera and photos for:",
    bullets: [
      "Upload profile photos",
      "Add photos to service requests",
      "Build provider portfolios",
      "Share work examples with clients",
    ],
  },
  notifications: {
    icon: Bell,
    title: "Push Notifications",
    description: "We use notifications to keep you updated about:",
    bullets: [
      "New service requests in your area",
      "Messages from other users",
      "Proposal updates and acceptances",
      "Booking status changes",
    ],
  },
};

export function PermissionPreScreen({
  type,
  isOpen,
  onClose,
  onContinue,
}: PermissionPreScreenProps) {
  const content = permissionContent[type];
  const Icon = content.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-center">{content.title}</DialogTitle>
          <DialogDescription className="text-center">
            {content.description}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          {content.bullets.map((bullet, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">{bullet}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <Button onClick={onContinue} className="w-full">
            Continue
          </Button>
          <Button variant="ghost" onClick={onClose} className="w-full">
            Not Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
