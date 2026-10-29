/**
 * ImgBB Image Uploader for Minha Divulgação
 * 
 * Strict ImgBB image hosting (never stores raw image bytes in Firebase Firestore).
 * Always returns hosted image URLs (e.g. https://i.ibb.co/...).
 */

export const DEFAULT_IMGBB_KEY = "b84e5dcba9b322fbb2c1adde190bfe95";

export function getActiveImgBBKey(): string {
  try {
    const customKey = localStorage.getItem('portal_imgbb_api_key');
    if (customKey && customKey.trim()) {
      return customKey.trim();
    }
  } catch (e) {}

  const envKey = (import.meta as any).env?.VITE_IMGBB_API_KEY;
  if (envKey && envKey.trim()) {
    return envKey.trim();
  }

  return DEFAULT_IMGBB_KEY;
}

export function setActiveImgBBKey(key: string): void {
  try {
    if (key && key.trim()) {
      localStorage.setItem('portal_imgbb_api_key', key.trim());
    } else {
      localStorage.removeItem('portal_imgbb_api_key');
    }
  } catch (e) {}
}

/**
 * Uploads an image file strictly to ImgBB.
 * Never stores image bytes or base64 data in Firestore.
 */
export async function uploadToImgBB(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Por favor, selecione um arquivo de imagem válido (JPG, PNG, WEBP).');
  }

  const apiKey = getActiveImgBBKey();
  const formData = new FormData();
  formData.append("image", file);

  try {
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json().catch(() => null);

    if (data && data.success && data.data && data.data.url) {
      return data.data.url as string;
    }

    const rawError = data?.error?.message || `HTTP ${res.status}`;

    if (rawError.toLowerCase().includes('maintenance') || rawError.toLowerCase().includes('down')) {
      throw new Error(
        'A API do ImgBB está momentaneamente em manutenção nos servidores deles. ' +
        'Para não perder tempo, abra o site https://imgbb.com , envie a imagem lá e cole o link direto (https://i.ibb.co/...) no campo abaixo.'
      );
    }

    throw new Error(`Erro no ImgBB: ${rawError}`);
  } catch (err: any) {
    if (err.message && err.message.includes('API do ImgBB está momentaneamente em manutenção')) {
      throw err;
    }
    throw new Error(
      err?.message || 'Falha ao conectar com o ImgBB. Verifique sua conexão ou cole o link direto da imagem.'
    );
  }
}

/**
 * Compatible wrapper returning strict ImgBB URL
 */
export async function uploadImageWithFallback(
  file: File,
  options?: {
    onNotice?: (msg: string) => void;
  }
): Promise<{ url: string; provider: 'imgbb'; originalName: string }> {
  if (options?.onNotice) {
    options.onNotice('Enviando imagem para o ImgBB...');
  }

  const url = await uploadToImgBB(file);

  return {
    url,
    provider: 'imgbb',
    originalName: file.name
  };
}
