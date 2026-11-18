import { downloadCharacterFile } from "./download-character-file";
import { characterExportTitle } from "@/character/storage/export-title";
import { prepareSheetForExport } from "@/character/storage/sheet-image-projection";
import type { SheetData } from "./sheet-data";

// 导出角色数据为JSON文件
export async function exportCharacterData(formData: SheetData): Promise<void> {
  try {
    if (!formData) {
      alert("没有可导出的角色数据");
      return;
    }

    const exportFileDefaultName = characterExportTitle(formData) + '.json';
    const portableData = await prepareSheetForExport(formData);
    const dataStr = JSON.stringify(portableData, null, 2);
    downloadCharacterFile(new Blob([dataStr], { type: 'application/json;charset=utf-8' }), exportFileDefaultName)
  } catch (error) {
    console.error("导出角色数据失败:", error)
    alert("导出角色数据失败")
  }
}

// Function to generate a printable name for the PDF
export function generatePrintableName(formData: SheetData): string {
  const now = new Date()
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`

  const characterName = formData.name || "UnnamedCharacter"
  // Use professionRef.name directly for a more user-friendly filename
  const professionName = formData.professionRef?.name || "NoProfession"

  return `DH_${characterName}_${professionName}_${dateStr}.pdf`
}
