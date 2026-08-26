'use client';

import React, { useState, useEffect } from 'react';
import TalimTimeline from '../../components/TalimTimeline';
import { PageHead, Card, StatCard, Badge, Progress, GlassModal } from '../../components/ui.jsx';
import { INITIAL_PROFILES, getLitsenziyalar, getKreditlar } from '../../lib/data-service';
import { joriyProfilniOl, supabaseSozlanganmi } from '../../lib/auth';
import { createClient } from '../../lib/supabase/client';

const LITSENZIYA_TONE = {
  amal_qilmoqda: 'success',
  muddati_tugayapti: 'warning',
  muddati_otgan: 'danger',
};
const LITSENZIYA_MATN = {
  amal_qilmoqda: 'Amal qilmoqda',
  muddati_tugayapti: 'Muddati tugayapti',
  muddati_otgan: 'Muddati o‘tgan',
};

function InfoRow({ label, value, mono }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
      <span style={{ color: 'var(--muted)' }}>{label}</span>
      <span className={mono ? 'mono' : undefined} style={{ fontWeight: 500, textAlign: 'right' }}>{value || '—'}</span>
    </div>
  );
}

export default function WorkerProfilePage() {
  const [profile, setProfile] = useState(INITIAL_PROFILES[0]);
  const [licenses, setLicenses] = useState([]);
  const [credits, setCredits] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    (async () => {
      const p = await joriyProfilniOl();
      const profil = p || INITIAL_PROFILES[0];
      setProfile(profil);
      setEditForm(profil);
      const [lic, cr] = await Promise.all([getLitsenziyalar(profil.id), getKreditlar(profil.id)]);
      setLicenses(lic);
      setCredits(cr);
    })();
  }, []);

  const totalCredits = credits.reduce((sum, c) => sum + (c.kredit_ball || 0), 0);
  const joriyYil = new Date().getFullYear();
  const yillikBall = credits
    .filter((c) => new Date(c.topshirilgan_sana).getFullYear() === joriyYil)
    .reduce((s, c) => s + (c.kredit_ball || 0), 0);
  const faolLitsenziya = licenses.find((l) => l.holati !== 'muddati_otgan');

  const handleSaveProfile = async (yop) => {
    if (supabaseSozlanganmi()) {
      try {
        const supabase = createClient();
        const { error } = await supabase
          .from('profiles')
          .update({
            fish: editForm.fish,
            telefon: editForm.telefon,
            ish_joyi: editForm.ish_joyi,
            lavozimi: editForm.lavozimi,
          })
          .eq('id', profile.id);
        if (error) {
          alert(`Saqlashda xatolik: ${error.message}`);
          return;
        }
      } catch {
        // tarmoq xatosi — localStorage'ga baribir yozamiz
      }
    }
    setProfile(editForm);
    localStorage.setItem('uttp_current_user', JSON.stringify(editForm));
    yop();
  };

  return (
    <>
      <PageHead
        title={`Salom, ${profile.fish?.split(' ')[1] || profile.fish}!`}
        subtitle={`${profile.lavozimi || 'Tibbiyot xodimi'} · ${profile.ish_joyi || ''}`}
      />

      {/* Litsenziya ogohlantirishi */}
      {faolLitsenziya && faolLitsenziya.holati === 'muddati_tugayapti' && (
        <div className="elon-banner" style={{ marginBottom: 18 }}>
          <span className="elon-banner__ikon">⚠</span>
          <div>
            <b>TFX litsenziyangiz muddati tugayapti!</b>{' '}
            Amal qilish muddati: {faolLitsenziya.amal_qilish_muddati} gacha — yangilash uchun TFX markaziga murojaat qiling.
          </div>
        </div>
      )}

      {/* Asosiy ko'rsatkichlar */}
      <div className="grid stat-grid" style={{ marginBottom: 24 }}>
        <StatCard label={`${joriyYil}-yil krediti (norma 50)`} value={`${yillikBall} / 50`} icon="credit" tone="primary" />
        <StatCard label="5 yillik jami kredit" value={totalCredits} icon="chart" tone="teal" />
        <StatCard label="Sertifikatlar" value={credits.filter((c) => c.sertifikat_raqami).length} icon="certificate" tone="success" />
        <StatCard label="Malaka toifasi" value={faolLitsenziya?.toifa ? faolLitsenziya.toifa : '—'} icon="award" tone="violet" />
      </div>

      {/* Kasbiy trayektoriya */}
      <TalimTimeline hozirgiBosqich={profile.hozirgi_bosqich || 'doktor'} />

      <div className="grid cols-2" style={{ gap: 24, marginBottom: 24, alignItems: 'start' }}>
        {/* Profil ma'lumotlari */}
        <Card
          title="Profil ma'lumotlari"
          extra={
            <button className="btn btn--ghost" style={{ padding: '5px 12px', fontSize: 13 }} onClick={() => { setEditForm(profile); setIsEditing(true); }}>
              Tahrirlash
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11, fontSize: 14 }}>
            <InfoRow label="F.I.SH." value={profile.fish} />
            <InfoRow label="Lavozimi" value={profile.lavozimi} />
            <InfoRow label="Ish joyi" value={profile.ish_joyi} />
            <InfoRow label="Hudud" value={`${(profile.manzil_viloyat_id || '').replace('-', ' ')}, ${profile.manzil_tuman || ''}`} />
            <InfoRow label="Email" value={profile.email} />
            <InfoRow label="Telefon" value={profile.telefon} />
            <InfoRow label="JSHSHIR" value={profile.jshshir} mono />
          </div>
        </Card>

        {/* TFX litsenziyalari */}
        <Card title="TFX malaka toifasi va litsenziya" extra={`${licenses.length} ta`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {licenses.length === 0 && (
              <div style={{ color: 'var(--muted)', fontSize: 13.5, textAlign: 'center', padding: '18px 0' }}>
                Litsenziya yozuvlari topilmadi
              </div>
            )}
            {licenses.map((lic) => (
              <div key={lic.id} style={{ border: '1px solid var(--line)', borderRadius: 14, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 8, flexWrap: 'wrap' }}>
                  <span className="mono" style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>{lic.tfx_raqami}</span>
                  <Badge tone={LITSENZIYA_TONE[lic.holati] || 'info'}>{LITSENZIYA_MATN[lic.holati] || lic.holati}</Badge>
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 4 }}>
                  {lic.mutaxassislik}{lic.toifa ? ` · ${lic.toifa} toifa` : ''}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
                  {lic.berilgan_sana} — {lic.amal_qilish_muddati} (5 yillik tsikl)
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* UKTT kreditlari */}
      <Card title="UKTT kredit ballari" extra={`Jami: ${totalCredits} ball`}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, marginBottom: 6 }}>
            <span style={{ color: 'var(--muted)' }}>Yillik norma bajarilishi (50 ball)</span>
            <b>{yillikBall} / 50</b>
          </div>
          <Progress value={yillikBall} max={50} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {credits.map((c) => (
            <div
              key={c.id}
              style={{
                border: '1px solid var(--line)', borderRadius: 12, padding: '11px 14px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{c.kurs_nomi}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  {c.tashkilot_nomi} · {c.sertifikat_raqami || 'sertifikatsiz'} · {c.topshirilgan_sana}
                </div>
              </div>
              <Badge tone="info">+{c.kredit_ball}</Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Profilni tahrirlash modali */}
      <GlassModal
        open={isEditing}
        onClose={() => setIsEditing(false)}
        title="Profil ma'lumotlarini yangilash"
        subtitle="O'zgartirishlar reyestrga saqlanadi"
      >
        {(yop) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label className="login__label">F.I.SH.</label>
              <input className="inp" type="text" value={editForm.fish || ''} onChange={(e) => setEditForm({ ...editForm, fish: e.target.value })} />
            </div>
            <div>
              <label className="login__label">Telefon</label>
              <input className="inp" type="text" value={editForm.telefon || ''} onChange={(e) => setEditForm({ ...editForm, telefon: e.target.value })} />
            </div>
            <div>
              <label className="login__label">Ish joyi</label>
              <input className="inp" type="text" value={editForm.ish_joyi || ''} onChange={(e) => setEditForm({ ...editForm, ish_joyi: e.target.value })} />
            </div>
            <div>
              <label className="login__label">Lavozimi</label>
              <input className="inp" type="text" value={editForm.lavozimi || ''} onChange={(e) => setEditForm({ ...editForm, lavozimi: e.target.value })} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button className="btn btn--ghost" onClick={yop}>Bekor qilish</button>
              <button className="btn" onClick={() => handleSaveProfile(yop)}>Saqlash</button>
            </div>
          </div>
        )}
      </GlassModal>
    </>
  );
}
