/**
 * ImgBB Image Uploader for Minha Divulgação
 * 
 * Strict ImgBB image hosting (never stores raw image bytes in Firebase Firestore).
 * Always returns hosted image URLs (e.g. https://i.ibb.co/...).
 */

export const DEFAULT_IMGBB_KEY = "7964279bf733e466f7a4d3adb322dcbe";

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
 * Tests connection with ImgBB using the given API key.
 */
export async function testImgBBApiKey(keyToTest?: string): Promise<{ success: boolean; message: string; isMaintenance?: boolean }> {
  const key = (keyToTest || getActiveImgBBKey()).trim();
  if (!key) {
    return { success: false, message: 'Nenhuma chave informada.' };
  }

  // Small 1x1 transparent gif for testing upload API
  const testBase64 = "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  const formData = new FormData();
  formData.append("image", testBase64);

  try {
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json().catch(() => null);

    if (data && data.success) {
      return { 
        success: true, 
        message: '✅ Conexão com o ImgBB bem-sucedida! Chave ativa e pronta para envio.' 
      };
    }

    const rawError = data?.error?.message || `HTTP ${res.status}`;
    if (rawError.toLowerCase().includes('maintenance') || rawError.toLowerCase().includes('down')) {
      return {
        success: false,
        isMaintenance: true,
        message: '⚠️ A API pública do ImgBB reportou manutenção temporária nos servidores deles. Se precisar postar agora sem esperar, abra https://imgbb.com, envie a foto lá e cole o link direto.'
      };
    }

    return {
      success: false,
      message: `Erro retornado pelo ImgBB: ${rawError}`
    };
  } catch (e: any) {
    return {
      success: false,
      message: `Falha ao testar API: ${e?.message || 'Verifique sua conexão'}`
    };
  }
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
