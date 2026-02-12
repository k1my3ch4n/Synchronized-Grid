import { EditableValue } from "@shared/ui/EditableValue";

interface SizeInputProps {
  width: number;
  height: number;
  onSizeChange: (width: number, height: number) => void;
}

// todo : parseInt 제거
export function SizeInput({ width, height, onSizeChange }: SizeInputProps) {
  const handleWidthChange = (v: string) => {
    const parsed = parseInt(v);

    if (!isNaN(parsed) && parsed > 0) {
      onSizeChange(parsed, height);
    }
  };

  const handleHeightChange = (v: string) => {
    const parsed = parseInt(v);

    if (!isNaN(parsed) && parsed > 0) {
      onSizeChange(width, parsed);
    }
  };

  return (
    <span className="flex items-center gap-0.5">
      (
      <EditableValue
        value={String(width)}
        onValueChange={handleWidthChange}
        className="hover:underline cursor-pointer"
        inputClassName="w-14 px-0.5 text-sm text-center text-black win98-sunken"
      />
      ×
      <EditableValue
        value={String(height)}
        onValueChange={handleHeightChange}
        className="hover:underline cursor-pointer"
        inputClassName="w-14 px-0.5 text-sm text-center text-black win98-sunken"
      />
      )
    </span>
  );
}
