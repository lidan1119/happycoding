export async function downloadTextImage(
  text: string,
  filename = "平行人生档案.png",
) {
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw Error("Canvas unavailable");
  const width = 600,
    pad = 36,
    lineHeight = 30;
  ctx.font = "18px sans-serif";
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    let line = "";
    for (const char of paragraph) {
      if (ctx.measureText(line + char).width > width - pad * 2) {
        lines.push(line);
        line = "";
      }
      line += char;
    }
    lines.push(line);
  }
  // Browsers cap canvas dimensions: adapt resolution for long choice journals.
  const height = pad * 2 + lines.length * lineHeight,
    scale = Math.min(2, 16000 / height);
  canvas.width = Math.ceil(width * scale);
  canvas.height = Math.ceil(height * scale);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#f8f5e9";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#222437";
  ctx.font = "18px sans-serif";
  ctx.textBaseline = "top";
  lines.forEach((line, i) => ctx.fillText(line, pad, pad + i * lineHeight));
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(Error("Export failed"))),
      "image/png",
    ),
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
