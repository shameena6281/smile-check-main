import { useRef, useState, useCallback } from "react";
import AppLayout from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { ScanFace, Camera, CameraOff, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function FaceScan() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{ name: string; department: string; status: string; confidence: number } | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640, height: 480 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setStreaming(true);
      setResult(null);
    } catch {
      toast.error("Unable to access camera. Please grant permission.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setStreaming(false);
  }, []);

  const captureAndScan = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setScanning(true);
    setResult(null);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 640;
    canvas.height = 480;
    ctx.drawImage(videoRef.current, 0, 0, 640, 480);

    const imageData = canvas.toDataURL("image/jpeg", 0.8);

    try {
      const { data, error } = await supabase.functions.invoke("face-recognition", {
        body: { image: imageData },
      });

      if (error) throw error;

      if (data?.recognized) {
        setResult({
          name: data.employee_name,
          department: data.department,
          status: data.status,
          confidence: data.confidence,
        });
        toast.success(`${data.employee_name} checked in successfully!`);
      } else {
        setResult({ name: "Unknown", department: "", status: "not_recognized", confidence: 0 });
        toast.error(data?.message || "Face not recognized");
      }
    } catch (err: any) {
      toast.error(err.message || "Scan failed");
    } finally {
      setScanning(false);
    }
  }, []);

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl space-y-8 fade-in">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Face Scan</h1>
          <p className="text-muted-foreground mt-1">Position face in the frame and scan</p>
        </div>

        {/* Camera viewport */}
        <div className="relative mx-auto aspect-[4/3] max-w-lg overflow-hidden rounded-2xl border-2 border-border bg-card">
          <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
          <canvas ref={canvasRef} className="hidden" />

          {/* Scan overlay */}
          {streaming && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Corner brackets */}
              <div className="absolute top-6 left-6 h-16 w-16 border-t-2 border-l-2 border-primary rounded-tl-lg" />
              <div className="absolute top-6 right-6 h-16 w-16 border-t-2 border-r-2 border-primary rounded-tr-lg" />
              <div className="absolute bottom-6 left-6 h-16 w-16 border-b-2 border-l-2 border-primary rounded-bl-lg" />
              <div className="absolute bottom-6 right-6 h-16 w-16 border-b-2 border-r-2 border-primary rounded-br-lg" />

              {/* Scan line */}
              {scanning && (
                <div className="absolute inset-x-6 h-0.5 gradient-primary scan-line" />
              )}
            </div>
          )}

          {/* Placeholder when camera off */}
          {!streaming && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-card">
              <ScanFace className="h-20 w-20 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground text-sm">Camera is off</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          {!streaming ? (
            <Button onClick={startCamera} size="lg" className="gradient-primary text-primary-foreground glow-primary hover:opacity-90 gap-2">
              <Camera className="h-5 w-5" /> Start Camera
            </Button>
          ) : (
            <>
              <Button onClick={stopCamera} variant="outline" size="lg" className="border-border gap-2">
                <CameraOff className="h-5 w-5" /> Stop
              </Button>
              <Button onClick={captureAndScan} disabled={scanning} size="lg" className="gradient-primary text-primary-foreground glow-primary hover:opacity-90 gap-2">
                {scanning ? <Loader2 className="h-5 w-5 animate-spin" /> : <ScanFace className="h-5 w-5" />}
                {scanning ? "Scanning..." : "Scan Face"}
              </Button>
            </>
          )}
        </div>

        {/* Result */}
        {result && (
          <div className={`mx-auto max-w-lg rounded-xl border p-6 slide-up ${
            result.status === "not_recognized"
              ? "border-destructive/30 bg-destructive/5"
              : "border-primary/30 bg-primary/5"
          }`}>
            <div className="flex items-center gap-4">
              {result.status === "not_recognized" ? (
                <XCircle className="h-10 w-10 text-destructive" />
              ) : (
                <CheckCircle className="h-10 w-10 text-primary" />
              )}
              <div>
                <p className="text-lg font-semibold text-foreground">{result.name}</p>
                {result.department && <p className="text-sm text-muted-foreground">{result.department}</p>}
                {result.confidence > 0 && (
                  <p className="text-xs font-mono text-primary mt-1">
                    Confidence: {(result.confidence * 100).toFixed(1)}%
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
