'use client';

import React, { useState, useEffect } from 'react';
import { PageHead, Card, Badge, DataTable, GlassModal } from '../../../components/ui.jsx';
import { getProfiles } from '../../../lib/data-service';
import { supabaseSozlanganmi } from '../../../lib/auth';
import { createClient } from '../../../lib/supabase/client';

const REGIONS_LIST = [
  { id: 'andijon', nom: 'Andijon viloyati' },
  { id: 'buxoro', nom: 'Buxoro viloyati' },
  { id: 'fargona', nom: 'Farg‘ona viloyati' },
  { id: 'jizzax', nom: 'Jizzax viloyati' },
  { id: 'namangan', nom: 'Namangan viloyati' },
  { id: 'navoiy', nom: 'Navoiy viloyati' },
  { id: 'qashqadaryo', nom: 'Qashqadaryo viloyati' },
  { id: 'qoraqalpogiston', nom: 'Qoraqalpog‘iston Resp.' },
  { id: 'samarqand', nom: 'Samarqand viloyati' },
  { id: 'sirdaryo', nom: 'Sirdaryo viloyati' },
  { id: 'surxondaryo', nom: 'Surxondaryo viloyati' },
  { id: 'toshkent-shahar', nom: 'Toshkent shahri' },
  { id: 'toshkent-viloyat', nom: 'Toshkent viloyati' },
  { id: 'xorazm', nom: 'Xorazm viloyati' },
];

const STAGES = [
  { id: 'chuqurlashtirilgan_sinf', label: 'Chuqurlashtirilgan sinf' },
  { id: 'texnikum', label: 'Texnikum' },
  { id: 'bakalavr', label: 'Bakalavriat' },
  { id: 'magistr', label: 'Magistratura' },
  { id: 'rezidentura', label: 'Rezidentura / Ordinatura' },
  { id: 'doktor', label: 'Doktor (Shifokorlik)' },
  { id: 'doktarantura', label: 'Doktarantura (PhD/DSc)' },
];

const ROL_TONE = { xodim: 'info', vazirlik: 'violet', admin: 'accent' };

const BOSH_FORMA = {
  fish: '',
  jshshir: '',
  telefon: '',
  email: '',
  manzil_viloyat_id: 'toshkent-shahar',
  manzil_tuman: '',
  hozirgi_bosqich: 'bakalavr',
  hozirgi_muassasa: '',
  ish_joyi: '',
  lavozimi: '',
  rol: 'xodim',
};

