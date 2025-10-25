import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PhoneOff, Mic, MicOff, Video as VideoIcon, VideoOff } from "lucide-react";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useEffect, useRef, useState } from "react";

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  callSessionId: string;
  localUserId: string;
  remoteUserId: string;
  remoteUserName: string;
  isInitiator?: boolean;
}

export const VideoCallModal = ({
  isOpen,
  onClose,
  callSessionId,
  localUserId,
  remoteUserId,
  remoteUserName,
  isInitiator,
}: VideoCallModalProps) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const { localStream, remoteStream, isConnecting, startLocalStream, createOffer, endCall } =
    useWebRTC({
      callSessionId,
      localUserId,
      remoteUserId,
      onCallEnded: onClose,
    });

  useEffect(() => {
    if (isOpen) {
      startLocalStream().then(() => {
        if (isInitiator) createOffer();
      });
    }
  }, [isOpen, isInitiator, startLocalStream, createOffer]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const toggleMute = () => {
    if (localStream) {
      const t = localStream.getAudioTracks()[0];
      t.enabled = !t.enabled;
      setIsMuted(!t.enabled);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const t = localStream.getVideoTracks()[0];
      t.enabled = !t.enabled;
      setIsVideoOff(!t.enabled);
    }
  };

  const handleEnd = () => {
    endCall();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[600px] p-0">
        <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <div className="absolute top-4 right-4 w-48 h-36 bg-black/40 rounded-lg overflow-hidden shadow-lg">
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          </div>

          {isConnecting && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/70 px-6 py-3 rounded-full text-white text-sm">
                Connecting to {remoteUserName}...
              </div>
            </div>
          )}

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
            <Button onClick={toggleMute} size="icon" variant={isMuted ? "destructive" : "secondary"} className="w-14 h-14 rounded-full">
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </Button>
            <Button onClick={handleEnd} size="icon" variant="destructive" className="w-14 h-14 rounded-full">
              <PhoneOff className="w-6 h-6" />
            </Button>
            <Button onClick={toggleVideo} size="icon" variant={isVideoOff ? "destructive" : "secondary"} className="w-14 h-14 rounded-full">
              {isVideoOff ? <VideoOff className="w-6 h-6" /> : <VideoIcon className="w-6 h-6" />}
            </Button>
          </div>

          <div className="absolute top-4 left-4 bg-black/70 px-4 py-2 rounded-full text-white text-sm font-medium">
            {remoteUserName}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
