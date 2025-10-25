import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface WebRTCConfig {
  callSessionId: string;
  localUserId: string;
  remoteUserId: string;
  onRemoteStream?: (stream: MediaStream) => void;
  onCallEnded?: () => void;
}

export const useWebRTC = ({
  callSessionId,
  localUserId,
  remoteUserId,
  onRemoteStream,
  onCallEnded,
}: WebRTCConfig) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const peerConnection = useRef<RTCPeerConnection | null>(null);

  const iceServers: RTCConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  const initializePeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(iceServers);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        supabase.from("call_signals").insert({
          call_session_id: callSessionId,
          from_user_id: localUserId,
          to_user_id: remoteUserId,
          signal_type: "ice-candidate",
          signal_data: event.candidate.toJSON() as any,
        });
      }
    };

    pc.ontrack = (event) => {
      const stream = event.streams[0];
      setRemoteStream(stream);
      onRemoteStream?.(stream);
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") {
        setIsConnected(true);
        setIsConnecting(false);
      } else if (
        pc.connectionState === "disconnected" ||
        pc.connectionState === "failed" ||
        pc.connectionState === "closed"
      ) {
        setIsConnected(false);
        onCallEnded?.();
      }
    };

    peerConnection.current = pc;
    return pc;
  }, [callSessionId, localUserId, remoteUserId, onRemoteStream, onCallEnded]);

  const startLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);

      const pc = peerConnection.current || initializePeerConnection();
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      return stream;
    } catch (err) {
      setError("Failed to access camera/microphone");
      console.error("Media error:", err);
      return null;
    }
  }, [initializePeerConnection]);

  const createOffer = useCallback(async () => {
    setIsConnecting(true);
    const pc = peerConnection.current || initializePeerConnection();
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await supabase.from("call_signals").insert({
        call_session_id: callSessionId,
        from_user_id: localUserId,
        to_user_id: remoteUserId,
        signal_type: "offer",
        signal_data: offer as any,
      });
    } catch (err) {
      setError("Failed to create offer");
      console.error("Offer error:", err);
    }
  }, [callSessionId, localUserId, remoteUserId, initializePeerConnection]);

  const createAnswer = useCallback(
    async (offer: RTCSessionDescriptionInit) => {
      setIsConnecting(true);
      const pc = peerConnection.current || initializePeerConnection();
      try {
        await pc.setRemoteDescription(offer);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await supabase.from("call_signals").insert({
          call_session_id: callSessionId,
          from_user_id: localUserId,
          to_user_id: remoteUserId,
          signal_type: "answer",
          signal_data: answer as any,
        });
      } catch (err) {
        setError("Failed to create answer");
        console.error("Answer error:", err);
      }
    },
    [callSessionId, localUserId, remoteUserId, initializePeerConnection]
  );

  useEffect(() => {
    if (!callSessionId) return;
    const channel = supabase
      .channel(`call-signals:${callSessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "call_signals",
          filter: `to_user_id=eq.${localUserId}`,
        },
        async (payload) => {
          const { signal_type, signal_data } = payload.new as any;
          const pc = peerConnection.current || initializePeerConnection();
          try {
            if (signal_type === "offer") {
              await createAnswer(signal_data as RTCSessionDescriptionInit);
            } else if (signal_type === "answer") {
              await pc.setRemoteDescription(
                signal_data as RTCSessionDescriptionInit
              );
            } else if (signal_type === "ice-candidate") {
              await pc.addIceCandidate(new RTCIceCandidate(signal_data));
            }
          } catch (err) {
            console.error("Signal handling error:", err);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [callSessionId, localUserId, createAnswer, initializePeerConnection]);

  const endCall = useCallback(() => {
    localStream?.getTracks().forEach((t) => t.stop());
    peerConnection.current?.close();
    supabase
      .from("call_sessions")
      .update({ status: "ended", ended_at: new Date().toISOString() })
      .eq("id", callSessionId);
    setLocalStream(null);
    setRemoteStream(null);
    setIsConnected(false);
    setIsConnecting(false);
  }, [localStream, callSessionId]);

  return {
    localStream,
    remoteStream,
    isConnecting,
    isConnected,
    error,
    startLocalStream,
    createOffer,
    endCall,
  };
};