export default function AdminXodimlarPage() {
  const [profiles, setProfiles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(BOSH_FORMA);

  useEffect(() => {
    getProfiles().then(setProfiles);
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData(BOSH_FORMA);
    setShowModal(true);
  };

  const openEditModal = (p) => {
    setEditingId(p.id);
    setFormData({ ...BOSH_FORMA, ...Object.fromEntries(Object.keys(BOSH_FORMA).map((k) => [k, p[k] ?? BOSH_FORMA[k]])) });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Rostdan ham ushbu xodimni o‘chirmoqchimisiz?')) return;
    if (supabaseSozlanganmi()) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from('profiles').delete().eq('id', id);
        if (error) {
          alert(`O‘chirishda xatolik: ${error.message}`);
          return;
        }
      } catch {
        // tarmoq xatosi — lokal ro'yxatdan baribir olib tashlaymiz
      }
    }
    setProfiles((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSubmit = async (yop) => {
    if (!formData.fish.trim()) {
      alert('F.I.O majburiy.');
      return;
    }
    if (editingId) {
      if (supabaseSozlanganmi()) {
        try {
          const supabase = createClient();
          const { error } = await supabase.from('profiles').update(formData).eq('id', editingId);
          if (error) {
            alert(`Saqlashda xatolik: ${error.message}`);
            return;
          }
        } catch {
          // tarmoq xatosi — lokal yangilash davom etadi
        }
      }
      setProfiles((prev) => prev.map((p) => (p.id === editingId ? { ...p, ...formData } : p)));
    } else {
      // Yangi profil auth.users yozuviga bog'lanadi — demo rejimda faqat lokal qo'shiladi
      // (haqiqiy yaratish OneID/ro'yxatdan o'tish oqimi orqali bo'ladi)
      setProfiles((prev) => [{ ...formData, id: crypto.randomUUID?.() || String(Date.now()) }, ...prev]);
    }
    yop();
  };

  const rows = profiles.map((p) => ({
    ...p,
    bosqich_nomi: STAGES.find((s) => s.id === p.hozirgi_bosqich)?.label || p.hozirgi_bosqich,
    hudud: (p.manzil_viloyat_id || '').replace('-', ' '),
  }));

  const columns = [
    {
      key: 'fish',
      label: 'F.I.O',
      render: (r) => (
        <>
          <div style={{ fontWeight: 600 }}>{r.fish}</div>
          <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{r.email}{r.telefon ? ` · ${r.telefon}` : ''}</div>
        </>
      ),
    },
    { key: 'jshshir', label: 'JSHSHIR', mono: true },
    { key: 'bosqich_nomi', label: 'Bosqich', render: (r) => <Badge tone="info">{r.bosqich_nomi}</Badge> },
    { key: 'hudud', label: 'Hudud' },
    { key: 'rol', label: 'Rol', render: (r) => <Badge tone={ROL_TONE[r.rol] || 'info'}>{r.rol}</Badge> },
    {
      key: 'amallar',
      label: '',
      render: (r) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          <button
            className="btn btn--ghost"
            style={{ padding: '4px 10px', fontSize: 12.5 }}
            onClick={(e) => { e.stopPropagation(); openEditModal(r); }}
          >
            Tahrirlash
          </button>
          <button
            className="btn btn--ghost"
            style={{ padding: '4px 10px', fontSize: 12.5, color: 'var(--danger)' }}
            onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }}
          >
            O‘chirish
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHead
        title="Xodimlar boshqaruvi"
        subtitle="Xodimlar ro'yxati, yangi profil qo'shish, tahrirlash va o'chirish (CRUD)"
      />

      <Card
        title="Xodimlar reyestri"
        extra={
          <button className="btn" style={{ padding: '6px 14px', fontSize: 13 }} onClick={openCreateModal}>
            + Yangi xodim
          </button>
        }
      >
        <DataTable
          searchable
          numbered
          columns={columns}
          rows={rows}
          empty="Xodimlar topilmadi"
        />
      </Card>

      {/* Yaratish / tahrirlash modali */}
      <GlassModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? "Xodim ma'lumotlarini tahrirlash" : "Yangi tibbiyot xodimi qo'shish"}
        subtitle="Ma'lumotlar yagona reyestrga saqlanadi"
        keng
      >
        {(yop) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label className="login__label">F.I.O (to‘liq) *</label>
              <input className="inp" type="text" value={formData.fish} onChange={(e) => setFormData({ ...formData, fish: e.target.value })} />
            </div>
            <div className="tmodal__grid">
              <div>
                <label className="login__label">JSHSHIR (14 raqam)</label>
                <input className="inp mono" type="text" maxLength={14} value={formData.jshshir} onChange={(e) => setFormData({ ...formData, jshshir: e.target.value })} />
              </div>
              <div>
                <label className="login__label">Telefon raqami</label>
                <input className="inp" type="text" value={formData.telefon} onChange={(e) => setFormData({ ...formData, telefon: e.target.value })} placeholder="+998 90 123 45 67" />
              </div>
            </div>
            <div className="tmodal__grid">
              <div>
                <label className="login__label">Viloyat</label>
                <select className="select" value={formData.manzil_viloyat_id} onChange={(e) => setFormData({ ...formData, manzil_viloyat_id: e.target.value })}>
                  {REGIONS_LIST.map((r) => (
                    <option key={r.id} value={r.id}>{r.nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="login__label">Tuman / shahar</label>
                <input className="inp" type="text" value={formData.manzil_tuman} onChange={(e) => setFormData({ ...formData, manzil_tuman: e.target.value })} placeholder="masalan: Asaka" />
              </div>
            </div>
            <div className="tmodal__grid">
              <div>
                <label className="login__label">Joriy bosqich</label>
                <select className="select" value={formData.hozirgi_bosqich} onChange={(e) => setFormData({ ...formData, hozirgi_bosqich: e.target.value })}>
                  {STAGES.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="login__label">Tizimdagi roli</label>
                <select className="select" value={formData.rol} onChange={(e) => setFormData({ ...formData, rol: e.target.value })}>
                  <option value="xodim">Tibbiyot xodimi</option>
                  <option value="vazirlik">Vazirlik (inspektor)</option>
                  <option value="admin">Super admin</option>
                </select>
              </div>
            </div>
            <div>
              <label className="login__label">Ish joyi (shifoxona / OTM)</label>
              <input className="inp" type="text" value={formData.ish_joyi} onChange={(e) => setFormData({ ...formData, ish_joyi: e.target.value })} placeholder="masalan: Asaka tumani markaziy shifoxonasi" />
            </div>
            <div>
              <label className="login__label">Lavozimi</label>
              <input className="inp" type="text" value={formData.lavozimi} onChange={(e) => setFormData({ ...formData, lavozimi: e.target.value })} placeholder="masalan: Kardiolog-shifokor" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button className="btn btn--ghost" onClick={yop}>Bekor qilish</button>
              <button className="btn" onClick={() => handleSubmit(yop)}>Saqlash</button>
            </div>
          </div>
        )}
      </GlassModal>
    </>
  );
}
