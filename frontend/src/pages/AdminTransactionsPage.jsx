import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminService } from '../services';
import { responseData } from '../services/api';

const poStatuses = [
  'PO_RECEIVED',
  'DEALER_VERIFIED',
  'AWAITING_PAYMENT',
  'PAID',
  'SHIPPED',
  'RECEIVED',
  'COMPLETED',
];
const toArray = (response) => {
  const data = responseData(response);
  return Array.isArray(data) ? data : [];
};
const currency = (value) => Number(value || 0).toLocaleString('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export default function AdminTransactionsPage() {
  const [requests, setRequests] = useState([]);
  const [offers, setOffers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [offerPrices, setOfferPrices] = useState({});
  const [validUntil, setValidUntil] = useState('');
  const [offerNotes, setOfferNotes] = useState('');
  const [dealerSelections, setDealerSelections] = useState({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [requestResponse, offerResponse, orderResponse, dealerResponse] = await Promise.all([
        adminService.list('quotation-requests'),
        adminService.list('offers'),
        adminService.list('purchase-orders'),
        adminService.list('dealers'),
      ]);
      setRequests(toArray(requestResponse));
      setOffers(toArray(offerResponse));
      setOrders(toArray(orderResponse));
      setDealers(toArray(dealerResponse).filter((dealer) => dealer.is_active));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Data transaksi belum dapat dimuat.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function startOffer(request) {
    setSelectedRequest(request);
    setOfferPrices(Object.fromEntries((request.items || []).map((item) => [item.product_id, ''])));
    setOfferNotes('');
    setValidUntil('');
  }

  async function createOffer(event) {
    event.preventDefault();
    if (!selectedRequest) return;
    setBusy(true);
    try {
      await adminService.create('offers', {
        quotation_request_id: selectedRequest.id,
        valid_until: validUntil || null,
        notes: offerNotes || null,
        items: selectedRequest.items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: Number(offerPrices[item.product_id]),
        })),
      });
      setSelectedRequest(null);
      toast.success('Penawaran berhasil dikirim ke customer.');
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Penawaran belum dapat dibuat.');
    } finally {
      setBusy(false);
    }
  }

  async function createPurchaseOrder(offer) {
    const dealerId = Number(dealerSelections[offer.id]);
    if (!dealerId) {
      toast.error('Pilih dealer terlebih dahulu.');
      return;
    }
    setBusy(true);
    try {
      await adminService.create('purchase-orders', {
        quotation_id: offer.id,
        dealer_id: dealerId,
      });
      toast.success('Purchase order berhasil dibuat.');
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Purchase order belum dapat dibuat.');
    } finally {
      setBusy(false);
    }
  }

  async function advanceOrder(order) {
    const current = poStatuses.indexOf(order.status);
    const nextStatus = poStatuses[current + 1];
    if (!nextStatus) return;
    setBusy(true);
    try {
      await adminService.updatePurchaseOrderStatus(order.id, { status: nextStatus });
      toast.success(`Status PO menjadi ${nextStatus}.`);
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Status purchase order belum dapat diperbarui.');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <section className="panel"><p className="empty-state">Memuat transaksi…</p></section>;

  return <div className="account-content">
    <section className="panel">
      <div className="section-heading"><div><p className="eyebrow">TRANSAKSI CUSTOMER</p><h1>Permintaan penawaran</h1></div></div>
      {requests.length === 0 ? <p className="empty-state">Belum ada permintaan masuk.</p> : <div className="cart-list">
        {requests.map((request) => <article className="cart-row" key={request.id}>
          <div>
            <strong>{request.request_number} · {request.customer_name}</strong>
            <p className="muted">{request.customer_email} · {request.status} · {new Date(request.created_at).toLocaleDateString('id-ID')}</p>
            {request.items?.map((item) => <div key={`${request.id}-${item.product_id}`}>{item.product_name} × {item.quantity}</div>)}
            {request.notes && <p>{request.notes}</p>}
          </div>
          <button className="button primary" disabled={busy || request.status !== 'SUBMITTED' || !request.items?.length} onClick={() => startOffer(request)}>
            {request.status === 'SUBMITTED' ? 'Buat penawaran' : 'Sudah diproses'}
          </button>
        </article>)}
      </div>}
      {selectedRequest && <form className="form-stack offer-editor" onSubmit={createOffer}>
        <h2>Penawaran untuk {selectedRequest.request_number}</h2>
        {selectedRequest.items.map((item) => <label key={item.product_id}>{item.product_name} × {item.quantity} — harga satuan
          <input required type="number" min="0" step="0.01" value={offerPrices[item.product_id] ?? ''}
            onChange={(event) => setOfferPrices({ ...offerPrices, [item.product_id]: event.target.value })} />
        </label>)}
        <label>Berlaku sampai<input type="date" value={validUntil} onChange={(event) => setValidUntil(event.target.value)} /></label>
        <label>Catatan<textarea rows="3" value={offerNotes} onChange={(event) => setOfferNotes(event.target.value)} /></label>
        <div className="form-actions"><button className="button primary" disabled={busy}>{busy ? 'Mengirim…' : 'Kirim penawaran'}</button><button type="button" className="button light" onClick={() => setSelectedRequest(null)}>Batal</button></div>
      </form>}
    </section>

    <section className="panel">
      <div className="section-heading"><div><p className="eyebrow">PENAWARAN</p><h2>Penawaran terkirim</h2></div></div>
      {offers.length === 0 ? <p className="empty-state">Belum ada penawaran.</p> : <div className="cart-list">
        {offers.map((offer) => <article className="cart-row" key={offer.id}>
          <div><strong>{offer.offer_number} · {offer.customer_name}</strong><p className="muted">{offer.customer_email} · {offer.status}</p>
            {offer.items?.map((item) => <div key={`${offer.id}-${item.product_id}`}>{item.product_name} × {item.quantity} · {currency(item.unit_price)}</div>)}
          </div>
          {offer.status === 'ACCEPTED' && <div className="form-actions">
            <select aria-label={`Dealer untuk ${offer.offer_number}`} value={dealerSelections[offer.id] || ''} onChange={(event) => setDealerSelections({ ...dealerSelections, [offer.id]: event.target.value })}>
              <option value="">Pilih dealer</option>{dealers.map((dealer) => <option key={dealer.id} value={dealer.id}>{dealer.name}</option>)}
            </select>
            <button className="button primary" disabled={busy} onClick={() => createPurchaseOrder(offer)}>Buat PO</button>
          </div>}
        </article>)}
      </div>}
    </section>

    <section className="panel">
      <div className="section-heading"><div><p className="eyebrow">PURCHASE ORDER</p><h2>Daftar PO</h2></div></div>
      {orders.length === 0 ? <p className="empty-state">Belum ada purchase order.</p> : <div className="cart-list">
        {orders.map((order) => <article className="cart-row" key={order.id}>
          <div><strong>{order.po_number}</strong><p className="muted">{order.dealer_name} · {order.customer_name || 'Tanpa customer'} · {order.status}</p>
            <strong>{currency(order.total_amount)}</strong>
          </div>
          {poStatuses.indexOf(order.status) < poStatuses.length - 1 && <button className="button light" disabled={busy} onClick={() => advanceOrder(order)}>Lanjutkan ke {poStatuses[poStatuses.indexOf(order.status) + 1]}</button>}
        </article>)}
      </div>}
    </section>
  </div>;
}
