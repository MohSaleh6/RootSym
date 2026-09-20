"use client";

import {
  Target,
  Cog,
  Sprout,
  Gauge,
  Layers,
  ShieldCheck,
  Compass,
  FlaskConical,
  GitBranch,
  LineChart,
  Workflow,
  Wrench,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  target: Target,
  cog: Cog,
  sprout: Sprout,
  gauge: Gauge,
  layers: Layers,
  shield: ShieldCheck,
  compass: Compass,
  flask: FlaskConical,
  branch: GitBranch,
  chart: LineChart,
  workflow: Workflow,
  wrench: Wrench,
};

export const ICON_KEYS = Object.keys(MAP);

export default function CourseIcon({
  name,
  className = "h-6 w-6",
  strokeWidth = 1.5,
  style,
}: {
  name: string;
  className?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}) {
  const Icon = MAP[name] ?? Target;
  return <Icon className={className} strokeWidth={strokeWidth} style={style} />;
}
