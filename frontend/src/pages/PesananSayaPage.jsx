import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FiSearch,
  FiChevronRight,
  FiChevronLeft,
  FiGrid,
  FiArrowRight,
  FiFileText,
  FiCheckCircle,
  FiClock,
  FiTruck,
  FiAlertCircle,
  FiX,
  FiPrinter,
  FiDownload,
  FiEye,
  FiCreditCard,
  FiCheck,
  FiShare2,
  FiLock,
  FiUpload,
  FiEdit3,
  FiTrash2,
} from 'react-icons/fi';
import KatalogHeader from '../components/KatalogHeader';
import PermintaanDrawer from '../components/PermintaanDrawer';
import ProfilPerusahaanModal from '../components/ProfilPerusahaanModal';
import CustomerPortalModal from '../components/CustomerPortalModal';
import KirimPoModal from '../components/KirimPoModal';
import UploadBuktiPembayaranModal from '../components/UploadBuktiPembayaranModal';
import UbahPesananModal from '../components/UbahPesananModal';
import BatalPesananModal from '../components/BatalPesananModal';
import CustomerFooter from '../components/CustomerFooter';
import { useDamaco } from '../context/DamacoContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const CUSTOMER_ORDERS_DATA = [
  {
    id: 'c-ord-01',
    nomor: 'QT/2026/11/0021',
    ringkasan: '2× Atlas M4 RTK',
    items: [
      { nama: 'Atlas M4 RTK', qty: 2, harga: 148500000 },
    ],
    tanggal: '11 Nov 2026',
    total: 297000000,
    statusText: 'Menunggu Penawaran',
    statusType: 'menunggu_penawaran',
    isGiliranAnda: false,
    tabCategory: 'berjalan',
    keterangan: 'Tim Commercial Damaco sedang memverifikasi spesifikasi teknis dan ketersediaan unit di gudang.',
  },
  {
    id: 'c-ord-02',
    nomor: 'QT/2026/11/0011',
    ringkasan: '1× Starter Pack Survei Atlas',
    items: [
      { nama: 'Starter Pack Survei Atlas', qty: 1, harga: 159900000 },
    ],
    tanggal: '10 Nov 2026',
    total: 159900000,
    statusText: 'Penawaran Terbit',
    statusType: 'penawaran_terbit',
    isGiliranAnda: true,
    actionPrompt: 'Setujui Penawaran & Input Nomor PO Resmi',
    tabCategory: 'perlu_tindakan',
    keterangan: 'Dokumen penawaran harga resmi (Quotation) telah diterbitkan. Silakan tinjau dan terbitkan PO resmi perusahaan Anda.',
  },
  {
    id: 'c-ord-03',
    nomor: 'QT/2026/11/0010',
    ringkasan: '2× Starter Pack Lumen Pro',
    items: [
      { nama: 'Starter Pack Cinema Lumen 5', qty: 2, harga: 47900000 },
    ],
    tanggal: '9 Nov 2026',
    total: 95800000,
    statusText: 'PO Diterima',
    statusType: 'po_diterima',
    isGiliranAnda: false,
    tabCategory: 'berjalan',
    keterangan: 'PO resmi telah diterima oleh sistem Damaco dan sedang diproses verifikasi keabsahan dokumen.',
  },
  {
    id: 'c-ord-04',
    nomor: 'QT/2026/11/0009',
    ringkasan: '1× Agri 40',
    items: [
      { nama: 'Agri 40 High-Capacity Sprayer', qty: 1, harga: 189000000 },
    ],
    tanggal: '7 Nov 2026',
    total: 189000000,
    statusText: 'PO Dikonfirmasi',
    statusType: 'po_dikonfirmasi',
    isGiliranAnda: false,
    tabCategory: 'berjalan',
    keterangan: 'PO resmi disetujui. Dokumen tagihan (Invoice Proforma & Faktur Pajak) sedang dipersiapkan divisi Finance.',
  },
  {
    id: 'c-ord-05',
    nomor: 'QT/2026/11/0008',
    ringkasan: 'Starter Pack Agri 20 +1 lainnya',
    items: [
      { nama: 'Starter Pack Agri 20', qty: 1, harga: 143900000 },
      { nama: 'Generator Genset Fast-Charge 7200W', qty: 1, harga: 29600000 },
    ],
    tanggal: '5 Nov 2026',
    total: 173500000,
    statusText: 'Proses Dealer',
    statusType: 'proses_dealer',
    isGiliranAnda: false,
    tabCategory: 'berjalan',
    keterangan: 'Alokasi nomor seri unit drone dan kalibrasi sensor sedang dikerjakan authorized dealer Damaco.',
  },
  {
    id: 'c-ord-06',
    nomor: 'QT/2026/11/0007',
    ringkasan: 'Terra Wing S2 +1 lainnya',
    items: [
      { nama: 'Terra Wing S2 Fixed Wing', qty: 1, harga: 144000000 },
      { nama: 'Baterai Cadangan Ultra Endurance', qty: 1, harga: 16200000 },
    ],
    tanggal: '3 Nov 2026',
    total: 160200000,
    statusText: 'Menunggu Pembayaran',
    statusType: 'menunggu_pembayaran',
    isGiliranAnda: true,
    actionPrompt: 'Unggah Bukti Transfer / Pembayaran',
    tabCategory: 'perlu_tindakan',
    keterangan: 'Invoice resmi telah terbit. Silakan lakukan pembayaran ke rekening Bank Mandiri PT Damaco Teknologi Presisi.',
  },
  {
    id: 'c-ord-07',
    nomor: 'QT/2026/11/0006',
    ringkasan: 'Starter Pack Scout +1 lainnya',
    items: [
      { nama: 'Starter Pack Scout Mini Rover', qty: 1, harga: 85000000 },
      { nama: 'Sensor Kalibrasi Lidar', qty: 1, harga: 10000000 },
    ],
    tanggal: '1 Nov 2026',
    total: 95000000,
    statusText: 'Dalam Pengiriman',
    statusType: 'dalam_pengiriman',
    isGiliranAnda: true,
    actionPrompt: 'Konfirmasi Penerimaan Barang',
    tabCategory: 'perlu_tindakan',
    ekspedisi: 'Damaco Secure Fleet (Driver: Bpk. Joko - 0812-9988-1122)',
    noResi: 'DMC-EXP-20261101-06',
    keterangan: 'Paket telah keluar dari gudang pusat Cikarang dan sedang dalam perjalanan ke lokasi kantor Anda.',
  },
  {
    id: 'c-ord-08',
    nomor: 'QT/2026/10/0005',
    ringkasan: 'Agri 20 +1 lainnya',
    items: [
      { nama: 'Agri 20 Drone Sprayer', qty: 1, harga: 244700000 },
      { nama: 'Paket Pelatihan Operator Lapangan', qty: 1, harga: 40000000 },
    ],
    tanggal: '28 Okt 2026',
    total: 284700000,
    statusText: 'Dalam Pengiriman',
    statusType: 'dalam_pengiriman',
    isGiliranAnda: true,
    actionPrompt: 'Konfirmasi Penerimaan Barang',
    tabCategory: 'perlu_tindakan',
    ekspedisi: 'Damaco Heavy Logistics (Truk Box Pendingin)',
    noResi: 'DMC-EXP-20261028-05',
    keterangan: 'Unit drone berkapasitas besar dikawal teknisi langsung untuk proses serah terima dan perakitan di site.',
  },
  {
    id: 'c-ord-09',
    nomor: 'QT/2026/10/0004',
    ringkasan: 'Scout Mini +1 lainnya',
    items: [
      { nama: 'Scout Mini Rover UGV', qty: 1, harga: 37500000 },
      { nama: 'Sensor Lidar 3D', qty: 1, harga: 4200000 },
    ],
    tanggal: '20 Okt 2026',
    total: 41700000,
    statusText: 'Diterima',
    statusType: 'diterima',
    isGiliranAnda: false,
    tabCategory: 'selesai',
    keterangan: 'Unit telah diterima dengan baik. Berita Acara Serah Terima (BAST) telah ditandatangani.',
  },
  {
    id: 'c-ord-10',
    nomor: 'QT/2026/10/0003',
    ringkasan: '1× Starter Pack Lumen Pro',
    items: [
      { nama: 'Starter Pack Cinema Lumen 5', qty: 1, harga: 47900000 },
    ],
    tanggal: '15 Okt 2026',
    total: 47900000,
    statusText: 'Selesai',
    statusType: 'selesai',
    isGiliranAnda: false,
    tabCategory: 'selesai',
    keterangan: 'Seluruh proses administrasi, pembayaran, dan garansi telah aktif penuh.',
  },
  {
    id: 'c-ord-11',
    nomor: 'QT/2026/10/0002',
    ringkasan: '1× Gimbal Zoom 30x',
    items: [
      { nama: 'Kamera Gimbal Zoom Optik 30x', qty: 1, harga: 24500000 },
    ],
    tanggal: '10 Okt 2026',
    total: 24500000,
    statusText: 'Ditolak',
    statusType: 'ditolak',
    isGiliranAnda: false,
    tabCategory: 'tidak_aktif',
    keterangan: 'Permintaan dibatalkan atas permintaan pemohon karena penyesuaian anggaran tahunan.',
  },
  {
    id: 'c-ord-12',
    nomor: 'QT/2026/10/0001',
    ringkasan: '2× Lumen 5',
    items: [
      { nama: 'Lumen 5 Pro Standard Unit', qty: 2, harga: 42900000 },
    ],
    tanggal: '1 Okt 2026',
    total: 42900000,
    statusText: 'Kedaluwarsa',
    statusType: 'kedaluwarsa',
    isGiliranAnda: false,
    tabCategory: 'tidak_aktif',
    keterangan: 'Masa berlaku penawaran harga 14 hari telah habis tanpa konfirmasi penerbitan PO.',
  },
  {
    id: 'c-ord-13',
    nomor: 'QT/2026/09/0013',
    ringkasan: '1× Atlas M4 RTK',
    items: [
      { nama: 'Atlas M4 RTK Unit', qty: 1, harga: 148500000 },
    ],
    tanggal: '25 Sep 2026',
    total: 148500000,
    statusText: 'Dibatalkan',
    statusType: 'dibatalkan',
    isGiliranAnda: false,
    tabCategory: 'tidak_aktif',
    keterangan: 'Pesanan digantikan dengan paket bundling Starter Pack Survei Atlas.',
  },
];

