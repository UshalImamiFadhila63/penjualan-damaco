import { useEffect, useState } from 'react';
import { penjualanService } from '../services';
import { formatRupiah, formatTanggal } from '../utils/helpers';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import {
  FiShoppingBag, FiDollarSign, FiPackage, FiUsers,
  FiAlertTriangle, FiTrendingUp,
} from 'react-icons/fi';

const StatCard = ({ icon, label, value, sub, color }) => (
  <div className="stat-card">
    <div className="stat-card-icon" style={{ background: `${color}20`, color }}>
      {icon}
    </div>
    <div className="stat-card-label">{label}</div>
    <div className="stat-card-value">{value}</div>
    {sub && <div className="stat-card-sub">{sub}</div>}
  </div>
);

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await penjualanService.getDashboard();
        setData(res.data.data);
      } catch (err) {
        console.error('Gagal load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="loading-spinner" />
      </div>
    );
  }

  const grafikData = data?.grafik_penjualan?.map(g => ({
    tanggal: formatTanggal(g.tanggal, { day: '2-digit', month: 'short' }),
    pendapatan: parseFloat(g.total_pendapatan),
    transaksi: parseInt(g.total_transaksi),
  })) || [];

  return (
    <div>
      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard
          icon={<FiDollarSign />}
          label="Pendapatan Hari Ini"
          value={formatRupiah(data?.hari_ini?.total_pendapatan || 0)}
          sub={`${data?.hari_ini?.total_transaksi || 0} transaksi`}
          color="var(--primary)"
        />
        <StatCard
          icon={<FiTrendingUp />}
          label="Pendapatan Bulan Ini"
          value={formatRupiah(data?.bulan_ini?.total_pendapatan || 0)}
          sub={`${data?.bulan_ini?.total_transaksi || 0} transaksi`}
          color="var(--secondary)"
        />
        <StatCard
          icon={<FiPackage />}
          label="Total Produk"
          value={data?.total_produk || 0}
          sub="produk aktif"
          color="var(--success)"
        />
        <StatCard
          icon={<FiUsers />}
          label="Total Pelanggan"
          value={data?.total_pelanggan || 0}
          sub="pelanggan terdaftar"
          color="var(--warning)"
        />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">📈 Grafik Pendapatan 7 Hari</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={grafikData}>
              <defs>
                <linearGradient id="colorPendapatan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tanggal" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [formatRupiah(v), 'Pendapatan']} />
              <Area
                type="monotone" dataKey="pendapatan"
                stroke="var(--primary)" fill="url(#colorPendapatan)" strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">🏆 Produk Terlaris Bulan Ini</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.produk_terlaris || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="nama" type="category" tick={{ fontSize: 11 }} width={100} />
              <Tooltip formatter={(v) => [`${v} pcs`, 'Terjual']} />
              <Bar dataKey="total_terjual" fill="var(--secondary)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stok Menipis */}
      {data?.stok_menipis?.length > 0 && (
        <div className="card">
          <div className="card-header">
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiAlertTriangle style={{ color: 'var(--warning)' }} />
              Peringatan Stok Menipis
            </span>
          </div>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>Stok Tersisa</th>
                  <th>Stok Minimum</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.stok_menipis.map(item => (
                  <tr key={item.id}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.nama}</td>
                    <td className={item.stok === 0 ? 'stock-low' : 'stock-warning'}>
                      {item.stok}
                    </td>
                    <td>{item.stok_minimum}</td>
                    <td>
                      <span className={`badge ${item.stok === 0 ? 'badge-danger' : 'badge-warning'}`}>
                        {item.stok === 0 ? 'Habis' : 'Menipis'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
