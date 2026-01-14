"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera, Upload, X, RotateCcw, Loader2, PenLine, ImageIcon, Check } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

interface CameraCaptureProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (file: File, base64: string, expirationFile?: File, expirationBase64?: string) => Promise<void>;
  onAddManually?: () => void;
  twoStep?: boolean;
}

type ActiveSlot = "front" | "expiration";

export function CameraCapture({ open, onOpenChange, onCapture, onAddManually, twoStep = false }: CameraCaptureProps) {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Two-step state
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [expirationImage, setExpirationImage] = useState<string | null>(null);
  const [activeSlot, setActiveSlot] = useState<ActiveSlot>("front");
  const [cameraStarted, setCameraStarted] = useState(false);

  // Single-step state
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setCapturedImage(null);
    setFrontImage(null);
    setExpirationImage(null);
    setActiveSlot("front");
    setCameraStarted(false);
    setError(null);
    setIsProcessing(false);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setStream(mediaStream);
      setCameraStarted(true);
    } catch (err) {
      setError(t("camera.error"));
      console.error("Camera error:", err);
    }
  }, [t]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraStarted(false);
  }, [stream]);

  // Set video srcObject when stream is available
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Auto-start camera when dialog opens, cleanup when closes
  useEffect(() => {
    if (open && !stream && !frontImage && !capturedImage) {
      startCamera();
    }
    if (!open && stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (!open) {
      resetState();
    }
  }, [open, stream, frontImage, capturedImage, startCamera, resetState]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);

        if (twoStep) {
          if (activeSlot === "front") {
            setFrontImage(dataUrl);
            // Automatically move to expiration slot
            setActiveSlot("expiration");
          } else {
            setExpirationImage(dataUrl);
            // Both done, stop camera
            stopCamera();
          }
        } else {
          setCapturedImage(dataUrl);
          stopCamera();
        }
      }
    }
  }, [activeSlot, stopCamera, twoStep]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        if (twoStep) {
          if (activeSlot === "front") {
            setFrontImage(dataUrl);
            setActiveSlot("expiration");
          } else {
            setExpirationImage(dataUrl);
            stopCamera();
          }
        } else {
          setCapturedImage(dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
    event.target.value = "";
  }, [activeSlot, twoStep, stopCamera]);

  const retakeSlot = useCallback((slot: ActiveSlot) => {
    if (slot === "front") {
      setFrontImage(null);
    } else {
      setExpirationImage(null);
    }
    setActiveSlot(slot);
    if (!stream) {
      startCamera();
    }
  }, [stream, startCamera]);

  const skipExpiration = useCallback(() => {
    stopCamera();
  }, [stopCamera]);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      if (twoStep) {
        if (!frontImage) return;

        const frontResponse = await fetch(frontImage);
        const frontBlob = await frontResponse.blob();
        const frontFile = new File([frontBlob], `photo-front-${Date.now()}.jpg`, { type: "image/jpeg" });
        const frontBase64 = frontImage.split(",")[1];

        let expFile: File | undefined;
        let expBase64: string | undefined;

        if (expirationImage) {
          const expResponse = await fetch(expirationImage);
          const expBlob = await expResponse.blob();
          expFile = new File([expBlob], `photo-exp-${Date.now()}.jpg`, { type: "image/jpeg" });
          expBase64 = expirationImage.split(",")[1];
        }

        await onCapture(frontFile, frontBase64, expFile, expBase64);
      } else {
        if (!capturedImage) return;

        const response = await fetch(capturedImage);
        const blob = await response.blob();
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: "image/jpeg" });
        const base64 = capturedImage.split(",")[1];

        await onCapture(file, base64);
      }
      resetState();
      onOpenChange(false);
    } catch (err) {
      console.error("Error processing image:", err);
      setError(t("camera.processingError"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    resetState();
    onOpenChange(false);
  };

  const canSubmit = twoStep ? !!frontImage : !!capturedImage;
  const isCapturing = cameraStarted && stream;

  // Render two-step UI
  if (twoStep) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="h-[95dvh] max-h-[95dvh] w-[95vw] max-w-[95vw] sm:max-w-[500px] sm:h-auto sm:max-h-none flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>{t("camera.addItem")}</DialogTitle>
            <DialogDescription>
              {isCapturing
                ? (activeSlot === "front" ? t("camera.snapFront") : t("camera.snapExpiration"))
                : t("camera.twoStepDescription")
              }
            </DialogDescription>
          </DialogHeader>

          {/* Main capture area or thumbnails */}
          {isCapturing ? (
            // Full camera view when capturing
            <div className="flex-1 flex flex-col min-h-0 gap-3">
              <div className="relative flex-1 min-h-0 bg-black rounded-lg overflow-hidden flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="max-w-full max-h-full object-contain"
                />
                {/* Overlay showing which slot we're capturing */}
                <div className="absolute top-3 left-3 bg-black/60 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                  {activeSlot === "front" ? t("camera.frontLabel") : t("camera.expirationLabel")}
                  {activeSlot === "expiration" && <span className="text-xs ml-1 opacity-75">({t("camera.optional")})</span>}
                </div>

                {/* Large capture button overlaid on camera */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                  <button
                    onClick={capturePhoto}
                    className="w-20 h-20 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                  >
                    <div className="w-16 h-16 rounded-full bg-white border-4 border-gray-300" />
                  </button>
                </div>

                {/* Secondary actions */}
                <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    <Upload className="h-5 w-5" />
                  </button>
                  {activeSlot === "expiration" && (
                    <button
                      onClick={skipExpiration}
                      className="w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors text-xs font-medium"
                    >
                      {t("camera.skip")}
                    </button>
                  )}
                </div>
              </div>

              {/* Thumbnails below camera */}
              <div className="flex-shrink-0 grid grid-cols-2 gap-3">
                <div
                  className={`relative aspect-video rounded-lg overflow-hidden ${frontImage ? "ring-2 ring-green-500" : "border-2 border-dashed border-muted-foreground/30 bg-muted"}`}
                  onClick={() => frontImage && retakeSlot("front")}
                >
                  {frontImage ? (
                    <>
                      <img src={frontImage} alt="" className="w-full h-full object-cover" />
                      <div className="absolute top-1 right-1 bg-green-500 rounded-full p-0.5">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">{t("camera.frontLabel")}</span>
                    </div>
                  )}
                </div>
                <div
                  className={`relative aspect-video rounded-lg overflow-hidden ${expirationImage ? "ring-2 ring-green-500" : "border-2 border-dashed border-muted-foreground/30 bg-muted"}`}
                  onClick={() => expirationImage && retakeSlot("expiration")}
                >
                  {expirationImage ? (
                    <>
                      <img src={expirationImage} alt="" className="w-full h-full object-cover" />
                      <div className="absolute top-1 right-1 bg-green-500 rounded-full p-0.5">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">{t("camera.expirationLabel")}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : frontImage ? (
            // Review mode - show both thumbnails large
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">{t("camera.frontLabel")}</span>
                <div className="relative aspect-square bg-muted rounded-lg overflow-hidden border-2 border-green-500">
                  <img src={frontImage} alt="" className="w-full h-full object-cover" />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-2 right-2"
                    onClick={() => retakeSlot("front")}
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    {t("camera.retake")}
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">{t("camera.expirationLabel")} <span className="text-muted-foreground font-normal">({t("camera.optional")})</span></span>
                <div className={`relative aspect-square bg-muted rounded-lg overflow-hidden border-2 ${expirationImage ? "border-green-500" : "border-dashed border-muted-foreground/30"}`}>
                  {expirationImage ? (
                    <>
                      <img src={expirationImage} alt="" className="w-full h-full object-cover" />
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute bottom-2 right-2"
                        onClick={() => retakeSlot("expiration")}
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        {t("camera.retake")}
                      </Button>
                    </>
                  ) : (
                    <button
                      onClick={() => retakeSlot("expiration")}
                      className="w-full h-full flex flex-col items-center justify-center gap-2 hover:bg-muted-foreground/10 transition-colors"
                    >
                      <Camera className="h-8 w-8 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{t("camera.addExpiration")}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Initial state - prompt to start
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              {error ? (
                <p className="text-sm text-muted-foreground text-center px-4">{error}</p>
              ) : (
                <p className="text-sm text-muted-foreground">{t("camera.clickStartOrUpload")}</p>
              )}
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button onClick={startCamera} variant="outline">
                    <Camera className="mr-2 h-4 w-4" />
                    {t("camera.startCamera")}
                  </Button>
                  <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    {t("camera.upload")}
                  </Button>
                </div>
                {onAddManually && (
                  <Button onClick={onAddManually} variant="ghost" className="text-muted-foreground">
                    <PenLine className="mr-2 h-4 w-4" />
                    {t("camera.addManually")}
                  </Button>
                )}
              </div>
            </div>
          )}

          {error && isCapturing && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <canvas ref={canvasRef} className="hidden" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
          />

          <DialogFooter className="flex-shrink-0 flex flex-col gap-2">
            {isCapturing ? (
              // Capturing mode - simplified footer
              <div className="flex w-full justify-between items-center">
                {onAddManually && (
                  <Button variant="ghost" size="sm" onClick={onAddManually}>
                    <PenLine className="mr-1 h-4 w-4" />
                    {t("camera.addManually")}
                  </Button>
                )}
                <div className="flex-1" />
                <Button variant="outline" size="sm" onClick={handleClose}>
                  {t("common.cancel")}
                </Button>
              </div>
            ) : frontImage ? (
              // Review mode
              <>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleClose}>
                    <X className="mr-2 h-4 w-4" />
                    {t("common.cancel")}
                  </Button>
                  {onAddManually && (
                    <Button variant="ghost" onClick={onAddManually}>
                      <PenLine className="mr-2 h-4 w-4" />
                      {t("camera.addManually")}
                    </Button>
                  )}
                </div>
                <Button onClick={handleConfirm} disabled={!canSubmit || isProcessing}>
                  {isProcessing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {t("camera.saveItem")}
                </Button>
              </>
            ) : (
              // Initial state
              <Button variant="outline" onClick={handleClose}>
                <X className="mr-2 h-4 w-4" />
                {t("common.close")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Single-step UI (original behavior)
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="h-[95dvh] max-h-[95dvh] w-[95vw] max-w-[95vw] sm:max-w-[500px] sm:h-auto sm:max-h-none flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{t("camera.title")}</DialogTitle>
          <DialogDescription>
            {t("camera.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="relative flex-1 min-h-0 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
          {capturedImage ? (
            <img
              src={capturedImage}
              alt={t("camera.captured")}
              className="max-w-full max-h-full object-contain"
            />
          ) : stream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              {error ? (
                <p className="text-sm text-muted-foreground text-center px-4">{error}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("camera.clickStartOrUpload")}
                </p>
              )}
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button onClick={startCamera} variant="outline">
                    <Camera className="mr-2 h-4 w-4" />
                    {t("camera.startCamera")}
                  </Button>
                  <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    {t("camera.upload")}
                  </Button>
                </div>
                {onAddManually && (
                  <Button onClick={onAddManually} variant="ghost" className="text-muted-foreground">
                    <PenLine className="mr-2 h-4 w-4" />
                    {t("camera.addManually")}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />

        <DialogFooter className="flex-shrink-0 flex gap-2">
          {capturedImage ? (
            <>
              <Button variant="outline" onClick={() => { setCapturedImage(null); startCamera(); }} disabled={isProcessing}>
                <RotateCcw className="mr-2 h-4 w-4" />
                {t("camera.retake")}
              </Button>
              <Button onClick={handleConfirm} disabled={isProcessing}>
                {isProcessing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {t("camera.usePhoto")}
              </Button>
            </>
          ) : stream ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                {t("common.cancel")}
              </Button>
              <Button onClick={capturePhoto}>
                <Camera className="mr-2 h-4 w-4" />
                {t("camera.capture")}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={handleClose}>
              <X className="mr-2 h-4 w-4" />
              {t("common.close")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
