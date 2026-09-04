/**
 * Ghép chữ (đường dẫn + tên điểm quét) + ảnh mã QR thành 1 ảnh DUY NHẤT để tải về — để khi in/dán
 * ra thực tế, người xem biết ngay mã này ở đâu mà không cần thêm ngữ cảnh nào khác. Bố cục y hệt
 * khung xem trước trong popup: đường dẫn nhỏ màu xám phía trên, tên to đậm bên dưới, rồi tới mã QR
 * nằm trong khung nền xám nhạt. Tách thành hàm dùng chung ở đây để sau này nếu làm thêm tính năng
 * xuất/in nhiều mã QR cùng lúc thì gọi lại ngay, không phải viết lại.
 */

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Không tải được ảnh QR để ghép nhãn"));
    img.src = src;
  });
}

export async function buildQrLabelImage(opts: {
  path: string;
  name: string;
  qrDataUrl: string;
}): Promise<string> {
  const { path, name, qrDataUrl } = opts;
  const qrImg = await loadImage(qrDataUrl);
  const qrSize = qrImg.width || 480;

  const paddingX = 48;
  const paddingTop = 44;
  const paddingBottom = 44;
  const pathFontSize = 22;
  const nameFontSize = 42;
  const gapAfterPath = 12;
  const gapAfterName = 28;
  const boxPadding = 24;
  const qrBoxSize = qrSize + boxPadding * 2;

  const canvasWidth = qrBoxSize + paddingX * 2;
  const pathBlockHeight = path ? pathFontSize + 14 : 0;
  const nameBlockHeight = nameFontSize + 14;
  const canvasHeight =
    paddingTop + pathBlockHeight + (path ? gapAfterPath : 0) + nameBlockHeight + gapAfterName + qrBoxSize + paddingBottom;

  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Không khởi tạo được canvas để ghép ảnh QR");

  const drawRoundedRect = (x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    if (typeof (ctx as any).roundRect === "function") {
      (ctx as any).roundRect(x, y, w, h, r);
    } else {
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
    }
    ctx.closePath();
  };

  // Nền trắng bo góc, giống thẻ trắng của popup xem trước
  ctx.fillStyle = "#ffffff";
  drawRoundedRect(0, 0, canvasWidth, canvasHeight, 28);
  ctx.fill();

  let cursorY = paddingTop;
  const centerX = canvasWidth / 2;

  if (path) {
    ctx.fillStyle = "#94a3b8"; // slate-400
    ctx.font = `600 ${pathFontSize}px "Segoe UI", Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(path, centerX, cursorY, canvasWidth - paddingX * 2);
    cursorY += pathBlockHeight + gapAfterPath;
  }

  ctx.fillStyle = "#0f172a"; // slate-900
  ctx.font = `900 ${nameFontSize}px "Segoe UI", Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(name, centerX, cursorY, canvasWidth - paddingX * 2);
  cursorY += nameBlockHeight + gapAfterName;

  // Khung nền xám nhạt quanh mã QR, giống box trong popup xem trước
  const boxX = (canvasWidth - qrBoxSize) / 2;
  ctx.fillStyle = "#f8fafc"; // slate-50
  drawRoundedRect(boxX, cursorY, qrBoxSize, qrBoxSize, 20);
  ctx.fill();
  ctx.strokeStyle = "#e2e8f0"; // slate-200
  ctx.lineWidth = 2;
  drawRoundedRect(boxX, cursorY, qrBoxSize, qrBoxSize, 20);
  ctx.stroke();

  ctx.drawImage(qrImg, boxX + boxPadding, cursorY + boxPadding, qrSize, qrSize);

  return canvas.toDataURL("image/png");
}
