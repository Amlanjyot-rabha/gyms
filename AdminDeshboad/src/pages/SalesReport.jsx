import { useEffect, useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import axiosInstance from '../utils/axiosInstance';
import './SalesReport.css';

/* ── helpers ─────────────────────────────────────────────── */
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const BAR_COLOR_INCOME = '#2563eb';
const BAR_COLOR_ATT    = '#16a34a';

function fmt(n) {
  return typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : '₹0';
}

function fmtDate(d) {
  if (!d) return 'N/A';
  const dt = new Date(d);
  return `${dt.getDate()} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`;
}

/* ── Tooltip customisation ───────────────────────────────── */
const IncomeTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="sr-tooltip">
      <p className="sr-tooltip-label">{label}</p>
      <p className="sr-tooltip-val">{fmt(payload[0].value)}</p>
    </div>
  );
};
const AttTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="sr-tooltip">
      <p className="sr-tooltip-label">{label}</p>
      <p className="sr-tooltip-val">{payload[0].value} visits</p>
    </div>
  );
};

/* ── Main Component ──────────────────────────────────────── */
export default function SalesReport() {
  const [members, setMembers]       = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('all'); // 'all' | 0-11

  useEffect(() => {
    const load = async () => {
      try {
        const [mRes, aRes] = await Promise.all([
          axiosInstance.get('/admin/members'),
          axiosInstance.get('/admin/attendance'),
        ]);
        setMembers(mRes.data.data   || []);
        setAttendance(aRes.data.data || []);
      } catch (e) {
        console.error('SalesReport fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ── year of the report (current year) ─── */
  const YEAR = new Date().getFullYear();

  /* ── filter helpers ───────────────────── */
  const isThisYear  = (dateStr) => new Date(dateStr).getFullYear() === YEAR;
  const getMonth    = (dateStr) => new Date(dateStr).getMonth(); // 0-11

  /* ── YEARLY DATA ──────────────────────── */
  const yearlyIncome = useMemo(() => {
    const data = MONTH_SHORT.map((m, idx) => ({ month: m, income: 0 }));
    members.forEach(mem => {
      const start = mem.membershipStart || mem.createdAt;
      if (!start || !isThisYear(start)) return;
      const mi = getMonth(start);
      data[mi].income += mem.price || 0;
    });
    return data;
  }, [members]);

  const yearlyAttendance = useMemo(() => {
    const data = MONTH_SHORT.map((m) => ({ month: m, visits: 0 }));
    attendance.forEach(att => {
      const d = att.date || att.checkIn || att.createdAt;
      if (!d || !isThisYear(d)) return;
      const mi = getMonth(d);
      data[mi].visits += 1;
    });
    return data;
  }, [attendance]);

  const totalYearlyIncome     = yearlyIncome.reduce((s, d) => s + d.income, 0);
  const totalYearlyAttendance = yearlyAttendance.reduce((s, d) => s + d.visits, 0);

  /* yearly plan summary — new memberships only (not renewals) */
  const yearlyPlanSummary = useMemo(() => {
    const planMap = {};
    members.forEach(mem => {
      const start = mem.membershipStart || mem.createdAt;
      if (!start || !isThisYear(start)) return;
      // Exclude renewals: if isRenewal flag exists and is true, skip
      if (mem.isRenewal === true) return;
      const plan = mem.membershipType || 'Unknown';
      if (!planMap[plan]) planMap[plan] = { members: 0, totalAmount: 0 };
      planMap[plan].members     += 1;
      planMap[plan].totalAmount += mem.price || 0;
    });
    return Object.entries(planMap).map(([plan, v]) => ({ plan, ...v }));
  }, [members]);

  const planTotalMembers = yearlyPlanSummary.reduce((s, r) => s + r.members, 0);
  const planTotalRevenue = yearlyPlanSummary.reduce((s, r) => s + r.totalAmount, 0);

  /* ── MONTHLY DATA ─────────────────────── */
  const monthIdx = selectedMonth === 'all' ? -1 : Number(selectedMonth);

  const monthlyIncome = useMemo(() => {
    if (monthIdx < 0) return [];
    const daysInMonth = new Date(YEAR, monthIdx + 1, 0).getDate();
    const data = Array.from({ length: daysInMonth }, (_, i) => ({ day: `${i + 1}`, income: 0 }));
    members.forEach(mem => {
      const start = mem.membershipStart || mem.createdAt;
      if (!start) return;
      const d = new Date(start);
      if (d.getFullYear() !== YEAR || d.getMonth() !== monthIdx) return;
      data[d.getDate() - 1].income += mem.price || 0;
    });
    return data;
  }, [members, monthIdx]);

  const monthlyAttendance = useMemo(() => {
    if (monthIdx < 0) return [];
    const daysInMonth = new Date(YEAR, monthIdx + 1, 0).getDate();
    const data = Array.from({ length: daysInMonth }, (_, i) => ({ day: `${i + 1}`, visits: 0 }));
    attendance.forEach(att => {
      const rawDate = att.date || att.checkIn || att.createdAt;
      if (!rawDate) return;
      const d = new Date(rawDate);
      if (d.getFullYear() !== YEAR || d.getMonth() !== monthIdx) return;
      data[d.getDate() - 1].visits += 1;
    });
    return data;
  }, [attendance, monthIdx]);

  const totalMonthlyIncome     = monthlyIncome.reduce((s, d) => s + d.income, 0);
  const totalMonthlyAttendance = monthlyAttendance.reduce((s, d) => s + d.visits, 0);

  /* monthly new members table — no renewals */
  const newMonthlyMembers = useMemo(() => {
    if (monthIdx < 0) return [];
    return members.filter(mem => {
      const start = mem.membershipStart || mem.createdAt;
      if (!start) return false;
      const d = new Date(start);
      if (d.getFullYear() !== YEAR || d.getMonth() !== monthIdx) return false;
      if (mem.isRenewal === true) return false;
      return true;
    });
  }, [members, monthIdx]);

  /* ── EXPORT ───────────────────────────── */
  const exportPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF();
    const title = selectedMonth === 'all'
      ? `Yearly Sales Report — ${YEAR}`
      : `Monthly Sales Report — ${MONTHS[monthIdx]} ${YEAR}`;
    doc.setFontSize(16);
    doc.text(title, 14, 18);

    if (selectedMonth === 'all') {
      // Income table
      doc.setFontSize(12);
      doc.text('Monthly Income', 14, 30);
      autoTable(doc, {
        startY: 34,
        head: [['Month', 'Income']],
        body: yearlyIncome.map(r => [r.month, fmt(r.income)]),
        foot: [['Total', fmt(totalYearlyIncome)]],
      });
      // Attendance table
      doc.text('Monthly Attendance', 14, doc.lastAutoTable.finalY + 10);
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 14,
        head: [['Month', 'Visits']],
        body: yearlyAttendance.map(r => [r.month, r.visits]),
        foot: [['Total', totalYearlyAttendance]],
      });
      // Plan summary
      doc.text('Plan Summary (New Memberships)', 14, doc.lastAutoTable.finalY + 10);
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 14,
        head: [['Plan', 'Members', 'Total Amount']],
        body: yearlyPlanSummary.map(r => [r.plan, r.members, fmt(r.totalAmount)]),
        foot: [['Total', planTotalMembers, fmt(planTotalRevenue)]],
      });
    } else {
      // Income
      doc.setFontSize(12);
      doc.text('Daily Income', 14, 30);
      autoTable(doc, {
        startY: 34,
        head: [['Day', 'Income']],
        body: monthlyIncome.map(r => [r.day, fmt(r.income)]),
        foot: [['Total', fmt(totalMonthlyIncome)]],
      });
      // Attendance
      doc.text('Daily Attendance', 14, doc.lastAutoTable.finalY + 10);
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 14,
        head: [['Day', 'Visits']],
        body: monthlyAttendance.map(r => [r.day, r.visits]),
        foot: [['Total', totalMonthlyAttendance]],
      });
      // New members
      doc.text('New Members', 14, doc.lastAutoTable.finalY + 10);
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 14,
        head: [['Name', 'Plan', 'Amount', 'Date of Joining']],
        body: newMonthlyMembers.map(m => [
          m.userId?.name || 'Unknown',
          m.membershipType || 'N/A',
          fmt(m.price),
          fmtDate(m.membershipStart || m.createdAt),
        ]),
      });
    }
    doc.save(`sales_report_${selectedMonth === 'all' ? YEAR : MONTHS[monthIdx]}.pdf`);
  };

  const exportExcel = async () => {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();

    if (selectedMonth === 'all') {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
        yearlyIncome.map(r => ({ Month: r.month, Income: r.income }))
      ), 'Monthly Income');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
        yearlyAttendance.map(r => ({ Month: r.month, Visits: r.visits }))
      ), 'Monthly Attendance');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
        yearlyPlanSummary.map(r => ({ Plan: r.plan, Members: r.members, 'Total Amount': r.totalAmount }))
      ), 'Plan Summary');
    } else {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
        monthlyIncome.map(r => ({ Day: r.day, Income: r.income }))
      ), 'Daily Income');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
        monthlyAttendance.map(r => ({ Day: r.day, Visits: r.visits }))
      ), 'Daily Attendance');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
        newMonthlyMembers.map(m => ({
          Name: m.userId?.name || 'Unknown',
          Plan: m.membershipType || 'N/A',
          Amount: m.price || 0,
          'Date of Joining': fmtDate(m.membershipStart || m.createdAt),
        }))
      ), 'New Members');
    }
    XLSX.writeFile(wb, `sales_report_${selectedMonth === 'all' ? YEAR : MONTHS[monthIdx]}.xlsx`);
  };

  /* ── RENDER ───────────────────────────── */
  if (loading) {
    return (
      <div className="page-container">
        <div className="sr-loading">Loading sales data…</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Sales Report</h1>
          <p className="sr-subtitle">
            {selectedMonth === 'all'
              ? `Full Year Overview — ${YEAR}`
              : `${MONTHS[monthIdx]} ${YEAR} Report`}
          </p>
        </div>
        <div className="sr-header-actions">
          <select
            id="sr-month-filter"
            className="sr-month-select"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
          >
            <option value="all">All Year</option>
            {MONTHS.map((m, i) => (
              <option key={m} value={i}>{m}</option>
            ))}
          </select>
          <button className="btn-action btn-outline" id="sr-export-excel" onClick={exportExcel}>
            ↓ Export Excel
          </button>
          <button className="btn-action" id="sr-export-pdf" onClick={exportPDF}>
            ↓ Export PDF
          </button>
        </div>
      </div>

      {/* ── YEARLY MODE ──────────────────── */}
      {selectedMonth === 'all' ? (
        <>
          {/* Section 1 — Yearly Income */}
          <section className="sr-section card">
            <div className="sr-section-header">
              <h2 className="sr-section-title">Yearly Income</h2>
              <span className="sr-stat-badge">{fmt(totalYearlyIncome)}</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={yearlyIncome} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f1f3" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<IncomeTooltip />} />
                <Bar dataKey="income" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {yearlyIncome.map((_, i) => (
                    <Cell key={i} fill={BAR_COLOR_INCOME} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="sr-summary-row">
              <span className="sr-summary-label">Total Yearly Income</span>
              <span className="sr-summary-value">{fmt(totalYearlyIncome)}</span>
            </div>
          </section>

          {/* Section 2 — Yearly Attendance */}
          <section className="sr-section card">
            <div className="sr-section-header">
              <h2 className="sr-section-title">Yearly Attendance</h2>
              <span className="sr-stat-badge sr-stat-badge--green">{totalYearlyAttendance} visits</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={yearlyAttendance} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f1f3" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} allowDecimals={false} />
                <Tooltip content={<AttTooltip />} />
                <Bar dataKey="visits" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {yearlyAttendance.map((_, i) => (
                    <Cell key={i} fill={BAR_COLOR_ATT} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="sr-summary-row">
              <span className="sr-summary-label">Total Yearly Attendance</span>
              <span className="sr-summary-value sr-summary-value--green">{totalYearlyAttendance}</span>
            </div>
          </section>

          {/* Section 3 — Yearly Plan Summary */}
          <section className="sr-section card">
            <div className="sr-section-header">
              <h2 className="sr-section-title">Yearly Plan Summary</h2>
              <span className="sr-sub-label">New memberships only</span>
            </div>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Plan</th>
                    <th>Yearly Members</th>
                    <th>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {yearlyPlanSummary.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="sr-empty-cell">No new memberships this year.</td>
                    </tr>
                  ) : (
                    yearlyPlanSummary.map(row => (
                      <tr key={row.plan}>
                        <td><span className="sr-plan-badge">{row.plan}</span></td>
                        <td>{row.members}</td>
                        <td>{fmt(row.totalAmount)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                {yearlyPlanSummary.length > 0 && (
                  <tfoot>
                    <tr className="sr-tfoot">
                      <td><strong>Total</strong></td>
                      <td><strong>{planTotalMembers}</strong></td>
                      <td><strong>{fmt(planTotalRevenue)}</strong></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </section>
        </>
      ) : (
        /* ── MONTHLY MODE ──────────────────── */
        <>
          {/* Section 1 — Monthly Income */}
          <section className="sr-section card">
            <div className="sr-section-header">
              <h2 className="sr-section-title">Monthly Income — {MONTHS[monthIdx]}</h2>
              <span className="sr-stat-badge">{fmt(totalMonthlyIncome)}</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyIncome} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f1f3" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6b7280' }} interval={1} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={v => `₹${v}`} />
                <Tooltip content={<IncomeTooltip />} />
                <Bar dataKey="income" radius={[4, 4, 0, 0]} maxBarSize={18}>
                  {monthlyIncome.map((_, i) => (
                    <Cell key={i} fill={BAR_COLOR_INCOME} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="sr-summary-row">
              <span className="sr-summary-label">Total Monthly Income</span>
              <span className="sr-summary-value">{fmt(totalMonthlyIncome)}</span>
            </div>
          </section>

          {/* Section 2 — Monthly Attendance */}
          <section className="sr-section card">
            <div className="sr-section-header">
              <h2 className="sr-section-title">Monthly Attendance — {MONTHS[monthIdx]}</h2>
              <span className="sr-stat-badge sr-stat-badge--green">{totalMonthlyAttendance} visits</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyAttendance} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f1f3" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6b7280' }} interval={1} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} allowDecimals={false} />
                <Tooltip content={<AttTooltip />} />
                <Bar dataKey="visits" radius={[4, 4, 0, 0]} maxBarSize={18}>
                  {monthlyAttendance.map((_, i) => (
                    <Cell key={i} fill={BAR_COLOR_ATT} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="sr-summary-row">
              <span className="sr-summary-label">Total Monthly Attendance</span>
              <span className="sr-summary-value sr-summary-value--green">{totalMonthlyAttendance}</span>
            </div>
          </section>

          {/* Section 3 — New Members Table */}
          <section className="sr-section card">
            <div className="sr-section-header">
              <h2 className="sr-section-title">New Members — {MONTHS[monthIdx]}</h2>
              <span className="sr-sub-label">Excludes renewals</span>
            </div>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Plan</th>
                    <th>Amount</th>
                    <th>Date of Joining</th>
                  </tr>
                </thead>
                <tbody>
                  {newMonthlyMembers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="sr-empty-cell">No new members this month.</td>
                    </tr>
                  ) : (
                    newMonthlyMembers.map(mem => (
                      <tr key={mem._id}>
                        <td style={{ fontWeight: 500 }}>{mem.userId?.name || 'Unknown'}</td>
                        <td><span className="sr-plan-badge">{mem.membershipType || 'N/A'}</span></td>
                        <td>{fmt(mem.price)}</td>
                        <td>{fmtDate(mem.membershipStart || mem.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
