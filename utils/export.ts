import { WhiteboardElement } from "../types";

export const exportCanvasAsImage = async (elements: WhiteboardElement[]) => {
  // Create an off-screen canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Calculate bounding box of all elements to size canvas
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  if (elements.length === 0) {
    minX = 0; minY = 0; maxX = 800; maxY = 600;
  } else {
    elements.forEach(el => {
      minX = Math.min(minX, el.x);
      minY = Math.min(minY, el.y);
      maxX = Math.max(maxX, el.x + el.width);
      maxY = Math.max(maxY, el.y + el.height);
    });
  }

  // Add padding
  const padding = 50;
  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;
  
  const width = maxX - minX;
  const height = maxY - minY;

  canvas.width = width;
  canvas.height = height;

  // Fill background
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, width, height);

  // Draw dot pattern (simple approximation)
  ctx.fillStyle = '#cbd5e1';
  for (let x = 0; x < width; x += 20) {
    for (let y = 0; y < height; y += 20) {
      ctx.fillRect(x, y, 1, 1);
    }
  }

  // Draw elements
  // Note: This is a simplified renderer for demo purposes. 
  // Complex CSS (shadows, custom fonts, specific SVG paths) might not match 100%.
  elements.forEach(el => {
    const rx = el.x - minX;
    const ry = el.y - minY;
    
    ctx.save();
    ctx.translate(rx, ry);

    // Shape drawing
    ctx.lineWidth = el.strokeWidth;
    ctx.strokeStyle = el.strokeColor;
    ctx.fillStyle = el.backgroundColor;

    if (el.type === 'rectangle') {
      ctx.fillRect(0, 0, el.width, el.height);
      ctx.strokeRect(0, 0, el.width, el.height);
    } else if (el.type === 'circle') {
      ctx.beginPath();
      ctx.ellipse(el.width/2, el.height/2, el.width/2, el.height/2, 0, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    } else if (el.type === 'note') {
      ctx.shadowColor = "rgba(0,0,0,0.1)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 4;
      ctx.fillRect(0, 0, el.width, el.height);
      ctx.shadowColor = "transparent"; // Reset shadow
      
      // Text
      ctx.fillStyle = "#1f2937";
      ctx.font = '16px "Comic Sans MS", sans-serif';
      wrapText(ctx, el.text || "", 10, 30, el.width - 20, 24);

    } else if (el.type === 'text') {
       ctx.fillStyle = "#1f2937";
       ctx.font = 'bold 20px sans-serif';
       ctx.fillText(el.text || "Text", 10, el.height/2 + 5);
    } else if (el.type === 'triangle') {
        ctx.beginPath();
        ctx.moveTo(el.width / 2, 0);
        ctx.lineTo(el.width, el.height);
        ctx.lineTo(0, el.height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    } else if (el.type === 'arrow') {
        // Simplified arrow draw
        ctx.beginPath();
        ctx.moveTo(0, el.height);
        ctx.lineTo(el.width, 0);
        ctx.stroke();
        // Arrow head would go here
    } else if (el.type === 'cloud') {
         // Placeholder cloud
         ctx.beginPath();
         ctx.ellipse(el.width/2, el.height/2, el.width/2, el.height/3, 0, 0, 2*Math.PI);
         ctx.fill();
         ctx.stroke();
    }

    ctx.restore();
  });

  // Trigger download
  const link = document.createElement('a');
  link.download = `whiteboard-${Date.now()}.jpg`;
  link.href = canvas.toDataURL('image/jpeg', 0.9);
  link.click();
};

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    const words = text.split(' ');
    let line = '';

    for(let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      }
      else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
}
