import { useState, useEffect } from 'react';
import { penjualanService } from '../services';
import { formatRupiah, formatTanggalJam, getStatusBadge } from '../utils/helpers';
import { FiSearch, FiEye, FiShoppingBag } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const PenjualanPage = () => {
  const { isAdmin } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [detail, setDetail] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await penjualanService.getAll({ search, status, page, limit: 10 });
      setData(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [search, status, page]);

  const handleViewDetail = async (id) => {
    try {
      const res = await penjualanService.getById(id);
      setDetail(res.data.data);
    } catch (err) {
      toast.error('Gagal memuat detail');
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await penjualanService.updateStatus(id, newStatus);
      toast.success('Status berhasil diupdate');
      fetchData();
      setDetail(null);
    } catch (err) {
      toast.error('Gagal update status');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Riwayat Penjualan</h1>
          <p className="page-subtitle">Total {pagination.total || 0} transaksi</p>
        </div>
      </div>

      <div className="search-bar">
        <div className="search-input-wrapper" style={{ flex: 1 }}>
          <FiSearch className="search-input-icon" />
          <input
            id="search-penjualan"
            type="text"
            className="search-input"
            placeholder="Cari nomor transaksi atau pelanggan..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          id="filter-status"
          className="form-control"
          style={{ width: 'auto' }}
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
        >
          <option value="">Semua Status</option>
          <option value="selesai">Selesai</option>
          <option value="pending">Pending</option>
          <option value="batal">Batal</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          {loading ? (
            <div className="loading-overlay"><div className="loading-spinner" /></div>
          ) : data.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><FiShoppingBag /></div>
              <div className="empty-state-text">Belum ada transaksi</div>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>No. Transaksi</th>
                  <th>Pelanggan</th>
                  <th>Kasir</th>
                  <th>Total Bayar</th>
                  <th>Metode</th>
                  <th>Waktu</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map(item => {
                  const statusInfo = getStatusBadge(item.status);
                  return (
                    <tr key={item.id}>
                      <td>
                        <code style={{
                          background: 'var(--primary-subtle)', color: 'var(--primary-light)',
                          padding: '2px 8px', borderRadius: 4, fontSize: 12,
                        }}>{item.nomor_transaksi}</code>
                      </td>
                      <td>{item.pelanggan_nama || 'Umum'}</td>
                      <td>{item.kasir_nama}</td>
                      <td style={{ color: 'var(--success)', fontWeight: 600 }}>
                        {formatRupiah(item.total_bayar)}
                      </td>
                      <td>
                        <span style={{ textTransform: 'capitalize' }}>{item.metode_pembayaran}</span>
                      </td>
                      <td style={{ fontSize: 12 }}>{formatTanggalJam(item.tanggal)}</td>
                      <td>
                        <span className={`badge badge-${statusInfo.color}`}>{statusInfo.label}</span>
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary btn-icon btn-sm"
                          onClick={() => handleViewDetail(item.id)}
                          title="Lihat Detail"
                        ><FiEye /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        {pagination.totalPages > 1 && (
          <div className="pagination" style={{ padding: 16 }}>
            <button className="pagination-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} className={`pagination-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button className="pagination-btn" onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}>›</button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDetail(null)}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Detail Transaksi</h3>
                <p style={{ fontSize: 13, color: 'var(--primary-light)', marginTop: 2 }}>
                  {detail.nomor_transaksi}
                </p>
              </div>
              <button className="btn btn-secondary btn-icon btn-sm" onClick={() => setDetail(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-row" style={{ marginBottom: 16 }}>
                <div>
                  <div className="form-label">Pelanggan</div>
                  <strong>{detail.pelanggan_nama || 'Umum'}</strong>
                </div>
                <div>
                  <div className="form-label">Kasir</div>
                  <strong>{detail.kasir_nama}</strong>
                </div>
                <div>
                  <div className="form-label">Waktu</div>
                  <strong>{formatTanggalJam(detail.tanggal)}</strong>
                </div>
                <div>
                  <div className="form-label">Status</div>
                  <span className={`badge badge-${getStatusBadge(detail.status).color}`}>
                    {getStatusBadge(detail.status).label}
                  </span>
                </div>
              </div>

              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr><th>Produk</th><th>Harga</th><th>Qty</th><th>Subtotal</th></tr>
                  </thead>
                  <tbody>
                    {detail.items?.map(item => (
                      <tr key={item.id}>
                        <td style={{ color: 'var(--text-primary)' }}>{item.nama_produk}</td>
                        <td>{formatRupiah(item.harga_satuan)}</td>
                        <td>{item.jumlah}</td>
                        <td style={{ color: 'var(--success)', fontWeight: 600 }}>
                          {formatRupiah(item.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: 16, textAlign: 'right' }}>
                {detail.diskon > 0 && (
                  <div className="pos-summary-row" style={{ justifyContent: 'flex-end', gap: 40, marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Diskon</span>
                    <span>-{formatRupiah(detail.diskon)}</span>
                  </div>
                )}
                <div style={{ fontSize: 18, fontWeight: 700 }}>
                  Total: <span style={{ color: 'var(--primary-light)' }}>{formatRupiah(detail.total_bayar)}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                  Metode: {detail.metode_pembayaran}
                  {detail.kembalian > 0 && ` | Kembalian: ${formatRupiah(detail.kembalian)}`}
                </div>
              </div>
            </div>
            {isAdmin && detail.status !== 'batal' && (
              <div className="modal-footer">
                <button
                  className="btn btn-danger"
                  onClick={() => handleUpdateStatus(detail.id, 'batal')}
                >
                  Batalkan Transaksi
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PenjualanPage;
