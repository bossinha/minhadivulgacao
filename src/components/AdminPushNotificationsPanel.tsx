import React, { useState, useEffect } from 'react';
import {
  PushNotificationPayload,
  subscribeToActiveSubscribersCount,
  subscribeToNotificationsHistory,
  sendBroadcastPushNotification,
  isPushSupported
} from '../lib/pushNotifications';

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

  // Estados do Formulário de Criação de Notificação
  const [title, setTitle] = useState('🔥 OFERTA DO DIA');
  const [message, setMessage] = useState('Confira a promoção especial de hoje na Minha Divulgação!');
  const [image, setImage] = useState('');
  const [url, setUrl] = useState('');
  const [actionTitle, setActionTitle] = useState('VER OFERTA');

  // Modal de Confirmação antes do envio
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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
      const result = await sendBroadcastPushNotification({
        title,
        message,
        image,
        url: url.trim() || window.location.origin,
        actionTitle,
        adminEmail
      });

      if (result.success) {
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

      {/* Grid Principal: Formulário + Prévia da Notificação */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px', marginBottom: '35px' }}>
        
        {/* LADO ESQUERDO: Formulário de Criação */}
        <div style={{ background: '#0e1017', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '22px' }}>
          <h4 style={{ margin: '0 0 15px', color: '#fff', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>✏️</span> Criar Nova Notificação
          </h4>

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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ margin: 0 }}>Imagem ou Banner (Opcional)</label>
                {companies.length > 0 && (
                  <select
                    style={{ background: '#222', color: '#aaa', fontSize: '10px', border: '1px solid #444', borderRadius: '4px', padding: '2px 6px' }}
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
              <input
                type="url"
                className="dev-input"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://exemplo.com/banner-promocao.jpg"
              />
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h4 style={{ margin: 0, color: '#fff', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📜</span> Histórico de Notificações Enviadas
          </h4>
          <span style={{ fontSize: '11px', color: '#888' }}>
            {history.length} envios registrados
          </span>
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
                  <th style={{ padding: '10px 8px' }}>TÍTULO / MENSAGEM</th>
                  <th style={{ padding: '10px 8px', textAlign: 'center' }}>DESTINATÁRIOS</th>
                  <th style={{ padding: '10px 8px', textAlign: 'center' }}>CLIQUES</th>
                  <th style={{ padding: '10px 8px', textAlign: 'center' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px 8px', color: '#aaa', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
                      {item.sentAt || 'Recente'}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <div style={{ fontWeight: 800, color: '#fff' }}>{item.title}</div>
                      <div style={{ color: '#888', fontSize: '11px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
    </div>
  );
};