// 10 Stepper Stages
export const STEPPER_STAGES = [
  { id: 'menunggu_penawaran', label: 'Menunggu Penawaran' },
  { id: 'penawaran_terbit', label: 'Penawaran Terbit' },
  { id: 'po_diterima', label: 'PO Diterima' },
  { id: 'po_dikonfirmasi', label: 'PO Dikonfirmasi' },
  { id: 'proses_dealer', label: 'Proses Dealer' },
  { id: 'menunggu_pembayaran', label: 'Menunggu Pembayaran' },
  { id: 'lunas', label: 'Lunas' },
  { id: 'dalam_pengiriman', label: 'Dalam Pengiriman' },
  { id: 'diterima', label: 'Diterima' },
  { id: 'selesai', label: 'Selesai' },
];

export const getOrderStepIndex = (statusType) => {
  switch (statusType) {
    case 'menunggu_penawaran': return 0;
    case 'penawaran_terbit': return 1;
    case 'po_diterima': return 2;
    case 'po_dikonfirmasi': return 3;
    case 'proses_dealer': return 4;
    case 'menunggu_pembayaran': return 5;
    case 'lunas': return 6;
    case 'dalam_pengiriman': return 7;
    case 'diterima': return 8;
    case 'selesai': return 9;
    default: return 1;
  }
};

