import React, { useEffect, useRef } from 'react';
import { trackAdvertiserImpression } from '../lib/analytics';

interface AdvertiserImpressionTrackerProps {
  company: {
    id: string | number;
    name: string;
  };
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Componente que envolve o card do anunciante e registra impressões válidas:
 * - Critério de visibilidade documentado:
 *   1. Pelo menos 50% da área do card visível na viewport (threshold: 0.5)
 *   2. Permanência contínua visível na tela por no mínimo 750 milissegundos (elimina scroll rápido)
 *   3. Deduplicação por anunciante e sessão: não duplica em re-renderizações ou reexecuções de efeitos
 *   4. Suporta rodízio: quando o anunciante muda no mesmo card rotativo, re-monitora o novo anunciante
 */
export const AdvertiserImpressionTracker: React.FC<AdvertiserImpressionTrackerProps> = ({
  company,
  children,
  className,
  style
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!company?.id) return;

    const element = containerRef.current;
    if (!element || typeof IntersectionObserver === 'undefined') {
      // Fallback para navegadores sem IntersectionObserver
      trackAdvertiserImpression(company.id, company.name);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          // Inicia timer de 750ms para garantir que a impressão foi visualizada
          if (!timerRef.current) {
            timerRef.current = setTimeout(() => {
              trackAdvertiserImpression(company.id, company.name);
              timerRef.current = null;
            }, 750);
          }
        } else {
          // Se o usuário rolou para fora antes de 750ms, cancela para não contabilizar scroll rápido
          if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
          }
        }
      },
      {
        threshold: 0.5,
        rootMargin: '0px'
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [company?.id, company?.name]);

  return (
    <div ref={containerRef} className={className} style={style}>
      {children}
    </div>
  );
};
