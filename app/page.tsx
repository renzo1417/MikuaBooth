"use client";

import React, { useState } from "react";
import { AnalogGrain } from "@/components/AnalogGrain";
import { StartScreen } from "@/components/StartScreen";
import { TemplateBrowser } from "@/components/TemplateBrowser";
import { CaptureScreen, CapturedShotItem } from "@/components/CaptureScreen";
import { SlotEditor } from "@/components/SlotEditor";
import { FinishScreen } from "@/components/FinishScreen";
import { useCameraCapture } from "@/hooks/useCameraCapture";
import { FRAME_TEMPLATES, FrameTemplate } from "@/lib/templates";
import { StickerItem } from "@/lib/stickers";
import { CardCaption } from "@/hooks/useKioskCanvasExport";
import { MascotProvider } from "@/context/MascotContext";
import { MascotWidget } from "@/components/MascotWidget";

type BoothScreen = "start" | "browse" | "capture" | "editor" | "finish";

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<BoothScreen>("start");
  const [selectedTemplate, setSelectedTemplate] = useState<FrameTemplate>(
    FRAME_TEMPLATES[3] || FRAME_TEMPLATES[0]
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
    color: "#17140F",
    bgColor: "#FFFFFF",
  });

  const camera = useCameraCapture();

  // 1. From Start Screen -> Go to Template Browser
  const handleStartBooth = () => {
    camera.setDemoMode(false);
    setCurrentScreen("browse");
  };

  const handleTryDemo = () => {
    camera.setDemoMode(true);
    setCurrentScreen("browse");
  };

  // 2. From Template Browser -> Select Template & Proceed to Capture
  const handleSelectTemplate = (template: FrameTemplate) => {
    setSelectedTemplate(template);
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
    setCurrentScreen("browse");
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
      color: "#17140F",
      bgColor: "#FFFFFF",
    });
    setCurrentScreen("browse");
  };

  return (
    <MascotProvider>
      <div className="relative min-h-[100dvh] w-full bg-[#F6F1E7] text-[#17140F] selection:bg-[#FF6B4A] selection:text-white">
        {/* Subtle Analog Grain Overlay */}
        <AnalogGrain />

        {/* Mascot Companion ("Blip") */}
        <MascotWidget />

        {/* Screen 1: Start Screen */}
        {currentScreen === "start" && (
          <StartScreen
            onStart={handleStartBooth}
            onTryDemo={handleTryDemo}
          />
        )}

        {/* Screen 2: Template & Category Browser */}
        {currentScreen === "browse" && (
          <TemplateBrowser
            onSelectTemplate={handleSelectTemplate}
            onBack={handleBackToStart}
          />
        )}

        {/* Screen 3: Capture Screen (Dynamic Slots 3, 4, 8, 16) */}
        {currentScreen === "capture" && (
          <CaptureScreen
            camera={camera}
            totalSlots={selectedTemplate.slotCount}
            templateName={selectedTemplate.name}
            onComplete={handleCaptureComplete}
            onCancel={handleCancelCapture}
            isDemoMode={camera.isDemoMode}
          />
        )}

        {/* Screen 4: Slot-Based Editor */}
        {currentScreen === "editor" && (
          <SlotEditor
            template={selectedTemplate}
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
    </MascotProvider>
  );
}