export const getOrderDocuments = (order) => {
  if (order.nomor === 'QT/2026/09/0003') {
    return [
      { id: 'doc-qt-0003', title: 'Surat Penawaran', kode: 'QT/2026/09/0003', type: 'penawaran', locked: false },
      { id: 'doc-po-0003', title: 'PO Damaco', kode: 'PO/DMC/2026/09/0003', type: 'po', locked: false },
      { id: 'doc-inv-0003', title: 'Invoice', kode: 'Terbit setelah verifikasi dealer', type: 'invoice', locked: true },
      { id: 'doc-kw-0003', title: 'Kwitansi', kode: 'KW/2026/09/0003', type: 'kwitansi', locked: false },
      { id: 'doc-fp-0003', title: 'Faktur Pajak', kode: '010.000-26.10000003', type: 'faktur_pajak', locked: false },
    ];
  }

  const stepIdx = getOrderStepIndex(order.statusType);

  // All 5 doc slots always shown; locked = not yet available
  return [
    {
      id: `doc-qt-${order.id}`,
      title: 'Surat Penawaran',
      kode: stepIdx >= 1 ? order.nomor : 'Terbit setelah penawaran dikirim',
      type: 'penawaran',
      locked: stepIdx < 1,
    },
    {
      id: `doc-po-resmi-${order.id}`,
      title: 'Purchase Order Resmi',
      kode: (order.nomorPo || order.poNumber) ? (order.nomorPo || order.poNumber) : 'Belum diunggah customer',
      type: 'po_resmi',
      locked: !(order.nomorPo || order.poNumber),
    },
    {
      id: `doc-po-${order.id}`,
      title: 'PO Damaco',
      kode: stepIdx >= 3 ? 'PO/DMC/' + (order.nomor ? order.nomor.slice(3) : '') : 'Terbit setelah PO dikonfirmasi',
      type: 'po',
      locked: stepIdx < 3,
    },
    {
      id: `doc-inv-${order.id}`,
      title: 'Invoice',
      kode: stepIdx >= 5 ? 'INV/' + (order.nomor ? order.nomor.slice(3) : '') : 'Terbit setelah verifikasi dealer',
      type: 'invoice',
      locked: stepIdx < 5,
    },
    {
      id: `doc-kw-${order.id}`,
      title: 'Kwitansi',
      kode: stepIdx >= 6 ? 'KW/' + (order.nomor ? order.nomor.slice(3) : '') : 'Belum terbit',
      type: 'kwitansi',
      locked: stepIdx < 6,
    },
    {
      id: `doc-fp-${order.id}`,
      title: 'Faktur Pajak',
      kode: stepIdx >= 6
        ? '010.000-26.' + ((order.nomor || '').replace(/[^0-9]/g, '').slice(-8) || '20260001')
        : 'Belum terbit',
      type: 'faktur_pajak',
      locked: stepIdx < 6,
    },
  ];
};

export const getOrderTimeline = (order) => {
  const custName = order.contact || order.customerNama || 'Customer';

  if (order.nomor === 'QT/2026/09/0003') {
    return [
      { id: 'tl-1', title: 'Transaksi diselesaikan dan diarsipkan', time: '23 Sep 2026, 09.00 • Admin', isLatest: true },
      { id: 'tl-2', title: 'Penerimaan barang dikonfirmasi customer', time: `22 Sep 2026, 09.00 • ${custName}` },
      { id: 'tl-3', title: 'Surat jalan dibuat, barang dikirim', time: '21 Sep 2026, 09.00 • Admin' },
      { id: 'tl-4', title: 'Pembayaran ditandai Lunas', time: '20 Sep 2026, 09.00 • Tim Finance' },
      { id: 'tl-5', title: 'Invoice diterbitkan', time: '19 Sep 2026, 09.00 • Admin' },
      { id: 'tl-6', title: 'Pesanan diteruskan ke dealer', time: '17 Sep 2026, 09.00 • Admin' },
    ];
  }

  const stepIdx = getOrderStepIndex(order.statusType);
  const list = [];

  if (order.statusType === 'ditolak') {
    list.push({ id: 't-d', title: 'Permintaan penawaran ditolak oleh customer', time: `${order.tanggal}, 15.00 • ${custName}`, isLatest: true });
    list.push({ id: 't-0', title: 'Penawaran harga diterbitkan', time: `${order.tanggal}, 09.00 • Admin` });
    return list;
  }
  if (order.statusType === 'kedaluwarsa') {
    list.push({ id: 't-k', title: 'Masa berlaku penawaran habis (Kedaluwarsa)', time: `${order.tanggal}, 17.00 • Sistem Damaco`, isLatest: true });
    list.push({ id: 't-0', title: 'Penawaran harga diterbitkan', time: `${order.tanggal}, 09.00 • Admin` });
    return list;
  }
  if (order.statusType === 'dibatalkan') {
    const isCustomerCancel = (order.catatan && order.catatan.toLowerCase().includes('customer')) || order.statusLabel === 'Dibatalkan Customer';
    const cancelActor = isCustomerCancel ? custName : 'Admin';
    const cancelReason = order.catatan ? ` (${order.catatan})` : '';
    list.push({ id: 't-b', title: `Pesanan dibatalkan${cancelReason}`, time: `${order.tanggal}, 11.00 • ${cancelActor}`, isLatest: true });
    list.push({ id: 't-0', title: 'Permintaan penawaran diajukan', time: `${order.tanggal}, 09.00 • ${custName}` });
    return list;
  }

  if (stepIdx >= 9) {
    list.push({ id: 't-9', title: 'Transaksi diselesaikan dan diarsipkan', time: `${order.tanggal}, 16.00 • Admin`, isLatest: true });
  }
  if (stepIdx >= 8) {
    list.push({ id: 't-8', title: 'Penerimaan barang dikonfirmasi customer', time: `${order.tanggal}, 14.30 • ${custName}`, isLatest: stepIdx === 8 });
  }
  if (stepIdx >= 7) {
    list.push({ id: 't-7', title: 'Surat jalan dibuat, barang dalam pengiriman', time: `${order.tanggal}, 10.00 • Admin`, isLatest: stepIdx === 7 });
  }
  if (stepIdx >= 6) {
    list.push({ id: 't-6', title: 'Pembayaran ditandai Lunas', time: `${order.tanggal}, 15.30 • Tim Finance`, isLatest: stepIdx === 6 });
  }
  if (stepIdx >= 5) {
    list.push({ id: 't-5', title: 'Invoice tagihan resmi diterbitkan', time: `${order.tanggal}, 11.00 • Admin`, isLatest: stepIdx === 5 });
  }
  if (stepIdx >= 4) {
    list.push({ id: 't-4', title: 'Pesanan diteruskan ke dealer untuk kalibrasi', time: `${order.tanggal}, 09.30 • Admin`, isLatest: stepIdx === 4 });
  }
  if (stepIdx >= 3) {
    list.push({ id: 't-3', title: 'Purchase Order resmi disetujui', time: `${order.tanggal}, 14.00 • Admin`, isLatest: stepIdx === 3 });
  }
  if (stepIdx >= 2) {
    list.push({ id: 't-2', title: 'Purchase Order resmi diunggah customer', time: `${order.tanggal}, 10.15 • ${custName}`, isLatest: stepIdx === 2 });
  }
  if (stepIdx >= 1) {
    list.push({ id: 't-1', title: 'Surat penawaran harga resmi diterbitkan', time: `${order.tanggal}, 09.00 • Admin`, isLatest: stepIdx === 1 });
  }
  list.push({ id: 't-0', title: 'Permintaan penawaran diajukan oleh customer', time: `${order.tanggal}, 08.30 • ${custName}`, isLatest: stepIdx === 0 });

  return list;
};

