import * as SliderPrimitive from "@radix-ui/react-slider";

export default function VintageSlider({ value, min, max, step, onChange, accent = "var(--gold)" }) {
  return (
    <SliderPrimitive.Root
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={([v]) => onChange(v)}
      dir="rtl"
      style={{
        position: "relative", display: "flex", alignItems: "center",
        userSelect: "none", width: "100%", height: 24,
      }}
    >
      <SliderPrimitive.Track
        style={{
          position: "relative", flexGrow: 1, borderRadius: 9999,
          height: 4, background: "rgba(196,150,42,0.15)",
        }}
      >
        <SliderPrimitive.Range
          style={{
            position: "absolute", background: accent,
            borderRadius: 9999, height: "100%",
          }}
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        style={{
          display: "block", width: 22, height: 22, borderRadius: "50%",
          background: "var(--cream)", border: `2px solid ${accent}`,
          boxShadow: `0 0 0 4px ${accent}22, 0 2px 8px rgba(26,18,8,0.15)`,
          cursor: "grab", outline: "none", transition: "box-shadow 0.2s",
        }}
      />
    </SliderPrimitive.Root>
  );
}