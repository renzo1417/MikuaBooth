"use client";

import React, { useState } from "react";
import { AnalogGrain } from "@/components/AnalogGrain";
import { StartScreen } from "@/components/StartScreen";
import { FormatSelector } from "@/components/FormatSelector";
import { CaptureScreen, CapturedShotItem } from "@/components/CaptureScreen";
import { SlotEditor } from "@/components/SlotEditor";
import { FinishScreen } from "@/components/FinishScreen";
import { useCameraCapture } from "@/hooks/useCameraCapture";
import {
  FRAME_TEMPLATES,
  FrameTemplate,
  BOOTH_FORMATS,
  BoothFormat,
  getDefaultTemplateForFormat,
} from "@/lib/templates";
import { StickerItem } from "@/lib/stickers";
import { CardCaption } from "@/hooks/useKioskCanvasExport";

type BoothScreen = "start" | "format" | "capture" | "editor" | "finish";

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<BoothScreen>("start");
  const [, setSelectedFormat] = useState<BoothFormat>(BOOTH_FORMATS[0]);
  const [selectedTemplate, setSelectedTemplate] = useState<FrameTemplate>(
    FRAME_TEMPLATES[0]
  );

  // Photos pool: photoId -> dataUrl
  const [photos, setPhotos] = useState<Record<string, string>>({});

  // Slot assignment: slotIndex -> photoId
  const [slotMap, setSlotMap] = useState<Record<number, string>>({});

  // Non-destructive filter state
  const [globalFilterId, setGlobalFilterId] = useState<string>("none");
  const [photoFilters, setPhotoFilters] = useState<Record<string, string>>({});

  // Sticker state: array of { id, type, x, y, rotation, scale, color }
  const [stickers, setStickers] = useState<StickerItem[]>([]);

  // Card caption state
  const [caption, setCaption] = useState<CardCaption>({
    enabled: false,
    text: "",
    color: "#1E1B18",
    bgColor: "#FFFFFF",
  });

  const camera = useCameraCapture();

  // 1. From Start Screen -> Go to Format Selector
  const handleStartBooth = () => {
    camera.setDemoMode(false);
    setCurrentScreen("format");
  };

  const handleTryDemo = () => {
    camera.setDemoMode(true);
    setCurrentScreen("format");
  };

  // 2. From Format Selector -> Select Format & Proceed directly to Capture
  const handleSelectFormat = (format: BoothFormat) => {
    setSelectedFormat(format);
    const templateForFormat = getDefaultTemplateForFormat(format);
    setSelectedTemplate(templateForFormat);
    setCurrentScreen("capture");
  };

  const handleBackToStart = () => {
    camera.stopCamera();
    setCurrentScreen("start");
  };

  // 3. From Capture Screen -> Populate Photos and Initial Slot Map in Capture Order
  const handleCaptureComplete = (shots: CapturedShotItem[]) => {
    const newPhotos: Record<string, string> = { ...photos };
    const newSlotMap: Record<number, string> = {};
    const newPhotoFilters: Record<string, string> = { ...photoFilters };

    shots.forEach((shot, idx) => {
      newPhotos[shot.id] = shot.dataUrl;
      newSlotMap[idx] = shot.id;
      if (shot.filterId && shot.filterId !== "none") {
        newPhotoFilters[shot.id] = shot.filterId;
      }
    });

    setPhotos(newPhotos);
    setSlotMap(newSlotMap);
    setPhotoFilters(newPhotoFilters);
    camera.stopCamera();
    setCurrentScreen("editor");
  };

  const handleCancelCapture = () => {
    camera.stopCamera();
    setCurrentScreen("format");
  };

  // 4. In Slot Editor -> Adding Retaken Single Photo
  const handleAddNewPhoto = (newPhoto: CapturedShotItem) => {
    setPhotos((prev) => ({ ...prev, [newPhoto.id]: newPhoto.dataUrl }));
    if (newPhoto.filterId && newPhoto.filterId !== "none") {
      setPhotoFilters((prev) => ({ ...prev, [newPhoto.id]: newPhoto.filterId }));
    }
  };

  const handleUpdatePhotoFilter = (photoId: string, filterId: string) => {
    setPhotoFilters((prev) => ({ ...prev, [photoId]: filterId }));
  };

  // 5. Navigation Between Editor and Finish
  const handleProceedToFinish = () => {
    setCurrentScreen("finish");
  };

  const handleBackToCapture = () => {
    setCurrentScreen("capture");
  };

  const handleEditAgain = () => {
    setCurrentScreen("editor");
  };

  const handleStartOver = () => {
    setPhotos({});
    setSlotMap({});
    setPhotoFilters({});
    setStickers([]);
    setGlobalFilterId("none");
    setCaption({
      enabled: false,
      text: "",
      color: "#1E1B18",
      bgColor: "#FFFFFF",
    });
    setCurrentScreen("start");
  };

  return (
    <div className="relative min-h-[100dvh] w-full bg-[#F6F1E7] text-[#1E1B18] selection:bg-[#E1503A] selection:text-white">
      {/* Subtle Analog Grain Overlay */}
      <AnalogGrain />

      {/* Screen 1: Promotional Editorial Landing Page */}
      {currentScreen === "start" && (
        <StartScreen
          onStart={handleStartBooth}
          onTryDemo={handleTryDemo}
        />
      )}

      {/* Screen 2: Shot Count & Format Selector */}
      {currentScreen === "format" && (
        <FormatSelector
          onSelectFormat={handleSelectFormat}
          onBack={handleBackToStart}
          isDemoMode={camera.isDemoMode}
        />
      )}

      {/* Screen 3: Multi-Slot Sequential 1-by-1 Capture */}
      {currentScreen === "capture" && (
        <CaptureScreen
          camera={camera}
          template={selectedTemplate}
          onComplete={handleCaptureComplete}
          onCancel={handleCancelCapture}
          isDemoMode={camera.isDemoMode}
        />
      )}

      {/* Screen 4: Post-Capture Card Design Studio (Workbench) */}
      {currentScreen === "editor" && (
        <SlotEditor
          template={selectedTemplate}
          onUpdateTemplate={setSelectedTemplate}
          photos={photos}
          slotMap={slotMap}
          camera={camera}
          isDemoMode={camera.isDemoMode}
          onUpdateSlotMap={setSlotMap}
          onAddNewPhoto={handleAddNewPhoto}
          globalFilterId={globalFilterId}
          onChangeGlobalFilter={setGlobalFilterId}
          photoFilters={photoFilters}
          onChangePhotoFilter={handleUpdatePhotoFilter}
          stickers={stickers}
          onChangeStickers={setStickers}
          caption={caption}
          onChangeCaption={setCaption}
          onProceedToFinish={handleProceedToFinish}
          onBackToCapture={handleBackToCapture}
        />
      )}

      {/* Screen 5: Finish & Download Keepsake Card */}
      {currentScreen === "finish" && (
        <FinishScreen
          template={selectedTemplate}
          photos={photos}
          slotMap={slotMap}
          globalFilterId={globalFilterId}
          photoFilters={photoFilters}
          stickers={stickers}
          caption={caption}
          onEditAgain={handleEditAgain}
          onStartOver={handleStartOver}
        />
      )}
    </div>
  );
}
