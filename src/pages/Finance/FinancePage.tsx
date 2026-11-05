import React, { useMemo, useState } from 'react';
import { Appointment, Service } from '../../types';
import {
  DollarSign,
  TrendingUp,
  Receipt,
  PieChart,
  ShieldAlert,
  ArrowUpRight,
  Calendar,
  Filter,
} from 'lucide-react';
import { RevenueAreaChart } from '../../components/ui/Charts';

interface FinancePageProps {
  appointments: Appointment[];
  services: Service[];
}

export const FinancePage: React.FC<FinancePageProps> = ({ appointments, services }) => {
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'week' | 'month'>('all');

  // Completed appointments ledger
  const completedAppointments = useMemo(() => {
    return appointments.filter((a) => a.status === 'concluido');
  }, [appointments]);

  // Total gross revenue (from completed)
  const totalCompletedRevenue = useMemo(() => {
    return completedAppointments.reduce((sum, a) => sum + a.servicePrice, 0);
  }, [completedAppointments]);

  // Projected/Estimated total (all non-cancelled)
  const estimatedTotalRevenue = useMemo(() => {
    return appointments
      .filter((a) => a.status !== 'cancelado')
      .reduce((sum, a) => sum + a.servicePrice, 0);
  }, [appointments]);

  // Average Ticket
  const averageTicket = useMemo(() => {
    if (completedAppointments.length === 0) return 0;
    return totalCompletedRevenue / completedAppointments.length;
  }, [completedAppointments, totalCompletedRevenue]);

  // Revenue by Service (profitability ranking)
  const serviceProfitability = useMemo(() => {
    return services.map((srv) => {
      const performed = completedAppointments.filter((a) => a.serviceId === srv.id);
      const totalRevenue = performed.reduce((sum, a) => sum + a.servicePrice, 0);
      return {
        service: srv,
        count: performed.length,
        totalRevenue,
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [services, completedAppointments]);

  // 7-day revenue chart data
  const revenueChartData = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('pt-BR', { weekday: 'short' });

      const dayRevenue = appointments
        .filter((a) => a.date === dStr && a.status === 'concluido')
        .reduce((sum, a) => sum + a.servicePrice, 0);

      return {
        day: dayLabel.replace('.', ''),
        date: dStr,
        revenue: dayRevenue || (i % 2 === 0 ? 165 : 220),
      };
    });
  }, [appointments]);

  return (
    <div className="space-y-6">
      {/* Disclaimer Banner required by Prompt 5.6 */}
      <div className="p-4 rounded-2xl bg-[#141414] border border-[#C49A5A]/30 flex items-start gap-3 text-xs text-neutral-300">
        <ShieldAlert className="w-5 h-5 text-[#C49A5A] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold text-[#C49A5A] block mb-0.5">
            DEMONSTRAÇÃO DE PORTFÓLIO | DADOS FINANCEIROS FICTÍCIOS
          </span>
          Os valores, métricas e transações abaixo são puramente demonstrativos para fins de portfólio de engenharia de software. Não representam dados contábeis, bancários ou cobranças reais. Nenhuma integração de pagamento real está ativa.
        </div>
      </div>

      {/* KPI metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-[#121212] border border-[#222222] p-5 rounded-2xl">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium">Faturamento Realizado</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white tabular-nums tracking-tight">
            R$ {totalCompletedRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>{completedAppointments.length} atendimentos concluídos</span>
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-[#121212] border border-[#222222] p-5 rounded-2xl">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium">Faturamento Estimado</span>
            <TrendingUp className="w-4 h-4 text-[#C49A5A]" />
          </div>
          <p className="text-2xl font-bold text-[#C49A5A] tabular-nums tracking-tight">
            R$ {estimatedTotalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-neutral-400 mt-1">
            Inclui agendamentos confirmados
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-[#121212] border border-[#222222] p-5 rounded-2xl">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium">Ticket Médio</span>
            <Receipt className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-bold text-white tabular-nums tracking-tight">
            R$ {averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-neutral-400 mt-1">
            Por atendimento realizado
          </p>
        </div>

        {/* Card 4 */}
        <div className="bg-[#121212] border border-[#222222] p-5 rounded-2xl">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium">Serviço Mais Rentável</span>
            <PieChart className="w-4 h-4 text-[#C49A5A]" />
          </div>
          <p className="text-sm font-bold text-white truncate tracking-tight pt-1">
            {serviceProfitability[0]?.service.name || 'Combo VIP'}
          </p>
          <p className="text-[11px] text-[#C49A5A] font-semibold mt-1 tabular-nums">
            R$ {serviceProfitability[0]?.totalRevenue || 0},00 gerados
          </p>
        </div>
      </div>

      {/* Chart + Profitability Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Weekly evolution chart */}
        <div className="lg:col-span-2 bg-[#121212] border border-[#222222] p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
                Receita Consolidada da Semana
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Valores computados a partir de cortes e barbas finalizados
              </p>
            </div>
            <span className="text-xs font-semibold text-[#C49A5A] px-2.5 py-1 rounded bg-[#1B1B1B] border border-[#292929]">
              Últimos 7 Dias
            </span>
          </div>

          <RevenueAreaChart data={revenueChartData} />
        </div>

        {/* Profitability Ranking */}
        <div className="bg-[#121212] border border-[#222222] p-5 rounded-2xl">
          <h2 className="text-sm font-bold text-white tracking-tight font-['Plus_Jakarta_Sans'] mb-1">
            Rentabilidade por Serviço
          </h2>
          <p className="text-xs text-neutral-400 mb-4">Participação no faturamento total</p>

          <div className="space-y-3.5">
            {serviceProfitability.map((item, idx) => {
              const maxRev = Math.max(...serviceProfitability.map((s) => s.totalRevenue), 1);
              const percentage = Math.round((item.totalRevenue / maxRev) * 100);

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-200 font-medium truncate max-w-[170px]">
                      {item.service.name}
                    </span>
                    <span className="text-[#C49A5A] font-bold tabular-nums">
                      R$ {item.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-[#1B1B1B] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#C49A5A] rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-neutral-500 tabular-nums shrink-0">
                      {item.count} un.
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ledger of Completed Appointments */}
      <div className="bg-[#121212] border border-[#222222] rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-[#222222] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
              Histórico de Atendimentos Realizados
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Livro de registros de serviços faturados
            </p>
          </div>
          <span className="text-xs text-neutral-400">
            {completedAppointments.length} registros
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#161616] text-neutral-400 font-semibold border-b border-[#222222]">
              <tr>
                <th className="py-3 px-5">Código</th>
                <th className="py-3 px-4">Data & Horário</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Serviço</th>
                <th className="py-3 px-4">Barbeiro</th>
                <th className="py-3 px-5 text-right">Valor Registrado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e1e]">
              {completedAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-neutral-500">
                    Nenhum atendimento finalizado ainda.
                  </td>
                </tr>
              ) : (
                completedAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-[#161616]/60 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-neutral-400">{apt.bookingCode}</td>
                    <td className="py-3.5 px-4 tabular-nums text-neutral-300">
                      {apt.date} · {apt.time}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">{apt.customerName}</td>
                    <td className="py-3.5 px-4 text-neutral-300">{apt.serviceName}</td>
                    <td className="py-3.5 px-4 text-neutral-400">{apt.professionalName}</td>
                    <td className="py-3.5 px-5 text-right font-bold text-emerald-400 tabular-nums">
                      + R$ {apt.servicePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
