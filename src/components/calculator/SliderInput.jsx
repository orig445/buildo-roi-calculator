export default function SliderInput({ label, value, min, max, step, onChange, format, icon, description }) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <div>
            <label className="text-sm font-semibold text-foreground">{label}</label>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        <div className="text-left">
          <span className="text-lg font-bold gold-text">{format(value)}</span>
        </div>
      </div>

      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="slider-thumb w-full"
          style={{
            background: `linear-gradient(to left, hsl(271 60% 55%) ${percentage}%, hsl(28 10% 22%) ${percentage}%)`
          }}
        />
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}