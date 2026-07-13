import type { ShapeId } from "../../content/packs";
import { type FaceExpression, faceInkColor } from "./face";
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
  image: HTMLImageElement,
  size: number,
) {
  if (image.naturalWidth <= 0 || image.naturalHeight <= 0) {
    return;
  }

  const aspect = image.naturalWidth / image.naturalHeight;
  const box = size * 0.9;
  const width = aspect >= 1 ? box : box * aspect;
  const height = aspect >= 1 ? box / aspect : box;
  ctx.drawImage(image, -width / 2, -height / 2, width, height);
}

/** Triangle apex is “head”; nudge the face slightly upward. */
function faceOriginY(shapeId: ShapeId, size: number): number {
  return shapeId === "triangle" ? -size * 0.06 : 0;
}

function drawFace(
  ctx: CanvasRenderingContext2D,
  shapeId: ShapeId,
  size: number,
  face: FaceExpression,
  ink: string,
) {
  const originY = faceOriginY(shapeId, size);
  const eyeR = size * face.eyeRadius;
  const eyeX = size * face.eyeSpread;
  const eyeY = originY + size * face.eyeY;
  const mouthY = originY + size * face.mouthY;
  const mouthW = size * face.mouthWidth;

  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.ellipse(-eyeX, eyeY, eyeR, eyeR * 1.05, 0, 0, Math.PI * 2);
  ctx.ellipse(eyeX, eyeY, eyeR, eyeR * 1.05, 0, 0, Math.PI * 2);
  ctx.fill();

  const smileAlpha = 1 - face.mouthOpen;
  if (smileAlpha > 0.02) {
    const radius = size * face.mouthCurve * 0.85 + mouthW * 0.35;
    ctx.save();
    ctx.globalAlpha *= smileAlpha;
    ctx.strokeStyle = ink;
    ctx.lineWidth = Math.max(2, size * 0.028);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(0, mouthY - radius * 0.15, radius, Math.PI * 0.15, Math.PI * 0.85, false);
    ctx.stroke();
    ctx.restore();
  }

  if (face.mouthOpen > 0.02) {
    const rx = mouthW * (0.45 + 0.25 * face.mouthOpen);
    const ry = size * (0.035 + 0.055 * face.mouthOpen);
    ctx.save();
    ctx.globalAlpha *= face.mouthOpen;
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.ellipse(0, mouthY, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export type PaintSubject =
  | { kind: "shape"; shapeId: ShapeId; shapeColor: string; face: FaceExpression }
  | { kind: "animal"; image: HTMLImageElement | null };

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
      drawFace(
        ctx,
        subject.shapeId,
        size,
        subject.face,
        faceInkColor(subject.shapeColor),
      );
    } else if (subject.image) {
      drawAnimalImage(ctx, subject.image, size);
    }
    ctx.restore();
  }
}