export const getOrderContextText = (order) => {
  if (order.nomor === 'QT/2026/09/0003') {
    return {
      title: 'Transaksi selesai',
      desc: 'Diterima pada 22 Sep 2026 (dikonfirmasi Anda). Kwitansi dan faktur pajak sudah dapat diunduh.',
      giliran: 'Selesai • Transaksi selesai. Semua dokumen tersedia.',
    };
  }

  switch (order.statusType) {
    case 'menunggu_penawaran':
      return {
        title: 'Permintaan Penawaran Sedang Dihitung',
        desc: 'Tim Commercial Damaco sedang memverifikasi spesifikasi teknis dan ketersediaan unit di gudang pusat Cikarang.',
        giliran: 'Tim Commercial Damaco • Estimasi penawaran harga resmi terbit dalam 1x24 jam kerja.',
      };
    case 'penawaran_terbit':
      return {
        title: 'Penawaran Harga Resmi Terbit',
        desc: 'Dokumen penawaran harga resmi (Quotation) telah diterbitkan. Silakan tinjau spesifikasi dan terbitkan PO resmi perusahaan Anda.',
        giliran: 'Giliran Anda • Setujui penawaran dan input nomor PO resmi perusahaan Anda.',
      };
    case 'po_diterima':
      return {
        title: 'PO Diterima & Verifikasi Legal',
        desc: 'PO resmi telah diterima oleh sistem Damaco dan sedang diproses verifikasi keabsahan dokumen oleh tim legal.',
        giliran: 'Tim Commercial Damaco • Verifikasi PO dan persiapan persetujuan manajemen.',
      };
    case 'po_dikonfirmasi':
      return {
        title: 'PO Dikonfirmasi',
        desc: 'PO resmi disetujui. Dokumen tagihan (Invoice Proforma & Faktur Pajak) sedang dipersiapkan divisi Finance.',
        giliran: 'Tim Finance Damaco • Penerbitan Invoice dan alokasi unit.',
      };
    case 'proses_dealer':
      return {
        title: 'Alokasi Unit & Kalibrasi Dealer',
        desc: 'Alokasi nomor seri unit drone dan kalibrasi sensor sedang dikerjakan authorized dealer Damaco.',
        giliran: 'Dealer Resmi Damaco • Unit sedang diuji fungsi dan kalibrasi sensor.',
      };
    case 'menunggu_pembayaran':
      return {
        title: 'Menunggu Pembayaran Invoice',
        desc: 'Invoice resmi telah terbit. Silakan lakukan pembayaran ke rekening Bank Mandiri PT Damaco Teknologi Presisi.',
        giliran: 'Giliran Anda • Unggah bukti transfer sebelum batas jatuh tempo.',
      };
    case 'dalam_pengiriman':
      return {
        title: 'Paket Dalam Pengiriman',
        desc: order.keterangan || 'Paket telah keluar dari gudang pusat Cikarang dan sedang dalam perjalanan ke lokasi kantor Anda.',
        giliran: 'Giliran Anda • Konfirmasi penerimaan setelah unit drone tiba dan dicek di lokasi Anda.',
      };
    case 'diterima':
      return {
        title: 'Barang Telah Diterima',
        desc: 'Unit telah diterima dengan baik. Berita Acara Serah Terima (BAST) telah ditandatangani.',
        giliran: 'Tim Damaco • Penyelesaian administrasi dan pengarsipan garansi resmi.',
      };
    case 'selesai':
      return {
        title: 'Transaksi selesai',
        desc: 'Transaksi selesai. Seluruh dokumen kwitansi, faktur pajak, dan garansi resmi telah aktif penuh.',
        giliran: 'Selesai • Transaksi selesai. Semua dokumen tersedia.',
      };
    case 'ditolak':
      return {
        title: 'Permintaan Ditolak',
        desc: order.keterangan || 'Permintaan penawaran telah dibatalkan atas permintaan pemohon.',
        giliran: 'Transaksi Tidak Aktif • Penawaran ditolak.',
      };
    case 'kedaluwarsa':
      return {
        title: 'Penawaran Kedaluwarsa',
        desc: order.keterangan || 'Masa berlaku penawaran harga 14 hari telah habis tanpa konfirmasi penerbitan PO.',
        giliran: 'Transaksi Tidak Aktif • Masa berlaku habis.',
      };
    case 'dibatalkan':
      return {
        title: 'Pesanan Dibatalkan',
        desc: order.keterangan || 'Pesanan dibatalkan.',
        giliran: 'Transaksi Tidak Aktif • Pesanan dibatalkan.',
      };
    default:
      return {
        title: order.statusText,
        desc: order.keterangan,
        giliran: order.statusText,
      };
  }
};

const PesananSayaPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const {
    orders,
    openCustomerView,
    handleCustomerSubmitPO,
    handleCustomerUploadPayment,
    handleCustomerConfirmReceipt,
    handleCustomerCancelOrder,
    handleCustomerUpdateOrder,
    mapOrderToCustomerView,
    markCustomerOrdersAsRead,
  } = useDamaco();

  const currentCompany = user?.perusahaan || '';

  // Dynamically mapped customer orders from the shared DamacoContext orders (100% in sync with Admin)
  const ordersList = useMemo(() => {
    const list = (orders || []).filter((o) => {
      if (user?.role === 'admin') return true;
      // Jika user belum login, tidak tampilkan order apapun
      if (!user) return false;
      
      const userEmail = (user?.email || '').toLowerCase().trim();
      const isDemoCust = userEmail === 'customer@damaco.com' || userEmail === 'raka@nusantarageo.co.id';

      // Jika akun demo bawaan (Raka Pradipta / PT Nusantara Geospasial): tampilkan pesanan demo
      if (isDemoCust) {
        const orderEmail = (o.email || '').toLowerCase().trim();
        const comp = (o.customerNama || '').toLowerCase().trim();
        return orderEmail === 'customer@damaco.com' || orderEmail === 'raka@nusantarageo.co.id' || comp.includes('nusantara geospasial');
      }

      // Akun customer baru/terdaftar mandiri: HANYA tampilkan pesanan yang dibuat dengan email akun ini
      const orderEmail = (o.email || '').toLowerCase().trim();
      return Boolean(orderEmail && userEmail && orderEmail === userEmail);
    });
    return list.map(mapOrderToCustomerView).filter(Boolean);
  }, [orders, mapOrderToCustomerView, user]);

  const [activeTab, setActiveTab] = useState('semua');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Clear unread customer notification badge when user visits this page
  useEffect(() => {
    markCustomerOrdersAsRead();
  }, []);
  const activeOrder = useMemo(() => {
    if (!selectedOrder) return null;
    return ordersList.find(o => o.id === selectedOrder.id || o.nomor === selectedOrder.nomor) || selectedOrder;
  }, [ordersList, selectedOrder]);

  // State Modal Kirim PO & Upload Bukti Pembayaran
  const [isKirimPoOpen, setIsKirimPoOpen] = useState(false);
  const [orderForPo, setOrderForPo] = useState(null);
  const [isUploadPaymentOpen, setIsUploadPaymentOpen] = useState(false);
  const [orderForPayment, setOrderForPayment] = useState(null);

  // State Modal Ubah Pesanan & Batal Pesanan (sebelum penawaran terbit)
  const [isUbahOpen, setIsUbahOpen] = useState(false);
  const [orderForUbah, setOrderForUbah] = useState(null);
  const [isBatalOpen, setIsBatalOpen] = useState(false);
  const [orderForBatal, setOrderForBatal] = useState(null);

  // Sync selected order with URL ?order=...
  useEffect(() => {
    const orderNo = searchParams.get('order');
    if (orderNo) {
      const found = ordersList.find(o => o.nomor === orderNo);
      if (found) {
        setSelectedOrder(found);
      }
    } else {
      setSelectedOrder(null);
    }
  }, [searchParams, ordersList]);

  // Tab definitions
  const tabs = [
    { id: 'semua', label: 'Semua', count: ordersList.length },
    {
      id: 'perlu_tindakan',
      label: 'Perlu tindakan Anda',
      count: ordersList.filter(o => o.isGiliranAnda).length,
      badge: ordersList.filter(o => o.isGiliranAnda).length,
    },
    {
      id: 'berjalan',
      label: 'Berjalan',
      count: ordersList.filter(o => o.tabCategory === 'berjalan').length,
    },
    {
      id: 'selesai',
      label: 'Selesai',
      count: ordersList.filter(o => o.tabCategory === 'selesai').length,
    },
    {
      id: 'tidak_aktif',
      label: 'Tidak aktif',
      count: ordersList.filter(o => o.tabCategory === 'tidak_aktif').length,
    },
  ];

  // Filtering for table
  const filteredOrders = useMemo(() => {
    return ordersList.filter(order => {
      if (activeTab === 'perlu_tindakan' && !order.isGiliranAnda) return false;
      if (activeTab === 'berjalan' && order.tabCategory !== 'berjalan') return false;
      if (activeTab === 'selesai' && order.tabCategory !== 'selesai') return false;
      if (activeTab === 'tidak_aktif' && order.tabCategory !== 'tidak_aktif') return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchNo = (order.nomor || '').toLowerCase().includes(q);
        const matchRingkasan = (order.ringkasan || '').toLowerCase().includes(q);
        const matchStatus = (order.statusText || '').toLowerCase().includes(q);
        return matchNo || matchRingkasan || matchStatus;
      }

      return true;
    });
  }, [ordersList, activeTab, searchTerm]);

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    setSearchParams({ order: order.nomor });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setSelectedOrder(null);
    setSearchParams({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDownloadDoc = (doc, e) => {
    e.stopPropagation();
    toast.success(`Mengunduh dokumen ${doc.title} (${doc.kode})... 📄`, {
      iconTheme: { primary: '#286845', secondary: '#fff' },
    });
  };

  const handlePreviewDoc = (doc, order, e) => {
    e.stopPropagation();
    openCustomerView({
      nomor: doc.kode,
      docTitle: doc.title,
      docType: doc.type,
      tanggal: order.tanggal,
      customerNama: order.customerNama || user?.perusahaan || '',
      detail: order.ringkasan,
      items: order.items,
      total: order.total,
      statusLabel: order.statusText,
    });
  };

  const handleOpenKirimPo = (order, e) => {
    if (e) e.stopPropagation();
    setOrderForPo(order);
    setIsKirimPoOpen(true);
  };

  const handleSubmitPo = (poData) => {
    handleCustomerSubmitPO(poData.orderNomor || poData.orderId, poData);
    setIsKirimPoOpen(false);

    toast.success(
      `Purchase Order ${poData.nomorPo} berhasil dikirim! Menunggu konfirmasi legal Damaco.`,
      {
        icon: '🚀',
        duration: 800,
        style: {
          borderRadius: '10px',
          background: '#18251F',
          color: '#fff',
        },
      }
    );
  };

  const handleOpenUploadPayment = (order, e) => {
    if (e) e.stopPropagation();
    setOrderForPayment(order);
    setIsUploadPaymentOpen(true);
  };

  const handleSubmitProof = (proofData) => {
    handleCustomerUploadPayment(proofData.orderId || proofData.orderNomor, proofData);
    setIsUploadPaymentOpen(false);

    toast.success(
      `Bukti pembayaran untuk ${proofData.orderNomor} berhasil diunggah! Finance sedang memverifikasi pelunasan. 💳`,
      {
        icon: '💳',
        duration: 800,
        style: {
          borderRadius: '10px',
          background: '#18251F',
          color: '#fff',
        },
      }
    );
  };

  const handleOpenUbah = (order, e) => {
    if (e) e.stopPropagation();
    setOrderForUbah(order);
    setIsUbahOpen(true);
  };

  const handleOpenBatal = (order, e) => {
    if (e) e.stopPropagation();
    setOrderForBatal(order);
    setIsBatalOpen(true);
  };

  const handleSaveUbah = (updatedData) => {
    if (!orderForUbah) return;
    handleCustomerUpdateOrder(orderForUbah.id || orderForUbah.nomor, updatedData);
    setIsUbahOpen(false);
  };

  const handleConfirmBatal = (orderKey, reason) => {
    handleCustomerCancelOrder(orderKey, reason);
    setIsBatalOpen(false);
    setSelectedOrder(null);
    setSearchParams({});
  };

  const handleActionClick = (order, e) => {
    if (e) e.stopPropagation();
    if (order.statusType === 'penawaran_terbit') {
      handleOpenKirimPo(order, e);
    } else if (order.statusType === 'menunggu_pembayaran') {
      handleOpenUploadPayment(order, e);
    } else if (order.statusType === 'dalam_pengiriman') {
      handleCustomerConfirmReceipt(order.id || order.nomor);
      toast.success(`Konfirmasi penerimaan barang untuk ${order.nomor} berhasil dicatat! Transaksi selesai. 🎉`, {
        iconTheme: { primary: '#286845', secondary: '#fff' },
      });
    } else {
      toast.success(`Tindakan untuk pesanan ${order.nomor} berhasil diproses! ✨`, {
        iconTheme: { primary: '#286845', secondary: '#fff' },
      });
    }
  };

  // Compute active order details
  const currentStepIdx = activeOrder ? getOrderStepIndex(activeOrder.statusType) : 0;
  const currentDocs = activeOrder ? getOrderDocuments(activeOrder) : [];
  const currentTimeline = activeOrder ? getOrderTimeline(activeOrder) : [];
  const currentContext = activeOrder ? getOrderContextText(activeOrder) : null;

  // Percentage for stepper completed line
  const stepperProgressPercent = activeOrder
    ? activeOrder.statusType === 'selesai'
      ? 100
      : Math.max(0, Math.min(100, (currentStepIdx / (STEPPER_STAGES.length - 1)) * 100))
    : 0;

  return (
    <div className="pesanan-saya-viewport">
      {/* Top Navbar */}
      <KatalogHeader />

      <main className="pesanan-saya-main">
        <div className="pesanan-saya-container">

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* VIEW 1: DETAIL VIEW (Tampilan Rapi & Simetris)                 */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {activeOrder ? (
            <div className="order-detail-view-wrapper">
              {/* Back to List Navigation Link */}
              <div className="order-detail-back-bar">
                <button
                  type="button"
                  className="btn-back-pesanan-link"
                  onClick={handleBackToList}
                  title="Kembali ke Daftar Semua Pesanan"
                >
                  <FiChevronLeft size={16} />
                  <span>Pesanan Saya</span>
                </button>
              </div>

              {/* Order Detail Header Area */}
              <div className="order-detail-header-block">
                <div className="detail-header-left">
                  <span className="detail-eyebrow">PESANAN</span>
                  <h1 className="detail-order-number font-serif">{activeOrder.nomor}</h1>
                  <p className="detail-order-meta">
                    Dibuat {activeOrder.tanggal} • {(activeOrder.items || []).length} jenis barang
                  </p>
                </div>

                <div className="detail-header-right">
                  <div className="detail-header-status-pill-wrap">
                    <div className={`customer-status-pill ${activeOrder.statusType} ${activeOrder.isGiliranAnda ? 'giliran-highlight' : ''}`}>
                      <span className="pill-dot" />
                      <span>{activeOrder.statusText}</span>
                    </div>
                  </div>

                  <div className="detail-header-total-box">
                    <span className="total-lead-label">Total (net, termasuk PPN)</span>
                    <span className="total-lead-val font-serif">
                      Rp {(activeOrder.total || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Banner: GILIRAN SIAPA */}
              <div className="detail-giliran-banner-card">
                <div className="banner-clock-circle">
                  <FiClock size={18} />
                </div>
                <div className="banner-giliran-content">
                  <span className="banner-giliran-label">GILIRAN SIAPA</span>
                  <div className="banner-giliran-text">
                    {currentContext?.giliran}
                  </div>
                </div>
              </div>

              {/* 10-Step Horizontal Stepper Tracker */}
              <div className="detail-stepper-card">
                <div
                  className="stepper-scroll-track"
                  style={{ '--progress-steps': currentStepIdx, '--total-steps': STEPPER_STAGES.length - 1 }}
                >
                  {/* Background Track Rail */}
                  <div className="stepper-track-bg" />

                  {/* Active Green Progress Rail */}
                  <div className="stepper-track-progress" />

                  {STEPPER_STAGES.map((stage, idx) => {
                    const isAllDone = activeOrder.statusType === 'selesai';
                    const isPassed = isAllDone ? true : idx <= currentStepIdx;
                    const isCurrent = isAllDone ? idx === STEPPER_STAGES.length - 1 : idx === currentStepIdx;
                    return (
                      <div
                        key={stage.id}
                        className={`stepper-node-item${isPassed ? ' completed' : ''}${isCurrent ? ' current' : ''}`}
                      >
                        <div className="stepper-node-circle">
                          {isPassed ? (
                            <FiCheck size={13} strokeWidth={3} />
                          ) : (
                            <span className="node-num">{idx + 1}</span>
                          )}
                        </div>
                        <span className="stepper-node-label">{stage.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Two-Column Detail Grid (Rapi & Seimbang) */}
              <div className="order-detail-columns-grid">
                {/* ── LEFT COLUMN: Merged Card (Context + Items + Total) ── */}
                <div className="detail-col-left">
                  <div className="detail-unified-card">
                    {/* Context Section */}
                    <div className="unified-section-context">
                      <h3 className="context-card-title font-serif">{currentContext?.title}</h3>
                      <p className="context-card-desc">{currentContext?.desc}</p>

                      {/* Akses Ubah & Batalkan Permintaan sebelum Penawaran Resmi Terbit */}
                      {activeOrder.statusType === 'menunggu_penawaran' && (
                        <div
                          style={{
                            background: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            borderRadius: '12px',
                            padding: '16px',
                            marginTop: '14px',
                            marginBottom: '10px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                            <div
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                background: '#FEF3C7',
                                color: '#D97706',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              <FiClock size={18} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                                <strong style={{ fontSize: 13.5, color: '#0F172A' }}>
                                  Permintaan Sedang Dihitung oleh Tim Damaco
                                </strong>
                                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: '#FEF3C7', color: '#92400E' }}>
                                  BISA DIUBAH / DIBATALKAN
                                </span>
                              </div>
                              <p style={{ margin: '6px 0 12px', fontSize: 12.5, color: '#64748B', lineHeight: 1.5 }}>
                                Sebelum surat penawaran resmi diterbitkan oleh admin, Anda memiliki hak penuh untuk mengubah jumlah unit produk, menambah/mengurangi barang, memperbarui alamat pengiriman, atau membatalkan permintaan ini.
                              </p>
                              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                <button
                                  type="button"
                                  onClick={(e) => handleOpenUbah(activeOrder, e)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    background: '#286845',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    borderRadius: 8,
                                    padding: '8px 16px',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'background 0.2s',
                                  }}
                                >
                                  <FiEdit3 size={14} />
                                  <span>Ubah Pesanan</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleOpenBatal(activeOrder, e)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    background: '#FFF1F2',
                                    color: '#E11D48',
                                    border: '1px solid #FECDD3',
                                    borderRadius: 8,
                                    padding: '8px 16px',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'background 0.2s',
                                  }}
                                >
                                  <FiTrash2 size={14} />
                                  <span>Batalkan Permintaan</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeOrder.statusType === 'penawaran_terbit' && (
                        <div className="action-box-penawaran-terbit">
                          <div className="action-box-penawaran-header">
                            <FiCheckCircle size={18} className="action-box-icon" />
                            <div className="action-box-text-block">
                              <strong>Surat Penawaran Resmi Telah Diterbitkan</strong>
                              <p>
                                Tinjau penawaran harga resmi. Jika Anda menyetujui penawaran ini, silakan lanjutkan dengan mengirimkan Purchase Order (PO) resmi perusahaan Anda.
                              </p>
                            </div>
                          </div>
                          <div className="action-box-buttons-row">
                            <button
                              type="button"
                              className="btn-kirim-po-action"
                              onClick={(e) => handleOpenKirimPo(activeOrder, e)}
                            >
                              <FiUpload size={14} />
                              <span>Kirim PO</span>
                            </button>
                            <button
                              type="button"
                              className="btn-preview-penawaran-sec"
                              onClick={(e) => handlePreviewDoc({ id: `doc-qt-${activeOrder.id}`, title: 'Surat Penawaran', kode: activeOrder.nomor }, activeOrder, e)}
                            >
                              <FiEye size={13} />
                              <span>Pratinjau Penawaran</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {activeOrder.noResi && (
                        <div className="context-shipping-alert" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <FiTruck size={18} className="ship-alert-icon" />
                            <div>
                              <strong>{activeOrder.ekspedisi}</strong>
                              <div className="resi-code">No. Resi: <code>{activeOrder.noResi}</code></div>
                            </div>
                          </div>
                          {(activeOrder.alamatPengiriman || activeOrder.alamat) && (
                            <div style={{ fontSize: 13, color: '#334155', paddingLeft: 28 }}>
                              <span style={{ fontWeight: 600, color: '#1E293B' }}>Alamat Tujuan: </span>
                              <span>{activeOrder.alamatPengiriman || activeOrder.alamat}</span>
                            </div>
                          )}
                          {activeOrder.statusType === 'dalam_pengiriman' && (
                            <button
                              type="button"
                              className="btn-kirim-po-action"
                              onClick={(e) => handleActionClick(activeOrder, e)}
                            >
                              <FiCheckCircle size={14} />
                              <span>Konfirmasi Penerimaan Barang</span>
                            </button>
                          )}
                        </div>
                      )}

                      {activeOrder.statusType === 'menunggu_pembayaran' && (
                        <div className="context-bank-box">
                          <div className="bank-lead">
                            <FiCreditCard size={15} />
                            <strong>Rekening Resmi Transfer Bank Mandiri:</strong>
                          </div>
                          <div className="bank-account-num">123-00-9988776-5</div>
                          <small className="bank-holder">a/n PT Damaco Teknologi Presisi (KCP Cikarang Industri)</small>
                          <div style={{ marginTop: 12 }}>
                            <button
                              type="button"
                              className="btn-kirim-po-action"
                              onClick={(e) => handleActionClick(activeOrder, e)}
                            >
                              <FiUpload size={14} />
                              <span>Unggah Bukti Transfer / Pembayaran</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="unified-section-divider" />

                    {/* Items Section */}
                    <div className="unified-section-items">
                      <div className="items-card-head">
                        <span>Rincian Barang</span>
                        <span className="items-count-badge">{(activeOrder.items || []).length} item</span>
                      </div>

                      <div className="items-card-list">
                        {(activeOrder.items || []).map((it, idx) => (
                          <div key={idx} className="order-item-line">
                            <div className="item-meta">
                              <span className="item-qty-badge">{it.qty}×</span>
                              <div className="item-name-block">
                                <span className="item-name">{it.nama}</span>
                                <span className="item-unit-price">1 × Rp {(it.harga || 0).toLocaleString('id-ID')}</span>
                              </div>
                            </div>
                            <span className="item-price font-serif">
                              Rp {((it.qty || 1) * (it.harga || 0)).toLocaleString('id-ID')}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="items-tax-subtotal-block">
                        <div className="tax-subtotal-row">
                          <span>Subtotal (DPP)</span>
                          <span>Rp {Math.round(activeOrder.total / 1.11).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="tax-subtotal-row">
                          <span>PPN (11%)</span>
                          <span>Rp {Math.round(activeOrder.total - activeOrder.total / 1.11).toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Total Footer — seamless bottom bar */}
                    <div className="items-total-footer-row">
                      <span className="footer-total-label">Total</span>
                      <span className="footer-total-val font-serif">
                        Rp {(activeOrder.total || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── RIGHT COLUMN: Dokumen & Riwayat ──────────────────── */}
                <div className="detail-col-right">
                  {/* Documents Unified Card */}
                  <div className="detail-unified-card">
                    <div className="card-header-clean">
                      <h3 className="card-title-serif font-serif">Dokumen</h3>
                      <span className="card-subtitle-badge">{currentDocs.filter(d => !d.locked).length} tersedia</span>
                    </div>

                    <div className="detail-documents-list">
                      {currentDocs.map(doc => (
                        <div key={doc.id} className={`detail-doc-row${doc.locked ? ' locked' : ''}`}>
                          <div className="doc-icon-pill">
                            {doc.locked ? <FiLock size={15} /> : <FiFileText size={16} />}
                          </div>
                          <div className="doc-meta-info">
                            <span className="doc-name">{doc.title}</span>
                            <span className="doc-code">{doc.kode}</span>
                          </div>

                          <div className="doc-actions-wrap">
                            {doc.locked ? (
                              <span className="btn-doc-locked"><FiLock size={12} /> Terkunci</span>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  className="btn-doc-pratinjau"
                                  onClick={(e) => handlePreviewDoc(doc, activeOrder, e)}
                                  title="Buka pratinjau dokumen resmi"
                                >
                                  <FiEye size={13} />
                                  <span>Pratinjau</span>
                                </button>

                                <button
                                  type="button"
                                  className="btn-doc-unduh"
                                  onClick={(e) => handleDownloadDoc(doc, e)}
                                  title="Unduh berkas PDF"
                                >
                                  <FiDownload size={13} />
                                  <span>Unduh</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Riwayat Unified Card */}
                  <div className="detail-unified-card">
                    <div className="card-header-clean">
                      <h3 className="card-title-serif font-serif">Riwayat</h3>
                      <span className="card-subtitle-badge">Linimasa pesanan</span>
                    </div>

                    <div className="timeline-vertical-list">
                      {currentTimeline.map((item, idx) => (
                        <div key={item.id || idx} className={`timeline-step-row ${item.isLatest ? 'latest' : ''}`}>
                          <div className="timeline-stem-col">
                            <span className="timeline-dot" />
                            {idx < currentTimeline.length - 1 && <span className="timeline-line-stem" />}
                          </div>
                          <div className="timeline-content-col">
                            <div className="timeline-step-title">{item.title}</div>
                            <div className="timeline-step-meta">{item.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ═══════════════════════════════════════════════════════════════ */
            /* VIEW 2: LIST VIEW (Table of all 13 orders)                     */
            /* ═══════════════════════════════════════════════════════════════ */
            <div className="orders-list-view-wrapper">
              {/* Breadcrumb Tag & Header */}
              <div className="pesanan-head-block">
                <span className="pesanan-tagline">AKUN PERUSAHAAN</span>
                <h1 className="pesanan-main-title font-serif">Pesanan Saya</h1>
              </div>

              {/* Controls Bar: Filter Pills & Search */}
              <div className="pesanan-controls-bar">
                {/* Filter Pills */}
                <div className="pesanan-tabs-row">
                  {tabs.map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        className={`pesanan-tab-pill ${isActive ? 'active' : ''} ${tab.badge ? 'has-badge' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                      >
                        <span>{tab.label}</span>
                        {tab.badge ? (
                          <span className="pill-badge-count">{tab.badge}</span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>

                {/* Search Input Box */}
                <div className="pesanan-search-box">
                  <FiSearch className="search-box-icon" />
                  <input
                    type="text"
                    placeholder="Cari nomor atau produk"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      className="search-clear-btn"
                      onClick={() => setSearchTerm('')}
                    >
                      <FiX size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Orders Table Card Container */}
              <div className="pesanan-table-card">
                <div className="pesanan-table-scroll">
                  <table className="pesanan-data-table">
                    <thead>
                      <tr>
                        <th style={{ width: '180px' }}>NOMOR</th>
                        <th>RINGKASAN</th>
                        <th style={{ width: '140px' }}>TANGGAL</th>
                        <th style={{ width: '160px', textAlign: 'right' }}>TOTAL</th>
                        <th style={{ width: '220px', textAlign: 'left', paddingLeft: '28px' }}>STATUS</th>
                        <th style={{ width: '40px', textAlign: 'center' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="table-empty-td">
                            Tidak ada pesanan ditemukan pada tab filter ini.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map(order => {
                          return (
                            <tr
                              key={order.id}
                              className="pesanan-table-row"
                              onClick={() => handleSelectOrder(order)}
                              title="Klik untuk membuka rincian pesanan"
                            >
                              {/* Column 1: NOMOR */}
                              <td className="col-nomor">
                                <span className="code-text font-sans">{order.nomor}</span>
                              </td>

                              {/* Column 2: RINGKASAN */}
                              <td className="col-ringkasan">
                                <span className="summary-text">{order.ringkasan}</span>
                              </td>

                              {/* Column 3: TANGGAL */}
                              <td className="col-tanggal">
                                <span className="date-text">{order.tanggal}</span>
                              </td>

                              {/* Column 4: TOTAL */}
                              <td className="col-total" style={{ textAlign: 'right' }}>
                                <span className="total-amount-serif font-serif">
                                  Rp {(order.total || 0).toLocaleString('id-ID')}
                                </span>
                              </td>

                              {/* Column 5: STATUS */}
                              <td className="col-status" style={{ paddingLeft: '28px' }}>
                                <div className="status-stack">
                                  <div
                                    className={`customer-status-pill ${order.statusType} ${order.isGiliranAnda ? 'giliran-highlight' : ''}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSelectOrder(order);
                                    }}
                                  >
                                    <span className="pill-dot" />
                                    <span>{order.statusText}</span>
                                  </div>
                                  {order.isGiliranAnda && (
                                    <span className="giliran-caption">Giliran Anda</span>
                                  )}
                                  {order.statusType === 'menunggu_penawaran' && (
                                    <span style={{ fontSize: 11, color: '#D97706', fontWeight: 600, marginTop: 2 }}>
                                      Bisa diubah / batal
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Column 6: CHEVRON ARROW */}
                              <td className="col-arrow" style={{ textAlign: 'center' }}>
                                <FiChevronRight className="chevron-icon" />
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Customer Unified Footer */}
      <CustomerFooter />

      {/* Global Modals & Drawers */}
      <PermintaanDrawer />
      <ProfilPerusahaanModal />
      <CustomerPortalModal />
      <KirimPoModal
        isOpen={isKirimPoOpen}
        onClose={() => setIsKirimPoOpen(false)}
        order={orderForPo || activeOrder}
        onSubmitPo={handleSubmitPo}
      />
      <UploadBuktiPembayaranModal
        isOpen={isUploadPaymentOpen}
        onClose={() => setIsUploadPaymentOpen(false)}
        order={orderForPayment || activeOrder}
        onSubmitProof={handleSubmitProof}
      />
      <UbahPesananModal
        isOpen={isUbahOpen}
        onClose={() => setIsUbahOpen(false)}
        order={orderForUbah || activeOrder}
        onSave={handleSaveUbah}
      />
      <BatalPesananModal
        isOpen={isBatalOpen}
        onClose={() => setIsBatalOpen(false)}
        order={orderForBatal || activeOrder}
        onConfirm={handleConfirmBatal}
      />
    </div>
  );
};

export default PesananSayaPage;
