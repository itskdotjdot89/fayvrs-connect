import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface IncomingCallModalProps {
  isOpen: boolean;
  callerName: string;
  callerAvatar?: string;
  onAccept: () => void;
  onDecline: () => void;
}

export const IncomingCallModal = ({
  isOpen,
  callerName,
  callerAvatar,
  onAccept,
  onDecline,
}: IncomingCallModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onDecline}>
      <DialogContent className="max-w-sm">
        <div className="flex flex-col items-center gap-6 py-6">
          <Avatar className="w-24 h-24">
            <AvatarImage src={callerAvatar} />
            <AvatarFallback className="bg-primary text-white text-2xl">
              {callerName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="text-center">
            <h3 className="text-xl font-semibold">{callerName}</h3>
            <p className="text-muted-foreground mt-1">Incoming video call...</p>
          </div>

          <div className="flex gap-4">
            <Button onClick={onDecline} size="lg" variant="destructive" className="rounded-full w-16 h-16">
              <PhoneOff className="w-6 h-6" />
            </Button>
            <Button onClick={onAccept} size="lg" className="rounded-full w-16 h-16 bg-green-500 hover:bg-green-600">
              <Phone className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
