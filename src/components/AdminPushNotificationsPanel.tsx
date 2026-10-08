import React, { useState, useEffect, useRef } from 'react';
import {
  PushNotificationPayload,
  subscribeToActiveSubscribersCount,
  subscribeToNotificationsHistory,
  sendBroadcastPushNotification,
  isPushSupported,
  deletePushNotification,
  clearAllPushNotifications,
  getNotificationPermission,
  requestAndRegisterPushSubscriber,
  triggerLocalTestNotification,
  updatePushNotification
} from '../lib/pushNotifications';

const IMGBB_API_KEY = "b84e5dcba9b322fbb2c1adde190bfe95";

const uploadToImgBB = async (file: File): Promise<string> => {
  const apiKey = (import.meta as any).env?.VITE_IMGBB_API_KEY || IMGBB_API_KEY;
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (data && data.success && data.data && (data.data.url || data.data.display_url)) {
    return data.data.url || data.data.display_url;
  } else {
    throw new Error(data?.error?.message || "Erro ao fazer upload da imagem no ImgBB.");
  }
};

interface AdminPushNotificationsPanelProps {
  companies?: any[];
  adminEmail?: string;
  portalName?: string;
}

export const AdminPushNotificationsPanel: React.FC<AdminPushNotificationsPanelProps> = ({
  companies = [],
  adminEmail = 'bossinhaa80@gmail.com',
  portalName = 'Minha Divulgação'
}) => {
  // Estados da Audiência e Histórico
  const [subscribersCount, setSubscribersCount] = useState<number>(0);
  const [history, setHistory] = useState<PushNotificationPayload[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Status de Permissão de Notificações no Aparelho do Administrador
  const [devicePermission, setDevicePermission] = useState<NotificationPermission>('default');
  const [isTestingDevice, setIsTestingDevice] = useState(false);
  const [isActivatingDevice, setIsActivatingDevice] = useState(false);

  useEffect(() => {
    setDevicePermission(getNotificationPermission());
  }, []);

  const handleActivateThisDevice = async () => {
    setIsActivatingDevice(true);
    try {
      const res = await requestAndRegisterPushSubscriber('admin');
      setDevicePermission(res.permission);
      if (res.success) {
        setSuccessMessage('🎉 Notificações ativadas com sucesso neste aparelho! Você receberá os testes.');
        setTimeout(() => setSuccessMessage(null), 5000);
      } else if (res.permission === 'denied') {
        alert('As notificações foram negadas nas configurações do seu navegador. Por favor, clique no ícone de cadeado na barra de endereço e altere para "Permitir".');
      }
    } catch (e: any) {
      alert('Erro ao ativar notificações: ' + (e?.message || 'Falha inesperada'));
    } finally {
      setIsActivatingDevice(false);
    }
  };

  const handleTestThisDevice = async () => {
    setIsTestingDevice(true);
    try {
      // Se ainda não tiver permissão, pede primeiro
      if (devicePermission === 'default') {
        await handleActivateThisDevice();
      }

      await triggerLocalTestNotification({
        title: title || '🔔 TESTE: Notificações Ativas!',
        message: message || 'Seu dispositivo está pronto para receber todas as ofertas da Minha Divulgação.',
        image: image || undefined,
        url: url.trim() || window.location.origin,
        actionTitle: actionTitle || 'VER OFERTA'
      });

      setSuccessMessage('🔔 Teste disparado! Veja o aviso no topo da tela e ouça o alerta sonoro.');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (e: any) {
      alert('Erro no teste: ' + (e?.message || 'Falha'));
    } finally {
      setIsTestingDevice(false);
    }
  };

  // Estados do Formulário de Criação de Notificação
  const [title, setTitle] = useState('🔥 OFERTA DO DIA');
  const [message, setMessage] = useState('Confira a promoção especial de hoje na Minha Divulgação!');
  const [image, setImage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const [loadedFromHistoryMsg, setLoadedFromHistoryMsg] = useState<string | null>(null);

  // Estados do Modal de Edição de Notificação Existente
  const [editingNotification, setEditingNotification] = useState<PushNotificationPayload | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editActionTitle, setEditActionTitle] = useState('VER OFERTA');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isEditUploading, setIsEditUploading] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState('');
  const [actionTitle, setActionTitle] = useState('VER OFERTA');

  // Reaproveita notificação do histórico carregando no formulário
  const handleReuseNotification = (item: PushNotificationPayload) => {
    setTitle(item.title || '🔥 OFERTA DO DIA');
    setMessage(item.message || '');
    setImage(item.image || '');
    setUrl(item.url || '');
    setActionTitle(item.actionTitle || 'VER OFERTA');

    setLoadedFromHistoryMsg(`Notificação "${item.title}" carregada no formulário! Edite o que desejar e clique em Enviar Agora.`);
    
    setTimeout(() => {
      formContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);

    setTimeout(() => {
      setLoadedFromHistoryMsg(null);
    }, 8000);
  };

  const handleResetFormToDefault = () => {
    setTitle('🔥 OFERTA DO DIA');
    setMessage('Confira a promoção especial de hoje na Minha Divulgação!');
    setImage('');
    setUrl('');
    setActionTitle('VER OFERTA');
    setLoadedFromHistoryMsg(null);
  };

  // Abre modal para editar os dados gravados no banco
  const handleOpenEditModal = (item: PushNotificationPayload) => {
    setEditingNotification(item);
    setEditTitle(item.title || '');
    setEditMessage(item.message || '');
    setEditImage(item.image || '');
    setEditUrl(item.url || '');
    setEditActionTitle(item.actionTitle || 'VER OFERTA');
  };

  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (JPG, PNG, WEBP, etc.).');
      return;
    }

    setIsEditUploading(true);
    try {
      const uploadedUrl = await uploadToImgBB(file);
      setEditImage(uploadedUrl);
    } catch (err: any) {
      console.error("ImgBB upload error:", err);
      alert(err?.message || "Falha ao enviar imagem para o ImgBB. Tente novamente.");
    } finally {
      setIsEditUploading(false);
      if (editFileInputRef.current) editFileInputRef.current.value = '';
    }
  };

  const handleSaveEdit = async () => {
    if (!editingNotification?.id) return;
    if (!editTitle.trim() || !editMessage.trim()) {
      alert('Por favor, preencha o Título e a Mensagem.');
      return;
    }

    setIsSavingEdit(true);
    try {
      const updatedData: Partial<PushNotificationPayload> = {
        title: editTitle.trim(),
        message: editMessage.trim(),
        image: editImage.trim(),
        url: editUrl.trim() || '/',
        actionTitle: editActionTitle.trim() || 'VER OFERTA'
      };

      await updatePushNotification(editingNotification.id, updatedData);

      setHistory(prev => prev.map(item => item.id === editingNotification.id ? { ...item, ...updatedData } : item));
      setSuccessMessage('💾 Notificação atualizada no banco de dados com sucesso!');
      setTimeout(() => setSuccessMessage(null), 4000);
      setEditingNotification(null);
    } catch (err: any) {
      alert('Erro ao salvar edição: ' + (err?.message || 'Falha inesperada'));
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleLoadFromEditModalToForm = () => {
    if (!editingNotification) return;
    setTitle(editTitle.trim() || '🔥 OFERTA DO DIA');
    setMessage(editMessage.trim() || '');
    setImage(editImage.trim() || '');
    setUrl(editUrl.trim() || '');
    setActionTitle(editActionTitle.trim() || 'VER OFERTA');

    setLoadedFromHistoryMsg(`Notificação carregada no formulário com suas alterações! Pronto para novo envio.`);
    setEditingNotification(null);

    setTimeout(() => {
      formContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);

    setTimeout(() => {
      setLoadedFromHistoryMsg(null);
    }, 8000);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (JPG, PNG, WEBP, etc.).');
      return;
    }

    setIsUploading(true);
    try {
      const uploadedUrl = await uploadToImgBB(file);
      setImage(uploadedUrl);
    } catch (err: any) {
      console.error("ImgBB upload error:", err);
      alert(err?.message || "Falha ao enviar imagem para o ImgBB. Tente novamente.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Modal de Confirmação antes do envio
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Estados de Exclusão do Banco de Dados
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isClearingAll, setIsClearingAll] = useState(false);

  const handleDeleteItem = async (id?: string, titleName?: string) => {
    if (!id) return;
    if (!confirm(`Deseja apagar permanentemente esta notificação ("${titleName || 'Oferta'}") do banco de dados?\n\nIsso remove os dados e links para não acumular nem sobrecarregar o banco.`)) {
      return;
    }
    setDeletingId(id);
    try {
      await deletePushNotification(id);
      setHistory(prev => prev.filter(x => x.id !== id));
      setSuccessMessage('🗑️ Notificação excluída do banco de dados com sucesso!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (e: any) {
      alert('Erro ao excluir do banco de dados: ' + (e?.message || 'Falha inesperada'));
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    if (history.length === 0) return;
    if (!confirm(`ATENÇÃO: Deseja apagar permanentemente TODAS as ${history.length} notificações gravadas no banco de dados?\n\nIsso faz uma limpeza completa, apagando links de promoções expiradas e liberando espaço no banco de dados.`)) {
      return;
    }
    setIsClearingAll(true);
    try {
      const totalDeleted = await clearAllPushNotifications();
      setHistory([]);
      setSuccessMessage(`🧹 Banco de dados limpo com sucesso! ${totalDeleted} registro(s) foram excluídos permanentemente.`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (e: any) {
      alert('Erro ao limpar banco de dados: ' + (e?.message || 'Falha inesperada'));
    } finally {
      setIsClearingAll(false);
    }
  };

  // Carrega contadores e histórico em tempo real
  useEffect(() => {
    const unsubSubscribers = subscribeToActiveSubscribersCount((count) => {
      setSubscribersCount(count);
    });

    const unsubHistory = subscribeToNotificationsHistory((list) => {
      setHistory(list);
    });

    return () => {
      unsubSubscribers();
      unsubHistory();
    };
  }, []);

  // Métricas calculadas
  const totalSent = history.reduce((sum, h) => sum + (h.sentCount || 0), 0);
  const totalClicks = history.reduce((sum, h) => sum + (h.clicksCount || 0), 0);
  const clickRate = totalSent > 0 ? ((totalClicks / totalSent) * 100).toFixed(1) : '0.0';

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      alert('Por favor, preencha o Título e a Mensagem da notificação.');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmSend = async () => {
    setShowConfirmModal(false);
    setLoading(true);

    try {
      // Se este aparelho do admin ainda não tiver permissão, tenta registrar também para que receba
      if (devicePermission === 'default') {
        try {
          const permRes = await requestAndRegisterPushSubscriber('admin');
          setDevicePermission(permRes.permission);
        } catch (_) {}
      }

      const result = await sendBroadcastPushNotification({
        title,
        message,
        image,
        url: url.trim() || window.location.origin,
        actionTitle,
        adminEmail
      });

      if (result.success) {
        const now = new Date();
        const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} — ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const newEntry: PushNotificationPayload = {
          id: result.notificationId,
          title,
          message,
          image,
          url: url.trim() || window.location.origin,
          actionTitle: actionTitle || 'VER OFERTA',
          sentAt: dateFormatted,
          sentAtTimestamp: Date.now(),
          recipientsCount: result.recipientsCount,
          sentCount: result.sentCount,
          clicksCount: 0,
          status: 'enviada',
          sentBy: adminEmail
        };
        setHistory(prev => [newEntry, ...prev.filter(x => x.id !== newEntry.id)]);
        setSuccessMessage(`🚀 Notificação enviada com sucesso para ${result.recipientsCount} pessoas na audiência!`);
        setTimeout(() => setSuccessMessage(null), 6000);
      }
    } catch (err: any) {
      console.error(err);
      alert('Erro ao enviar notificação: ' + (err?.message || 'Falha inesperada'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dev-forms-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Cabeçalho da Seção */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.4rem' }}>
            <span>🔔</span> Central de Notificações Push
          </h3>
          <p style={{ margin: '5px 0 0', color: '#888', fontSize: '0.85rem' }}>
            Envie ofertas, promoções e comunicados direto para o celular de quem autorizou notificações no portal.
          </p>
        </div>

        {/* Badge da Audiência */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(0,0,0,0.8))',
          border: '1px solid rgba(245,158,11,0.5)',
          borderRadius: '16px',
          padding: '12px 20px',
          textAlign: 'right',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
        }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#fbbf24', fontWeight: 900 }}>
            🔔 AUDIÊNCIA DE NOTIFICAÇÕES
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>
            {subscribersCount.toLocaleString('pt-BR')} <span style={{ fontSize: '0.9rem', color: '#aaa', fontWeight: 'normal' }}>pessoas ativas</span>
          </div>
        </div>
      </div>

      {/* Cartões de Métricas Gerais */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '25px' }}>
        <div style={{ background: '#111218', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '15px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', fontWeight: 700 }}>Inscritos Ativos</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10b981', marginTop: '4px' }}>
            {subscribersCount.toLocaleString('pt-BR')}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '2px' }}>Prontos para receber</div>
        </div>

        <div style={{ background: '#111218', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '15px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', fontWeight: 700 }}>Total de Envios</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f59e0b', marginTop: '4px' }}>
            {totalSent.toLocaleString('pt-BR')}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '2px' }}>Disparos computados</div>
        </div>

        <div style={{ background: '#111218', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '15px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', fontWeight: 700 }}>Cliques em Ofertas</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#3b82f6', marginTop: '4px' }}>
            {totalClicks.toLocaleString('pt-BR')}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '2px' }}>Acessos às ofertas</div>
        </div>

        <div style={{ background: '#111218', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '15px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', fontWeight: 700 }}>Taxa de Clique (CTR)</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ec4899', marginTop: '4px' }}>
            {clickRate}%
          </div>
          <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '2px' }}>Engajamento real</div>
        </div>
      </div>

      {successMessage && (
        <div style={{
          background: 'rgba(16,185,129,0.15)',
          border: '1px solid #10b981',
          color: '#10b981',
          padding: '14px 18px',
          borderRadius: '12px',
          marginBottom: '20px',
          fontSize: '0.9rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>✅</span>
          <span>{successMessage}</span>
        </div>
      )}

      {/* STATUS DE NOTIFICAÇÕES DESTE APARELHO (DIAGNÓSTICO E TESTE) */}
      <div style={{
        background: devicePermission === 'granted' 
          ? 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,78,59,0.25))' 
          : devicePermission === 'denied'
          ? 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(127,29,29,0.25))'
          : 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(120,53,15,0.25))',
        border: devicePermission === 'granted' 
          ? '1px solid rgba(16,185,129,0.4)' 
          : devicePermission === 'denied'
          ? '1px solid rgba(239,68,68,0.4)'
          : '1px solid rgba(245,158,11,0.4)',
        borderRadius: '16px',
        padding: '16px 20px',
        marginBottom: '25px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.8rem' }}>
            {devicePermission === 'granted' ? '📱✅' : devicePermission === 'denied' ? '🚫' : '🔔⚠️'}
          </span>
          <div>
            <div style={{ 
              fontWeight: 900, 
              color: devicePermission === 'granted' ? '#34d399' : devicePermission === 'denied' ? '#f87171' : '#fbbf24',
              fontSize: '0.92rem'
            }}>
              {devicePermission === 'granted' 
                ? 'NOTIFICAÇÕES ATIVAS NESTE SEU APARELHO'
                : devicePermission === 'denied'
                ? 'NOTIFICAÇÕES BLOQUEADAS NESTE NAVEGADOR'
                : 'NOTIFICAÇÕES DESTE APARELHO AINDA NÃO FORAM AUTORIZADAS'}
            </div>
            <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#aaa', maxWidth: '600px', lineHeight: '1.4' }}>
              {devicePermission === 'granted'
                ? 'Este seu celular ou computador já tem permissão concedida. Ao disparar uma notificação, seu aparelho receberá o aviso sonoro e a notificação na tela.'
                : devicePermission === 'denied'
                ? 'As notificações estão bloqueadas nas configurações do navegador. Toque no ícone de cadeado na barra de endereços para permitir notificações.'
                : 'Para receber os testes na tela do seu celular e ouvir o aviso sonoro, clique no botão ao lado para autorizar agora.'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {devicePermission !== 'granted' && (
            <button
              type="button"
              disabled={isActivatingDevice}
              onClick={handleActivateThisDevice}
              style={{
                background: '#00c980',
                color: '#000',
                border: 'none',
                fontWeight: 900,
                fontSize: '0.8rem',
                padding: '9px 15px',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(0, 201, 128, 0.3)'
              }}
            >
              <span>🔔</span>
              <span>{isActivatingDevice ? 'Ativando...' : 'AUTORIZAR MEU APARELHO'}</span>
            </button>
          )}

          <button
            type="button"
            disabled={isTestingDevice}
            onClick={handleTestThisDevice}
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#000',
              border: 'none',
              fontWeight: 900,
              fontSize: '0.8rem',
              padding: '9px 15px',
              borderRadius: '10px',
              cursor: isTestingDevice ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 15px rgba(245, 158, 11, 0.25)'
            }}
            title="Dispara uma notificação de teste imediatamente com som, vibração e banner na tela"
          >
            <span>⚡</span>
            <span>{isTestingDevice ? 'Disparando...' : 'TESTAR NO MEU APARELHO AGORA'}</span>
          </button>
        </div>
      </div>

      {/* Grid Principal: Formulário + Prévia da Notificação */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px', marginBottom: '35px' }}>
        
        {/* LADO ESQUERDO: Formulário de Criação */}
        <div ref={formContainerRef} style={{ background: '#0e1017', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '8px' }}>
            <h4 style={{ margin: 0, color: '#fff', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>✏️</span> Criar Nova Notificação
            </h4>
            <button
              type="button"
              onClick={handleResetFormToDefault}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#aaa',
                borderRadius: '8px',
                padding: '4px 10px',
                fontSize: '11px',
                cursor: 'pointer'
              }}
              title="Limpar formulário e voltar aos textos padrões"
            >
              🔄 Limpar Campos
            </button>
          </div>

          {loadedFromHistoryMsg && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(217,119,6,0.1))',
              border: '1px solid #f59e0b',
              color: '#fbbf24',
              padding: '12px 14px',
              borderRadius: '12px',
              marginBottom: '16px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              boxShadow: '0 4px 15px rgba(245,158,11,0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>♻️</span>
                <span>{loadedFromHistoryMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setLoadedFromHistoryMsg(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fbbf24',
                  fontSize: '14px',
                  cursor: 'pointer',
                  padding: '2px 6px'
                }}
              >
                ✕
              </button>
            </div>
          )}

          <form onSubmit={handleOpenConfirm}>
            {/* Título */}
            <div className="dev-form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ margin: 0 }}>Título da Notificação *</label>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button type="button" onClick={() => setTitle('🔥 OFERTA DO DIA')} style={{ fontSize: '9px', background: '#222', color: '#aaa', border: 'none', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer' }}>+ Oferta</button>
                  <button type="button" onClick={() => setTitle('⚡ PROMOÇÃO RELÂMPAGO')} style={{ fontSize: '9px', background: '#222', color: '#aaa', border: 'none', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer' }}>+ Relâmpago</button>
                </div>
              </div>
              <input
                type="text"
                className="dev-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: 🔥 OFERTA DO DIA"
                required
                maxLength={60}
              />
            </div>

            {/* Mensagem */}
            <div className="dev-form-group">
              <label>Mensagem da Notificação *</label>
              <textarea
                className="dev-input"
                style={{ height: '80px', resize: 'vertical' }}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ex: Confira a promoção especial de hoje na Minha Divulgação."
                required
                maxLength={180}
              />
              <span style={{ fontSize: '10px', color: '#666', display: 'block', textAlign: 'right', marginTop: '2px' }}>
                {message.length}/180 caracteres
              </span>
            </div>

            {/* Imagem / Banner Opcional */}
            <div className="dev-form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                <label style={{ margin: 0, fontWeight: 800 }}>IMAGEM OU BANNER (OPCIONAL)</label>
                {companies.length > 0 && (
                  <select
                    style={{ background: '#222', color: '#aaa', fontSize: '11px', border: '1px solid #444', borderRadius: '6px', padding: '3px 8px' }}
                    onChange={(e) => {
                      if (e.target.value) {
                        setImage(e.target.value);
                      }
                    }}
                  >
                    <option value="">Preencher com logo de anunciante...</option>
                    {companies.map((c: any) => (
                      <option key={c.id || c.name} value={c.logo}>{c.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Botão de Upload Direto ImgBB */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    background: '#25D366',
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '12px',
                    fontWeight: 900,
                    cursor: isUploading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(37, 211, 102, 0.25)',
                    opacity: isUploading ? 0.7 : 1
                  }}
                >
                  {isUploading ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>Enviando para o ImgBB...</span>
                    </>
                  ) : (
                    <>
                      <span>📷</span>
                      <span>Carregar Foto / Banner (ImgBB)</span>
                    </>
                  )}
                </button>

                {image && (
                  <button
                    type="button"
                    onClick={() => setImage('')}
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: '#ef4444',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '11px',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                    title="Remover o link da foto para não gravar no banco de dados"
                  >
                    ✕ Descartar Foto (Não salvar no banco)
                  </button>
                )}
              </div>

              <input
                type="url"
                className="dev-input"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://i.ibb.co/... ou digite o link da imagem"
              />
              <span style={{ fontSize: '10px', color: '#888', display: 'block', marginTop: '4px' }}>
                💡 Você pode clicar em <strong>"Carregar Foto / Banner"</strong> para selecionar uma imagem do celular ou PC. Ela será enviada ao ImgBB e convertida em link direto automaticamente, gravando apenas o link no banco de dados.
              </span>

              {image && (
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(37, 211, 102, 0.08)', border: '1px solid rgba(37, 211, 102, 0.3)', padding: '10px 14px', borderRadius: '10px' }}>
                  <img src={image} alt="Preview Uploaded" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '11px', color: '#25D366', fontWeight: 900, display: 'block' }}>✓ Imagem Hospedada no ImgBB (Link Pronto)</span>
                    <span style={{ fontSize: '10px', color: '#aaa', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{image}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Link de Destino */}
            <div className="dev-form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ margin: 0 }}>Link de Destino (Onde a pessoa vai ao clicar) *</label>
                {companies.length > 0 && (
                  <select
                    style={{ background: '#222', color: '#aaa', fontSize: '10px', border: '1px solid #444', borderRadius: '4px', padding: '2px 6px' }}
                    onChange={(e) => {
                      const selectedComp = companies.find((c: any) => String(c.id) === e.target.value || c.name === e.target.value);
                      if (selectedComp) {
                        if (selectedComp.wa) {
                          const clean = String(selectedComp.wa).replace(/\D/g, '');
                          const phone = clean.length <= 11 ? `55${clean}` : clean;
                          setUrl(`https://wa.me/${phone}?text=${encodeURIComponent(`Olá! Vi a oferta da *${selectedComp.name}* pela notificação do portal *${portalName}*!`)}`);
                        } else {
                          setUrl(window.location.origin);
                        }
                      }
                    }}
                  >
                    <option value="">Atalho para WhatsApp do anunciante...</option>
                    {companies.map((c: any) => (
                      <option key={c.id || c.name} value={c.id || c.name}>{c.name}</option>
                    ))}
                  </select>
                )}
              </div>
              <input
                type="text"
                className="dev-input"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Ex: https://wa.me/5585999999999 ou link do portal"
                required
              />
              <span style={{ fontSize: '10px', color: '#888', marginTop: '3px', display: 'block' }}>
                Pode ser o WhatsApp do anunciante, página de produto ou qualquer link na internet.
              </span>
            </div>

            {/* Texto do Botão de Ação */}
            <div className="dev-form-group">
              <label>Texto do Botão de Ação</label>
              <input
                type="text"
                className="dev-input"
                value={actionTitle}
                onChange={(e) => setActionTitle(e.target.value)}
                placeholder="Ex: VER OFERTA"
                maxLength={25}
              />
            </div>

            {/* Botão de Disparo */}
            <div style={{ marginTop: '20px' }}>
              <button
                type="submit"
                disabled={loading}
                className="dev-save-btn"
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#000',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 15px rgba(245,158,11,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>🚀</span>
                <span>{loading ? 'Disparando...' : 'ENVIAR AGORA PARA A AUDIÊNCIA'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* LADO DIREITO: Pré-visualização Fiel ao Vivo */}
        <div style={{ background: '#0e1017', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '22px' }}>
          <h4 style={{ margin: '0 0 15px', color: '#fff', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📱</span> Pré-visualização da Notificação
          </h4>
          <p style={{ margin: '0 0 20px', color: '#888', fontSize: '0.8rem' }}>
            Veja exatamente como a notificação será apresentada na tela de bloqueio e navegador do usuário:
          </p>

          {/* Mockup Notificação Mobile/Desktop */}
          <div style={{
            background: '#1c1e29',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
            position: 'relative'
          }}>
            {/* Header da notificação */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img
                  src="https://i.postimg.cc/Gpykbbz5/nova_logo_bossa_infor_png.png"
                  alt="Minha Divulgação"
                  style={{ width: '22px', height: '22px', borderRadius: '6px', objectFit: 'contain', background: '#000' }}
                />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#f59e0b' }}>
                  {portalName}
                </span>
                <span style={{ fontSize: '10px', color: '#888' }}>• agora</span>
              </div>
              <span style={{ fontSize: '11px', color: '#666' }}>🔔</span>
            </div>

            {/* Conteúdo principal */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 900, color: '#fff', fontSize: '14px', marginBottom: '4px', wordBreak: 'break-word' }}>
                  {title || '🔥 Título da Notificação'}
                </div>
                <div style={{ color: '#ccc', fontSize: '12px', lineHeight: '1.4', wordBreak: 'break-word' }}>
                  {message || 'Sua mensagem aparecerá aqui com todos os detalhes da promoção.'}
                </div>
              </div>

              {image && (
                <div style={{ width: '60px', height: '60px', borderRadius: '10px', overflow: 'hidden', background: '#000', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                  <img src={image} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
            </div>

            {/* Imagem expandida grande se informada */}
            {image && (
              <div style={{ marginTop: '12px', borderRadius: '10px', overflow: 'hidden', maxHeight: '140px', background: '#000', border: '1px solid rgba(255,255,255,0.08)' }}>
                <img src={image} alt="Banner Grande" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            )}

            {/* Botão de ação da notificação */}
            <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#f59e0b',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 900,
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                👉 {actionTitle || 'VER OFERTA'}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '20px', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '12px', padding: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#f59e0b', marginBottom: '4px' }}>
              💡 CONTROLE TOTAL DO ADMINISTRADOR:
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: '#aaa', lineHeight: '1.4' }}>
              Somente você tem acesso a esta ferramenta. Anunciantes e clientes não criam e não enviam notificações. Você pode usar a audiência da Minha Divulgação para impulsionar qualquer anunciante quando quiser.
            </p>
          </div>
        </div>

      </div>

      {/* Histórico de Notificações Enviadas */}
      <div style={{ background: '#0e1017', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h4 style={{ margin: 0, color: '#fff', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📜</span> Histórico de Notificações Enviadas
            </h4>
            <span style={{ fontSize: '11px', color: '#888' }}>
              {history.length} envios registrados no banco de dados
            </span>
          </div>

          {history.length > 0 && (
            <button
              type="button"
              disabled={isClearingAll}
              onClick={handleClearAll}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: '8px',
                padding: '7px 14px',
                fontSize: '11px',
                fontWeight: 900,
                cursor: isClearingAll ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
              title="Apagar todas as notificações gravadas no banco de dados para liberar espaço e não acumular links expirados"
            >
              <span>🧹</span>
              <span>{isClearingAll ? 'Limpando Banco...' : 'Limpar Todo o Histórico do Banco'}</span>
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>
            <span style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}>📭</span>
            Nenhuma notificação enviada ainda. Crie sua primeira notificação acima para disparar para a audiência!
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#888' }}>
                  <th style={{ padding: '10px 8px' }}>DATA / HORA</th>
                  <th style={{ padding: '10px 8px' }}>IMAGEM</th>
                  <th style={{ padding: '10px 8px' }}>TÍTULO / MENSAGEM</th>
                  <th style={{ padding: '10px 8px', textAlign: 'center' }}>DESTINATÁRIOS</th>
                  <th style={{ padding: '10px 8px', textAlign: 'center' }}>CLIQUES</th>
                  <th style={{ padding: '10px 8px', textAlign: 'center' }}>STATUS</th>
                  <th style={{ padding: '10px 8px', textAlign: 'center' }}>AÇÕES (REAPROVEITAR / EDITAR / EXCLUIR)</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px 8px', color: '#aaa', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
                      {item.sentAt || 'Recente'}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      {item.image ? (
                        <a href={item.image} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                          <img src={item.image} alt="Thumb" style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.15)' }} />
                          <span style={{ fontSize: '10px', color: '#60a5fa' }}>Ver ↗</span>
                        </a>
                      ) : (
                        <span style={{ fontSize: '10px', color: '#555' }}>Sem foto</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <div style={{ fontWeight: 800, color: '#fff' }}>{item.title}</div>
                      <div style={{ color: '#888', fontSize: '11px', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.message}
                      </div>
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 900, color: '#10b981', fontFamily: 'monospace' }}>
                      {item.sentCount || item.recipientsCount || 1}
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 900, color: '#3b82f6', fontFamily: 'monospace' }}>
                      {item.clicksCount || 0}
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                      <span style={{
                        background: 'rgba(16,185,129,0.15)',
                        color: '#10b981',
                        border: '1px solid rgba(16,185,129,0.3)',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        fontSize: '10px',
                        fontWeight: 900,
                        textTransform: 'uppercase'
                      }}>
                        Concluída
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {/* Botão Reaproveitar */}
                        <button
                          type="button"
                          onClick={() => handleReuseNotification(item)}
                          style={{
                            background: 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(217,119,6,0.35))',
                            color: '#fbbf24',
                            border: '1px solid rgba(245,158,11,0.6)',
                            borderRadius: '6px',
                            padding: '5px 10px',
                            fontSize: '11px',
                            fontWeight: 900,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: '0 2px 6px rgba(245,158,11,0.15)'
                          }}
                          title="Reaproveitar: carrega os textos, imagem e links desta notificação no formulário para você disparar novamente com 1 clique"
                        >
                          <span>♻️</span>
                          <span>Reaproveitar</span>
                        </button>

                        {/* Botão Editar */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(item)}
                          style={{
                            background: 'rgba(59, 130, 246, 0.18)',
                            color: '#60a5fa',
                            border: '1px solid rgba(59, 130, 246, 0.45)',
                            borderRadius: '6px',
                            padding: '5px 10px',
                            fontSize: '11px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="Editar os dados desta notificação (título, mensagem, imagem, link) gravados no banco de dados"
                        >
                          <span>✏️</span>
                          <span>Editar</span>
                        </button>

                        {/* Botão Excluir */}
                        <button
                          type="button"
                          disabled={deletingId === item.id}
                          onClick={() => handleDeleteItem(item.id, item.title)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.15)',
                            color: '#ef4444',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '6px',
                            padding: '5px 10px',
                            fontSize: '11px',
                            fontWeight: 800,
                            cursor: deletingId === item.id ? 'not-allowed' : 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="Apagar esta notificação e seu link permanentemente do banco de dados para não acumular"
                        >
                          {deletingId === item.id ? '⏳' : '🗑️'}
                          <span>Excluir</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DE CONFIRMAÇÃO DE ENVIO */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div style={{
            background: '#151722',
            border: '1px solid rgba(245,158,11,0.5)',
            borderRadius: '20px',
            maxWidth: '480px',
            width: '100%',
            padding: '25px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '10px' }}>🚀</span>
            <h3 style={{ margin: '0 0 10px', color: '#fff', fontSize: '1.25rem' }}>
              Confirmar Envio da Notificação?
            </h3>
            <p style={{ color: '#ccc', fontSize: '0.9rem', lineHeight: '1.5', margin: '0 0 20px' }}>
              Você está prestes a enviar esta notificação para <strong style={{ color: '#fbbf24' }}>{subscribersCount.toLocaleString('pt-BR')} pessoas ativas</strong> na audiência da Minha Divulgação.
            </p>

            <div style={{
              background: '#0a0b10',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '12px',
              textAlign: 'left',
              marginBottom: '20px',
              fontSize: '12px'
            }}>
              <div style={{ color: '#fff', fontWeight: 800 }}>{title}</div>
              <div style={{ color: '#888', marginTop: '3px' }}>{message}</div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                CANCELAR
              </button>
              <button
                type="button"
                onClick={handleConfirmSend}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#000',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontWeight: 900,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(245,158,11,0.4)'
                }}
              >
                CONFIRMAR ENVIO 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE EDIÇÃO DE NOTIFICAÇÃO GRAVADA NO BANCO */}
      {editingNotification && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100000,
          padding: '16px',
          overflowY: 'auto'
        }}>
          <div style={{
            background: '#131520',
            border: '1px solid rgba(59, 130, 246, 0.5)',
            borderRadius: '20px',
            maxWidth: '560px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.9)',
            textAlign: 'left',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            {/* Cabeçalho do Modal de Edição */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.4rem' }}>✏️</span>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: 900 }}>
                  Editar Notificação Gravada
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingNotification(null)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: '#aaa',
                  border: 'none',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            <p style={{ margin: '0 0 18px', color: '#aaa', fontSize: '0.82rem', lineHeight: '1.4' }}>
              Atualize as informações desta notificação no banco de dados. Você também pode carregá-la no formulário principal para disparar com as novas informações.
            </p>

            {/* Campo Título */}
            <div className="dev-form-group" style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#ddd', marginBottom: '4px' }}>
                Título da Notificação *
              </label>
              <input
                type="text"
                className="dev-input"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                maxLength={60}
                required
              />
            </div>

            {/* Campo Mensagem */}
            <div className="dev-form-group" style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#ddd', marginBottom: '4px' }}>
                Mensagem *
              </label>
              <textarea
                className="dev-input"
                style={{ height: '70px', resize: 'vertical' }}
                value={editMessage}
                onChange={(e) => setEditMessage(e.target.value)}
                maxLength={180}
                required
              />
            </div>

            {/* Campo Imagem / Upload ImgBB */}
            <div className="dev-form-group" style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#ddd', marginBottom: '6px' }}>
                Imagem / Banner (ImgBB)
              </label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
                <input
                  type="file"
                  accept="image/*"
                  ref={editFileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleEditImageUpload}
                />
                <button
                  type="button"
                  disabled={isEditUploading}
                  onClick={() => editFileInputRef.current?.click()}
                  style={{
                    background: '#25D366',
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '11px',
                    fontWeight: 900,
                    cursor: isEditUploading ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {isEditUploading ? '⏳ Enviando ao ImgBB...' : '📷 Trocar Foto (ImgBB)'}
                </button>

                {editImage && (
                  <button
                    type="button"
                    onClick={() => setEditImage('')}
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: '#ef4444',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '8px',
                      padding: '6px 10px',
                      fontSize: '11px',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    ✕ Remover Foto
                  </button>
                )}
              </div>

              <input
                type="url"
                className="dev-input"
                value={editImage}
                onChange={(e) => setEditImage(e.target.value)}
                placeholder="Link da imagem (https://i.ibb.co/...)"
              />

              {editImage && (
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.04)', padding: '6px 10px', borderRadius: '8px' }}>
                  <img src={editImage} alt="Preview" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                  <span style={{ fontSize: '10px', color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{editImage}</span>
                </div>
              )}
            </div>

            {/* Campo Link */}
            <div className="dev-form-group" style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#ddd', marginBottom: '4px' }}>
                Link de Destino
              </label>
              <input
                type="text"
                className="dev-input"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                placeholder="Link de destino (WhatsApp, página, etc.)"
              />
            </div>

            {/* Campo Botão de Ação */}
            <div className="dev-form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#ddd', marginBottom: '4px' }}>
                Texto do Botão
              </label>
              <input
                type="text"
                className="dev-input"
                value={editActionTitle}
                onChange={(e) => setEditActionTitle(e.target.value)}
                maxLength={25}
              />
            </div>

            {/* Botões de Ação do Modal */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setEditingNotification(null)}
                style={{
                  flex: '1 1 100px',
                  background: 'rgba(255,255,255,0.08)',
                  color: '#fff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={isSavingEdit}
                onClick={handleSaveEdit}
                style={{
                  flex: '2 1 160px',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: '#fff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontWeight: 900,
                  fontSize: '0.85rem',
                  cursor: isSavingEdit ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                }}
              >
                <span>💾</span>
                <span>{isSavingEdit ? 'Salvando no Banco...' : 'Salvar Alterações'}</span>
              </button>

              <button
                type="button"
                onClick={handleLoadFromEditModalToForm}
                style={{
                  flex: '2 1 180px',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#000',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontWeight: 900,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
                }}
              >
                <span>🚀</span>
                <span>Carregar e Disparar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
