import * as qrcode from 'qrcode';
import { createCanvas, loadImage } from 'canvas';

class QrCodeUtil {
  createQRCode = async (data: string) => {
    try {
      const qrCodeOptions: qrcode.QRCodeToDataURLOptions = {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        margin: 2,
        width: 500,
      };
      return qrcode.toDataURL(data, qrCodeOptions);
    } catch (err) {
      throw err;
    }
  };

  generateQRCodeWithImage = async (
    imagePath: string,
    data: any,
  ): Promise<string> => {
    // Create a canvas for the QR code
    const canvas = createCanvas(300, 300);
    const ctx = canvas.getContext('2d');

    // Fill the canvas with a white background
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // QR code generation options
    const qrCodeOptions: qrcode.QRCodeToDataURLOptions = {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      width: 500,
    };

    // Generate the QR code image as a data URL
    const qrCodeImage = await qrcode.toDataURL(data, qrCodeOptions);
    const qrCode = await loadImage(qrCodeImage);

    // Draw the QR code onto the canvas
    ctx.drawImage(qrCode, 25, 25, 250, 250);

    // Load the image to be embedded
    const maxImageSize = 70;
    const image = await loadImage(imagePath);
    const aspectRatio = image.width / image.height;
    let imageWidth = maxImageSize;
    let imageHeight = maxImageSize;

    // Adjust the image size to maintain aspect ratio
    if (image.width > maxImageSize || image.height > maxImageSize) {
      if (aspectRatio > 1) {
        imageWidth = maxImageSize;
        imageHeight = maxImageSize / aspectRatio;
      } else {
        imageWidth = maxImageSize * aspectRatio;
        imageHeight = maxImageSize;
      }
    }

    // Create a canvas for the image with padding
    const imageCanvas = createCanvas(imageWidth + 6, imageHeight + 6);
    const imageCtx = imageCanvas.getContext('2d');

    // Fill the image canvas with a white background
    imageCtx.fillStyle = '#fff';
    imageCtx.fillRect(0, 0, imageCanvas.width, imageCanvas.height);

    // Draw the image onto the image canvas
    imageCtx.drawImage(image, 3, 3, imageWidth, imageHeight);

    // Calculate the position to center the image on the QR code
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const imageX = centerX - imageWidth / 2;
    const imageY = centerY - imageHeight / 2;

    // Draw the image canvas onto the QR code canvas
    ctx.drawImage(imageCanvas, imageX, imageY);

    // Convert the final canvas to a buffer and then to a base64 data URL
    const buffer = canvas.toBuffer('image/png');
    const base64 = buffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;

    return dataUrl;
  };
}

export default new QrCodeUtil();
