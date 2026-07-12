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

export function paintRollFrame(
  ctx: CanvasRenderingContext2D,
  options: {
    width: number;
    height: number;
    shapeId: ShapeId;
    shapeColor: string;
    poses: readonly ActorPose[];
  },
) {
  const { width, height, shapeId, shapeColor, poses } = options;
  ctx.clearRect(0, 0, width, height);

  const minSide = Math.min(width, height);
  const baseSize = minSide * 0.58;

  for (const pose of poses) {
    const cx = width * 0.5 + pose.x * minSide * 0.5;
    const cy = height * 0.5 + pose.y * minSide * 0.5;
    const size = baseSize * pose.scale;

    ctx.save();
    ctx.globalAlpha = pose.opacity;
    ctx.translate(cx, cy);
    ctx.rotate(pose.rotationRad);
    ctx.shadowColor = "rgb(0 0 0 / 28%)";
    ctx.shadowBlur = size * 0.08;
    ctx.shadowOffsetY = size * 0.06;
    drawShapePath(ctx, shapeId, size);
    ctx.fillStyle = shapeColor;
    ctx.fill();
    ctx.restore();
  }
}
