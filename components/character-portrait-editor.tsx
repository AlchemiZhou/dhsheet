"use client";
import { ImageUploadCrop } from "@/components/ui/image-upload-crop";
import { useSheetStore } from "@/lib/sheet-store";
import { applyCharacterImageAssetAction } from "@/character/storage/character-image-actions";
import { getActiveCharacterId } from "@/lib/multi-character-storage";

export function CharacterPortraitEditor({
  currentCharacterId,
}: {
  currentCharacterId?: string | null;
}) {
  const {
    sheetData: formData,
    setSheetData: setFormData,
    replaceSheetData,
  } = useSheetStore();
  const handlePortraitImageChange = async (imageBase64: string) => {
    if (!currentCharacterId) {
      setFormData((prev) => ({ ...prev, characterImage: imageBase64 }));
      return;
    }

    try {
      const currentSheet = useSheetStore.getState().sheetData;
      await applyCharacterImageAssetAction({
        characterId: currentCharacterId,
        role: "portrait",
        imageDataUrl: imageBase64,
        sheetData: currentSheet,
        getCurrentCharacterId: getActiveCharacterId,
        getCurrentSheetData: () => useSheetStore.getState().sheetData,
        replaceSheetData,
      });
    } catch (error) {
      console.error(
        `[CharacterImage] Failed to update portrait for ${currentCharacterId}:`,
        error,
      );
      alert("角色图像保存失败");
    }
  };

  return (
    <div className="native-portrait-editor">
      <h3>角色头像</h3>
      <ImageUploadCrop
        currentImage={formData.characterImage}
        onImageChange={(image) => void handlePortraitImageChange(image)}
        onImageDelete={() => void handlePortraitImageChange("")}
        width="45mm"
        height="45mm"
        placeholder={{ title: "角色头像", subtitle: "点击上传" }}
        inputId="character-image-upload"
      />
    </div>
  );
}
