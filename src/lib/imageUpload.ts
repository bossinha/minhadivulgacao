/**
 * Resilient Image Uploader for Minha Divulgação
 * 
 * Automatically handles:
 * 1. Image optimization & client-side compression (WebP / JPEG, max 1200px)
 * 2. Upload to ImgBB if online and available
 * 3. Seamless fallback to optimized Data URL if ImgBB is down for maintenance, rate-limited, or offline
 * 4. Ensures the user is NEVER blocked from uploading flyers, banners, or logos!
 */

const DEFAULT_IMGBB_KEYS = [
  "b84e5dcba9b322fbb2c1adde190bfe95"
];

/**
 * Compresses an image file using HTML5 Canvas to WebP or JPEG.
 * Returns a high-efficiency Data URL (typically 40KB - 120KB for high-res banners).
 */
export async function compressImageToDataUrl(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Basic file validation
    if (!file.type.startsWith('image/')) {
      return reject(new Error('O arquivo selecionado não é uma imagem válida.'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Erro ao ler arquivo de imagem.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Erro ao decodificar a imagem selecionada.'));
      img.onload = () => {
        try {
          let { width, height } = img;

          // Calculate new dimensions preserving aspect ratio
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            // Fallback to raw data url if canvas context fails
            return resolve(e.target?.result as string);
          }

          // Enable smooth interpolation
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Draw image
          ctx.drawImage(img, 0, 0, width, height);

          // Try exporting as webp, fallback to jpeg
          let dataUrl = canvas.toDataURL('image/webp', quality);
          if (!dataUrl.startsWith('data:image/webp')) {
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }

          resolve(dataUrl);
        } catch (err) {
          console.warn('[imageUpload] Canvas compression failed, using original data:', err);
          resolve(e.target?.result as string);
        }
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Attempts to upload to ImgBB using a specific API key
 */
async function tryUploadToImgBB(file: File, apiKey: string): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

  try {
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: formData,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await res.json().catch(() => null);

    if (data && data.success && data.data && data.data.url) {
      return data.data.url;
    }

    const errorMsg = data?.error?.message || `HTTP ${res.status}`;
    throw new Error(`ImgBB error: ${errorMsg}`);
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

export interface UploadResult {
  url: string;
  provider: 'imgbb' | 'compressed_data_url';
  originalName: string;
  isFallback: boolean;
}

/**
 * Resilient image upload function.
 * 
 * 1. Tries ImgBB.
 * 2. If ImgBB fails (maintenance, timeout, rate-limit), seamlessly compresses
 *    the image client-side to an ultra-efficient Data URL so the user is NEVER blocked.
 */
export async function uploadImageWithFallback(
  file: File,
  options?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    onNotice?: (msg: string) => void;
  }
): Promise<UploadResult> {
  const envKey = (import.meta as any).env?.VITE_IMGBB_API_KEY;
  const keysToTry = [envKey, ...DEFAULT_IMGBB_KEYS].filter(Boolean) as string[];

  // 1. Try ImgBB if online
  if (navigator.onLine) {
    for (const key of keysToTry) {
      try {
        if (options?.onNotice) {
          options.onNotice('Conectando ao servidor de imagens...');
        }
        const imgbbUrl = await tryUploadToImgBB(file, key);
        if (imgbbUrl) {
          return {
            url: imgbbUrl,
            provider: 'imgbb',
            originalName: file.name,
            isFallback: false
          };
        }
      } catch (err: any) {
        console.warn(`[imageUpload] ImgBB attempt failed (${err?.message || err}). Falling back...`);
      }
    }
  }

  // 2. ImgBB is down for maintenance or unavailable: Fall back to high-res client-side compression
  if (options?.onNotice) {
    options.onNotice('Otimizando imagem para exibição direta no portal...');
  }

  const dataUrl = await compressImageToDataUrl(
    file,
    options?.maxWidth || 1200,
    options?.maxHeight || 1200,
    options?.quality || 0.82
  );

  return {
    url: dataUrl,
    provider: 'compressed_data_url',
    originalName: file.name,
    isFallback: true
  };
}

/**
 * Drop-in replacement for the legacy uploadToImgBB function.
 * Always resolves to a working image URL, never fails due to ImgBB maintenance!
 */
export async function uploadToImgBB(file: File): Promise<string> {
  const result = await uploadImageWithFallback(file);
  return result.url;
}
