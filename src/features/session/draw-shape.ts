import type { ShapeId } from "../../content/packs";
import type { ActorPose } from "./roll";

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  radius: number,
) {
  const r = Math.min(radius, size / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + size, y, x + size, y + size, r);
  ctx.arcTo(x + size, y + size, x, y + size, r);
  ctx.arcTo(x, y + size, x, y, r);
  ctx.arcTo(x, y, x + size, y, r);
  ctx.closePath();
}

function drawTriangle(ctx: CanvasRenderingContext2D, size: number) {
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.48);
  ctx.lineTo(size * 0.48, size * 0.42);
  ctx.lineTo(-size * 0.48, size * 0.42);
  ctx.closePath();
}

function drawStar(ctx: CanvasRenderingContext2D, size: number) {
  const outer = size * 0.48;
  const inner = size * 0.2;
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
}

function drawShapePath(ctx: CanvasRenderingContext2D, shapeId: ShapeId, size: number) {
  switch (shapeId) {
    case "circle":
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.48, 0, Math.PI * 2);
      ctx.closePath();
      break;
    case "triangle":
      drawTriangle(ctx, size);
      break;
    case "square":
      drawRoundedRect(ctx, -size * 0.42, -size * 0.42, size * 0.84, size * 0.16);
      break;
    case "star":
      drawStar(ctx, size);
      break;
    default: {
      const _exhaustive: never = shapeId;
      return _exhaustive;
    }
  }
}

function drawAnimalImage(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  size: number,
) {
  const sourceWidth =
    "naturalWidth" in image && typeof image.naturalWidth === "number"
      ? image.naturalWidth
      : "width" in image && typeof image.width === "number"
        ? image.width
        : size;
  const sourceHeight =
    "naturalHeight" in image && typeof image.naturalHeight === "number"
      ? image.naturalHeight
      : "height" in image && typeof image.height === "number"
        ? image.height
        : size;
  if (sourceWidth <= 0 || sourceHeight <= 0) {
    return;
  }

  const aspect = sourceWidth / sourceHeight;
  const box = size * 0.9;
  const width = aspect >= 1 ? box : box * aspect;
  const height = aspect >= 1 ? box / aspect : box;
  ctx.drawImage(image, -width / 2, -height / 2, width, height);
}

export type PaintSubject =
  | { kind: "shape"; shapeId: ShapeId; shapeColor: string }
  | { kind: "animal"; image: CanvasImageSource | null };

export function paintRollFrame(
  ctx: CanvasRenderingContext2D,
  options: {
    width: number;
    height: number;
    subject: PaintSubject;
    poses: readonly ActorPose[];
  },
) {
  const { width, height, subject, poses } = options;
  ctx.clearRect(0, 0, width, height);

  const minSide = Math.min(width, height);
  // Animals sit a touch smaller than filled shapes so silhouettes stay clear.
  const baseSize = minSide * (subject.kind === "animal" ? 0.42 : 0.48);

  for (const pose of poses) {
    // Pose x/y are normalized to the full scene stage (±1 ≈ edge).
    const cx = width * 0.5 + pose.x * (width * 0.5);
    const cy = height * 0.5 + pose.y * (height * 0.5);
    const size = baseSize * pose.scale;

    ctx.save();
    ctx.globalAlpha = pose.opacity;
    ctx.translate(cx, cy);
    ctx.rotate(pose.rotationRad);
    if (subject.kind === "shape") {
      drawShapePath(ctx, subject.shapeId, size);
      ctx.fillStyle = subject.shapeColor;
      ctx.fill();
    } else if (subject.image) {
      drawAnimalImage(ctx, subject.image, size);
    }
    ctx.restore();
  }
}
