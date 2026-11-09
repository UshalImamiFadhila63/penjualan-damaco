import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { penawaranService } from '../services';
import { formatRupiah, formatTanggalJam } from '../utils/helpers';

const statusOptions = ['menunggu', 'diproses', 'diterima', 'ditolak'];

const OffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const response = await penawaranService.getAll();
      setOffers(response.data.data.map((offer) => ({
        ...offer,
        items: typeof offer.items === 'string' ? JSON.parse(offer.items) : offer.items,
      })));
    } catch {
      toast.error('Gagal memuat permintaan penawaran');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const updateStatus = async (offer, status) => {
    try {
      await penawaranService.updateStatus(offer.id, status);
      toast.success(`Status ${offer.nomor_penawaran} diperbarui`);
      fetchOffers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memperbarui status');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Permintaan Penawaran</h1>
          <p className="page-subtitle">{offers.length} permintaan customer</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-overlay"><div className="loading-spinner" /></div>
      ) : offers.length === 0 ? (
        <div className="card empty-state"><div className="empty-state-text">Belum ada permintaan penawaran.</div></div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table className="table">
              <thead><tr><th>Nomor</th><th>Customer</th><th>Produk</th><th>Catatan</th><th>Dibuat</th><th>Status</th></tr></thead>
              <tbody>
                {offers.map((offer) => (
                  <tr key={offer.id}>
                    <td>{offer.nomor_penawaran}</td>
                    <td>{offer.customer_nama}<br /><small>{offer.customer_email}{offer.customer_telepon ? ` · ${offer.customer_telepon}` : ''}</small></td>
                    <td>{offer.items?.map((item, index) => (
                      <div key={`${offer.id}-${index}`}>{item.nama_produk} × {item.jumlah} · {formatRupiah(item.harga_satuan)}</div>
                    ))}</td>
                    <td>{offer.catatan || '-'}</td>
                    <td>{formatTanggalJam(offer.created_at)}</td>
                    <td>
                      <select className="form-control" aria-label={`Status ${offer.nomor_penawaran}`}
                        value={offer.status} onChange={(event) => updateStatus(offer, event.target.value)}>
                        {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
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

export default OffersPage;
