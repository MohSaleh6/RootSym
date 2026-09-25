import Image from "next/image";

/**
 * The RootSym emblem, with its gears turning.
 *
 * Built from Rand's artwork, not a redrawing of it. The emblem is split into a
 * static base and one layer per gear, each cut from the original pixels and
 * centred on its own axle, so it turns in place without wobbling. Positions
 * below are percentages of the emblem square, measured from the source art.
 *
 * Two gears are rebuilt from one of their own teeth, because the drawing
 * leaves them incomplete: the big gear is only ever drawn as its top half, and
 * the top gear's lower teeth are cut away where the big gear bites into its
 * disc. Each keeps the look of the original — the big gear still shows only its
 * top half through a fixed window, and the top gear is masked to its disc, so
 * its teeth vanish into the notch exactly as drawn.
 *
 * The big gear and the upper-left gear mesh. Their periods follow their tooth
 * counts (16 and 8), and they turn in opposite directions, so a tooth always
 * meets a gap. The upper-left gear's starting angle was searched to keep the
 * two apart through a whole cycle, and it sits behind the big gear so what
 * little overlap remains reads as depth rather than collision.
 */

type Spin = { kind: "spin"; seconds: number; reverse: boolean };
type Rock = { kind: "rock"; seconds: number };
type Layer = {
  src: string;
  box: { left: number; top: number; size: number };
  motion?: Spin | Rock;
  /** Percent of the layer's height hidden from the bottom — the big gear's window. */
  clipBottom?: number;
  /** A static outline the moving layer is only visible inside. */
  mask?: string;
};

const FULL = { left: 0, top: 0, size: 100 };

// Bottom to top.
const LAYERS: Layer[] = [
  {
    src: "gear-upper-left",
    box: { left: 22.4434, top: 15.6462, size: 17.9245 },
    motion: { kind: "spin", seconds: 16, reverse: true },
  },
  {
    src: "gear-big",
    box: { left: 35.4245, top: 17.1698, size: 31.1321 },
    motion: { kind: "spin", seconds: 32, reverse: false },
    clipBottom: 47.4242,
  },
  { src: "disc", box: FULL },
  {
    src: "gear-top",
    box: { left: 43.8208, top: 6.1509, size: 13.2075 },
    motion: { kind: "spin", seconds: 16, reverse: true },
    mask: "gear-top-mask",
  },
  {
    src: "gear-far-left",
    box: { left: 12.5236, top: 37.1698, size: 15.566 },
    motion: { kind: "spin", seconds: 20, reverse: false },
  },
  {
    src: "gear-inner",
    box: { left: 42.8774, top: 24.8585, size: 16.0377 },
    motion: { kind: "rock", seconds: 9 },
  },
  { src: "base", box: FULL },
];

const path = (name: string) => `/brand/mark/${name}.webp`;

function motionStyle(motion: Layer["motion"]): React.CSSProperties | undefined {
  if (!motion) return undefined;
  if (motion.kind === "spin") {
    return {
      animationDuration: `${motion.seconds}s`,
      animationDirection: motion.reverse ? "reverse" : "normal",
    };
  }
  // A quarter-period head start puts the swing through its rest angle at t=0,
  // so the emblem opens on the drawing, not mid-swing.
  return { animationDuration: `${motion.seconds}s`, animationDelay: `-${motion.seconds / 4}s` };
}

export function LogoMark({
  className = "h-10 w-10",
  animated = true,
  tone = "dark",
}: {
  className?: string;
  animated?: boolean;
  /** "dark" = for light backgrounds (sits on its navy badge), "light" = for dark backgrounds */
  tone?: "dark" | "light";
}) {
  const onLight = tone === "dark";

  return (
    <span role="img" aria-label="RootSym" className={`relative inline-block shrink-0 ${className}`}>
      {onLight && (
        <span className="absolute inset-0 rounded-full bg-[#0a2236] shadow-[inset_0_0_0_1px_rgba(201,162,39,.35)]" />
      )}

      <span className={`absolute ${onLight ? "inset-[7%]" : "inset-[2%]"}`}>
        {LAYERS.map((layer) => {
          const { left, top, size } = layer.box;
          const maskUrl = layer.mask ? `url(${path(layer.mask)})` : undefined;
          const moving = animated && layer.motion;
          return (
            <span
              key={layer.src}
              className="absolute"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: `${size}%`,
                height: `${size}%`,
                clipPath: layer.clipBottom ? `inset(0 0 ${layer.clipBottom}% 0)` : undefined,
                maskImage: maskUrl,
                WebkitMaskImage: maskUrl,
                maskSize: maskUrl ? "100% 100%" : undefined,
                WebkitMaskSize: maskUrl ? "100% 100%" : undefined,
              }}
            >
              <Image
                src={path(layer.src)}
                alt=""
                width={640}
                height={640}
                unoptimized
                loading="eager"
                draggable={false}
                className={`block h-full w-full select-none ${
                  moving ? (layer.motion!.kind === "spin" ? "rs-turn" : "rs-rock") : ""
                }`}
                style={moving ? motionStyle(layer.motion) : undefined}
              />
            </span>
          );
        })}
      </span>
    </span>
  );
}

export function LogoLockup({
  className = "",
  markClass = "h-11 w-11",
  stacked = true,
  tone = "dark",
}: {
  className?: string;
  markClass?: string;
  stacked?: boolean;
  tone?: "dark" | "light";
}) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <LogoMark className={markClass} tone={tone} />
      <span className={stacked ? "flex flex-col leading-none" : "flex items-baseline gap-2"}>
        <span className="font-display text-[1.45rem] font-bold tracking-tight">RootSym</span>
        <span className="mt-1 text-[0.58rem] font-semibold uppercase tracking-[0.3em] text-gold">
          By Rand Saleh
        </span>
      </span>
    </span>
  );
}
