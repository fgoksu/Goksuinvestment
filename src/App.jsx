import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jdctdkxkomzoowshndtq.supabase.co";
const SUPABASE_KEY = "sb_publishable_0l95dBKklpDcPsZWxEZ38g_27JQHIsy";
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── TOKENS ───────────────────────────────────────────────
const T = {
  bg: "#0d0f14", surface: "#13161e", card: "#181c27",
  border: "#252a38", borderHi: "#2e3549",
  accent: "#c8a96e", green: "#4ade80", red: "#f87171",
  blue: "#60a5fa", orange: "#fb923c", purple: "#a78bfa",
  text: "#e8eaf0", muted: "#7a8099", subtle: "#3d4357",
};

const STATUS_COLOR = {
  "Verhuurd":     T.green,
  "Leeg":         T.red,
  "In onderhoud": T.orange,
  "Renovatie":    T.purple,
};
const PRIO_COLOR = { urgent: T.red, hoog: T.orange, normaal: T.blue, laag: T.muted };

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${T.bg}; color: ${T.text}; font-family: 'DM Sans', sans-serif; }
  input, select, textarea {
    background: ${T.surface}; border: 1px solid ${T.border}; color: ${T.text};
    border-radius: 8px; padding: 9px 13px; font-family: inherit; font-size: 14px;
    width: 100%; outline: none; transition: border-color .2s;
  }
  input:focus, select:focus, textarea:focus { border-color: ${T.accent}; }
  select option { background: ${T.surface}; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: ${T.bg}; }
  ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 4px; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none} }
  .fadeIn { animation: fadeIn .3s ease forwards; }
  @keyframes spin { to{transform:rotate(360deg)} }
  tr:hover td { background: ${T.surface}22; }
`;

const CATS = {
  inkomen:  ["Huur", "Servicekosten", "Borg", "Overig inkomen"],
  uitgaven: ["Hypotheek", "VvE", "Onderhoud", "Verzekering", "Belasting", "Beheerkosten", "GWL", "Overig"],
};

// ─── HELPERS ──────────────────────────────────────────────
const eur = n => new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n || 0);
const dateStr = d => d ? new Date(d).toLocaleDateString("nl-NL", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const daysUntil = d => d ? Math.ceil((new Date(d) - new Date()) / 86400000) : 999;

// ─── UI ATOMS ─────────────────────────────────────────────
function Btn({ children, onClick, variant = "primary", small, disabled, style }) {
  const v = { primary: { background: T.accent, color: "#000", border: "none" }, ghost: { background: "transparent", color: T.accent, border: `1px solid ${T.accent}` }, danger: { background: "transparent", color: T.red, border: `1px solid ${T.red}44` }, subtle: { background: T.surface, color: T.text, border: `1px solid ${T.border}` } };
  return <button onClick={onClick} disabled={disabled} style={{ ...v[variant], borderRadius: 8, padding: small ? "4px 12px" : "9px 18px", fontSize: small ? 12 : 14, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: disabled ? .5 : 1, transition: "opacity .15s", whiteSpace: "nowrap", ...style }}>{children}</button>;
}
function Tag({ label, color }) {
  return <span style={{ background: color + "22", color, borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>{label}</span>;
}
function Card({ children, style, className }) {
  return <div className={className} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 22, ...style }}>{children}</div>;
}
function Divider() { return <div style={{ height: 1, background: T.border, margin: "14px 0" }} />; }
function Spinner() { return <div style={{ width: 22, height: 22, border: `2px solid ${T.border}`, borderTop: `2px solid ${T.accent}`, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "60px auto" }} />; }

function Stat({ label, value, color, sub, icon }) {
  return (
    <Card style={{ flex: 1, minWidth: 150 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={{ color: T.muted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
          <div style={{ color: color || T.text, fontSize: 24, fontWeight: 700, marginTop: 6, fontFamily: "'Playfair Display', serif" }}>{value}</div>
          {sub && <div style={{ color: T.muted, fontSize: 12, marginTop: 3 }}>{sub}</div>}
        </div>
        <div style={{ fontSize: 22, opacity: .45 }}>{icon}</div>
      </div>
    </Card>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000b", zIndex: 999, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 16px", overflowY: "auto" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="fadeIn" style={{ background: T.card, border: `1px solid ${T.borderHi}`, borderRadius: 16, padding: 28, width: wide ? 720 : 560, maxWidth: "100%", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600 }}>{title}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.muted, fontSize: 22, cursor: "pointer" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children, span }) {
  return (
    <div style={{ gridColumn: span ? `span ${span}` : undefined, marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 11, color: T.muted, fontWeight: 600, marginBottom: 5, textTransform: "uppercase", letterSpacing: .5 }}>{label}</label>
      {children}
    </div>
  );
}

function NotitieBox({ notities, onAdd, onDelete }) {
  const [form, setForm] = useState({ titel: "", inhoud: "", prioriteit: "normaal", auteur: "Goksu" });
  const [show, setShow] = useState(false);
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.muted }}>📝 Notities ({notities.length})</div>
        <Btn small variant="subtle" onClick={() => setShow(!show)}>+ Notitie</Btn>
      </div>
      {show && (
        <div style={{ background: T.surface, borderRadius: 10, padding: 14, marginBottom: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <input placeholder="Titel" value={form.titel} onChange={e => setForm({ ...form, titel: e.target.value })} />
            <select value={form.prioriteit} onChange={e => setForm({ ...form, prioriteit: e.target.value })}>
              <option value="laag">Laag</option>
              <option value="normaal">Normaal</option>
              <option value="hoog">Hoog</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <textarea rows={2} placeholder="Notitie..." value={form.inhoud} onChange={e => setForm({ ...form, inhoud: e.target.value })} style={{ marginBottom: 10, resize: "vertical" }} />
          <div style={{ display: "flex", gap: 8 }}>
            <Btn small onClick={() => { onAdd(form); setForm({ titel: "", inhoud: "", prioriteit: "normaal", auteur: "Goksu" }); setShow(false); }}>Opslaan</Btn>
            <Btn small variant="ghost" onClick={() => setShow(false)}>Annuleren</Btn>
          </div>
        </div>
      )}
      {notities.map(n => (
        <div key={n.id} style={{ background: T.surface, borderRadius: 8, padding: "10px 14px", marginBottom: 8, borderLeft: `3px solid ${PRIO_COLOR[n.prioriteit]}` }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{n.titel || "Notitie"}</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Tag label={n.prioriteit} color={PRIO_COLOR[n.prioriteit]} />
              <button onClick={() => onDelete(n.id)} style={{ background: "none", border: "none", color: T.subtle, cursor: "pointer", fontSize: 14 }}>✕</button>
            </div>
          </div>
          <div style={{ color: T.muted, fontSize: 12, marginTop: 4 }}>{n.inhoud}</div>
          <div style={{ color: T.subtle, fontSize: 11, marginTop: 4 }}>{n.auteur} · {dateStr(n.created_at)}</div>
        </div>
      ))}
      {!notities.length && <div style={{ color: T.subtle, fontSize: 13, fontStyle: "italic" }}>Geen notities</div>}
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────
function Dashboard({ panden, eenheden, transacties, contracten }) {
  const ink = transacties.filter(t => t.type === "inkomen").reduce((s, t) => s + +t.bedrag, 0);
  const uit = transacties.filter(t => t.type === "uitgaven").reduce((s, t) => s + Math.abs(+t.bedrag), 0);
  const totaalWaarde = panden.reduce((s, p) => s + (+p.waarde || 0), 0);
  const totaalHyp    = panden.reduce((s, p) => s + (+p.hypotheek || 0), 0);
  const ltv = totaalWaarde > 0 ? Math.round(totaalHyp / totaalWaarde * 100) : 0;
  const leeg = eenheden.filter(e => e.status === "Leeg").length;
  const verhuurd = eenheden.filter(e => e.status === "Verhuurd").length;

  const alerts = contracten.filter(c => { const d = daysUntil(c.indexatiedatum); return d > 0 && d <= 90; }).map(c => {
    const e = eenheden.find(x => x.id === c.eenheid_id);
    const p = panden.find(x => x.id === e?.pand_id);
    return { label: `${p?.naam} · ${e?.naam}`, datum: c.indexatiedatum, dagen: daysUntil(c.indexatiedatum), nieuw: c.huur * (1 + c.indexatie / 100) };
  });

  const perPand = panden.map(p => {
    const pe = eenheden.filter(e => e.pand_id === p.id);
    const pt = transacties.filter(t => t.pand_id === p.id);
    const pi = pt.filter(t => t.type === "inkomen").reduce((s, t) => s + +t.bedrag, 0);
    const pu = pt.filter(t => t.type === "uitgaven").reduce((s, t) => s + Math.abs(+t.bedrag), 0);
    const verhuurdCount = pe.filter(e => e.status === "Verhuurd").length;
    return { ...p, eenheden: pe, inkomen: pi, uitgaven: pu, cashflow: pi - pu, verhuurd: verhuurdCount, totaal: pe.length };
  });

  return (
    <div className="fadeIn">
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Goksu Investment</div>
      <div style={{ color: T.muted, fontSize: 14, marginBottom: 24 }}>{new Date().toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>

      {alerts.length > 0 && (
        <div style={{ background: T.accent + "15", border: `1px solid ${T.accent}44`, borderRadius: 10, padding: "12px 18px", marginBottom: 20 }}>
          <div style={{ color: T.accent, fontWeight: 600, fontSize: 13, marginBottom: 6 }}>⏰ Naderende indexaties</div>
          {alerts.map((a, i) => <div key={i} style={{ fontSize: 13, marginBottom: 2 }}>• <strong>{a.label}</strong> — {dateStr(a.datum)} ({a.dagen}d) → {eur(a.nieuw)}/mnd</div>)}
        </div>
      )}

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
        <Stat label="Netto cashflow"    value={eur(ink - uit)} color={(ink - uit) >= 0 ? T.green : T.red} sub="YTD alle panden" icon="📈" />
        <Stat label="Huurinkomsten"     value={eur(ink)}       color={T.green}  sub="YTD" icon="💶" />
        <Stat label="Totale uitgaven"   value={eur(uit)}       color={T.red}    sub="YTD" icon="📤" />
        <Stat label="Portefeuillewaarde" value={eur(totaalWaarde)} color={T.accent} sub={`LTV ${ltv}%`} icon="🏛" />
        <Stat label="Bezetting"         value={`${verhuurd}/${eenheden.length}`} color={T.blue} sub={`${leeg} eenheden leeg`} icon="🏠" />
      </div>

      <Card>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 600, marginBottom: 16 }}>Per pand</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr>{["Pand", "Stad", "Eenheden", "Bezetting", "Inkomen", "Uitgaven", "Cashflow"].map(h => (
              <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: T.muted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: .5, borderBottom: `1px solid ${T.border}` }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {perPand.map(p => (
              <tr key={p.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                <td style={{ padding: "14px 12px" }}><div style={{ fontWeight: 600 }}>{p.foto} {p.naam}</div><div style={{ color: T.muted, fontSize: 12 }}>{p.type}</div></td>
                <td style={{ padding: "14px 12px", color: T.muted, fontSize: 13 }}>{p.stad}</td>
                <td style={{ padding: "14px 12px" }}>{p.totaal}</td>
                <td style={{ padding: "14px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 6, background: T.border, borderRadius: 3 }}>
                      <div style={{ height: "100%", background: T.green, borderRadius: 3, width: p.totaal > 0 ? `${p.verhuurd / p.totaal * 100}%` : "0%" }} />
                    </div>
                    <span style={{ fontSize: 12, color: T.muted }}>{p.verhuurd}/{p.totaal}</span>
                  </div>
                </td>
                <td style={{ padding: "14px 12px", color: T.green, fontWeight: 600 }}>{eur(p.inkomen)}</td>
                <td style={{ padding: "14px 12px", color: T.red, fontWeight: 600 }}>{eur(p.uitgaven)}</td>
                <td style={{ padding: "14px 12px", fontWeight: 700, color: p.cashflow >= 0 ? T.green : T.red }}>{eur(p.cashflow)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─── PANDEN ───────────────────────────────────────────────
function Panden({ panden, setPanden, eenheden, notities, setNotities }) {
  const [modal, setModal] = useState(false);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ naam: "", stad: "", adres: "", postcode: "", type: "Woning", bouwjaar: "", oppervlakte: "", waarde: "", hypotheek: "", foto: "🏠", energielabel: "", notities: "" });

  async function save() {
    setLoading(true);
    const { data } = await sb.from("panden").insert([{ ...form, bouwjaar: +form.bouwjaar || null, oppervlakte: +form.oppervlakte || null, waarde: +form.waarde || null, hypotheek: +form.hypotheek || null }]).select();
    if (data) { setPanden([...panden, data[0]]); setModal(false); }
    setLoading(false);
  }
  async function del(id) {
    if (!confirm("Pand + alle eenheden verwijderen?")) return;
    await sb.from("panden").delete().eq("id", id);
    setPanden(panden.filter(p => p.id !== id));
  }
  async function addNotitie(pandId, form) {
    const { data } = await sb.from("notities").insert([{ ...form, pand_id: pandId }]).select();
    if (data) setNotities([...notities, data[0]]);
  }
  async function delNotitie(id) {
    await sb.from("notities").delete().eq("id", id);
    setNotities(notities.filter(n => n.id !== id));
  }

  return (
    <div className="fadeIn">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700 }}>Panden</div>
          <div style={{ color: T.muted, fontSize: 13 }}>{panden.length} objecten · {eenheden.length} eenheden totaal</div>
        </div>
        <Btn onClick={() => setModal(true)}>+ Pand toevoegen</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {panden.map(p => {
          const pe = eenheden.filter(e => e.pand_id === p.id);
          const ltv = p.waarde > 0 ? Math.round(p.hypotheek / p.waarde * 100) : 0;
          const verhuurd = pe.filter(e => e.status === "Verhuurd").length;
          const pandNotities = notities.filter(n => n.pand_id === p.id && !n.eenheid_id);
          return (
            <Card key={p.id} style={{ position: "relative", cursor: "pointer" }} onClick={() => setDetail(p)}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>{p.foto}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600 }}>{p.naam}</div>
              <div style={{ color: T.muted, fontSize: 13, marginBottom: 10 }}>{p.adres} · {p.stad}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                <Tag label={p.type} color={T.blue} />
                {p.energielabel && <Tag label={`Label ${p.energielabel}`} color={T.green} />}
                {ltv > 0 && <Tag label={`LTV ${ltv}%`} color={ltv > 80 ? T.red : T.accent} />}
              </div>
              <Divider />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 13, marginBottom: 10 }}>
                <div><div style={{ color: T.muted, fontSize: 11, textTransform: "uppercase" }}>Waarde</div><div style={{ fontWeight: 600, color: T.accent }}>{eur(p.waarde)}</div></div>
                <div><div style={{ color: T.muted, fontSize: 11, textTransform: "uppercase" }}>Hypotheek</div><div style={{ fontWeight: 600 }}>{eur(p.hypotheek)}</div></div>
                <div><div style={{ color: T.muted, fontSize: 11, textTransform: "uppercase" }}>Eenheden</div><div style={{ fontWeight: 600 }}>{pe.length} totaal</div></div>
                <div><div style={{ color: T.muted, fontSize: 11, textTransform: "uppercase" }}>Verhuurd</div><div style={{ fontWeight: 600, color: T.green }}>{verhuurd}/{pe.length}</div></div>
              </div>
              {pandNotities.length > 0 && <div style={{ fontSize: 12, color: T.orange }}>📝 {pandNotities.length} notitie{pandNotities.length > 1 ? "s" : ""}</div>}
              <button onClick={ev => { ev.stopPropagation(); del(p.id); }} style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", color: T.subtle, cursor: "pointer", fontSize: 16 }}>✕</button>
            </Card>
          );
        })}
      </div>

      {/* Detail modal */}
      {detail && (
        <Modal title={`${detail.foto} ${detail.naam}`} onClose={() => setDetail(null)} wide>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div><div style={{ color: T.muted, fontSize: 11, textTransform: "uppercase" }}>Adres</div><div style={{ fontWeight: 600 }}>{detail.adres}, {detail.postcode} {detail.stad}</div></div>
            <div><div style={{ color: T.muted, fontSize: 11, textTransform: "uppercase" }}>Bouwjaar</div><div style={{ fontWeight: 600 }}>{detail.bouwjaar || "—"}</div></div>
            <div><div style={{ color: T.muted, fontSize: 11, textTransform: "uppercase" }}>Waarde</div><div style={{ fontWeight: 600, color: T.accent }}>{eur(detail.waarde)}</div></div>
            <div><div style={{ color: T.muted, fontSize: 11, textTransform: "uppercase" }}>Hypotheek</div><div style={{ fontWeight: 600 }}>{eur(detail.hypotheek)}</div></div>
          </div>
          {detail.notities && <div style={{ background: T.surface, borderRadius: 8, padding: 12, fontSize: 13, color: T.muted, marginBottom: 16, fontStyle: "italic" }}>{detail.notities}</div>}
          <Divider />
          <NotitieBox
            notities={notities.filter(n => n.pand_id === detail.id && !n.eenheid_id)}
            onAdd={f => addNotitie(detail.id, f)}
            onDelete={delNotitie}
          />
        </Modal>
      )}

      {modal && (
        <Modal title="Pand toevoegen" onClose={() => setModal(false)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Naam / Adres"><input value={form.naam} onChange={e => setForm({ ...form, naam: e.target.value })} placeholder="Herengracht 1" /></Field>
            <Field label="Stad"><input value={form.stad} onChange={e => setForm({ ...form, stad: e.target.value })} placeholder="Amsterdam" /></Field>
            <Field label="Adres"><input value={form.adres} onChange={e => setForm({ ...form, adres: e.target.value })} /></Field>
            <Field label="Postcode"><input value={form.postcode} onChange={e => setForm({ ...form, postcode: e.target.value })} placeholder="1234 AB" /></Field>
            <Field label="Type">
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                {["Woning","Appartement","Bedrijfspand","Villa","Overig"].map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Icoon">
              <select value={form.foto} onChange={e => setForm({ ...form, foto: e.target.value })}>
                {["🏠","🏛","🏢","🏡","🏪","🏗","🏰"].map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </Field>
            <Field label="Bouwjaar"><input type="number" value={form.bouwjaar} onChange={e => setForm({ ...form, bouwjaar: e.target.value })} /></Field>
            <Field label="Energielabel">
              <select value={form.energielabel} onChange={e => setForm({ ...form, energielabel: e.target.value })}>
                <option value="">—</option>
                {["A","A+","A++","B","C","D","E","F","G"].map(l => <option key={l}>{l}</option>)}
              </select>
            </Field>
            <Field label="Waarde (€)"><input type="number" value={form.waarde} onChange={e => setForm({ ...form, waarde: e.target.value })} /></Field>
            <Field label="Hypotheek (€)"><input type="number" value={form.hypotheek} onChange={e => setForm({ ...form, hypotheek: e.target.value })} /></Field>
          </div>
          <Field label="Notities"><textarea rows={2} value={form.notities} onChange={e => setForm({ ...form, notities: e.target.value })} placeholder="Bijzonderheden pand..." style={{ resize: "vertical" }} /></Field>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Btn onClick={save} disabled={loading}>{loading ? "Opslaan..." : "Opslaan"}</Btn>
            <Btn variant="ghost" onClick={() => setModal(false)}>Annuleren</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── EENHEDEN ─────────────────────────────────────────────
function Eenheden({ eenheden, setEenheden, panden, notities, setNotities }) {
  const [modal, setModal] = useState(false);
  const [detail, setDetail] = useState(null);
  const [filterPand, setFilterPand] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ pand_id: "", naam: "", type: "Kamer", verdieping: "BG", oppervlakte: "", max_huurprijs: "", status: "Leeg", meubilering: "Ongemeubileerd", notities: "" });

  const filtered = eenheden.filter(e =>
    (filterPand === "all" || e.pand_id === +filterPand) &&
    (filterStatus === "all" || e.status === filterStatus)
  );

  async function save() {
    setLoading(true);
    const { data } = await sb.from("eenheden").insert([{ ...form, pand_id: +form.pand_id, oppervlakte: +form.oppervlakte || null, max_huurprijs: +form.max_huurprijs || null }]).select();
    if (data) { setEenheden([...eenheden, data[0]]); setModal(false); }
    setLoading(false);
  }
  async function del(id) {
    if (!confirm("Eenheid verwijderen?")) return;
    await sb.from("eenheden").delete().eq("id", id);
    setEenheden(eenheden.filter(e => e.id !== id));
  }
  async function updateStatus(id, status) {
    await sb.from("eenheden").update({ status }).eq("id", id);
    setEenheden(eenheden.map(e => e.id === id ? { ...e, status } : e));
  }
  async function addNotitie(eenheidId, pandId, f) {
    const { data } = await sb.from("notities").insert([{ ...f, eenheid_id: eenheidId, pand_id: pandId }]).select();
    if (data) setNotities([...notities, data[0]]);
  }
  async function delNotitie(id) {
    await sb.from("notities").delete().eq("id", id);
    setNotities(notities.filter(n => n.id !== id));
  }

  return (
    <div className="fadeIn">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700 }}>Eenheden</div>
          <div style={{ color: T.muted, fontSize: 13 }}>{eenheden.filter(e => e.status === "Leeg").length} leeg · {eenheden.filter(e => e.status === "Verhuurd").length} verhuurd</div>
        </div>
        <Btn onClick={() => setModal(true)}>+ Eenheid toevoegen</Btn>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <select value={filterPand} onChange={e => setFilterPand(e.target.value)} style={{ flex: 1, minWidth: 180, width: "auto" }}>
            <option value="all">Alle panden</option>
            {panden.map(p => <option key={p.id} value={p.id}>{p.naam}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ flex: 1, minWidth: 160, width: "auto" }}>
            <option value="all">Alle statussen</option>
            {["Verhuurd","Leeg","In onderhoud","Renovatie"].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
        {filtered.map(e => {
          const pand = panden.find(p => p.id === e.pand_id);
          const eNotities = notities.filter(n => n.eenheid_id === e.id);
          return (
            <Card key={e.id} style={{ borderTop: `3px solid ${STATUS_COLOR[e.status] || T.border}`, cursor: "pointer", position: "relative" }} onClick={() => setDetail(e)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{e.naam}</div>
                  <div style={{ color: T.muted, fontSize: 12 }}>{pand?.naam}</div>
                </div>
                <Tag label={e.status} color={STATUS_COLOR[e.status] || T.muted} />
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                <Tag label={e.type} color={T.blue} />
                {e.verdieping && <Tag label={`Verd. ${e.verdieping}`} color={T.muted} />}
                {e.oppervlakte && <Tag label={`${e.oppervlakte}m²`} color={T.muted} />}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13 }}>
                <div><div style={{ color: T.muted, fontSize: 11, textTransform: "uppercase" }}>Streefhuur</div><div style={{ fontWeight: 600, color: T.green }}>{eur(e.max_huurprijs)}</div></div>
                <div><div style={{ color: T.muted, fontSize: 11, textTransform: "uppercase" }}>Meubilering</div><div style={{ fontWeight: 600, fontSize: 12 }}>{e.meubilering}</div></div>
              </div>
              {eNotities.length > 0 && <div style={{ marginTop: 8, fontSize: 12, color: T.orange }}>📝 {eNotities.length} notitie{eNotities.length > 1 ? "s" : ""}</div>}
              {e.notities && <div style={{ marginTop: 8, fontSize: 12, color: T.muted, fontStyle: "italic" }}>{e.notities.slice(0, 60)}{e.notities.length > 60 ? "..." : ""}</div>}
              <button onClick={ev => { ev.stopPropagation(); del(e.id); }} style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", color: T.subtle, cursor: "pointer", fontSize: 14 }}>✕</button>
            </Card>
          );
        })}
      </div>

      {detail && (
        <Modal title={`${detail.naam} — ${panden.find(p => p.id === detail.pand_id)?.naam}`} onClose={() => setDetail(null)} wide>
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
            {["Verhuurd","Leeg","In onderhoud","Renovatie"].map(s => (
              <Btn key={s} small variant={detail.status === s ? "primary" : "subtle"} onClick={() => { updateStatus(detail.id, s); setDetail({ ...detail, status: s }); }}>{s}</Btn>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div><div style={{ color: T.muted, fontSize: 11, textTransform: "uppercase" }}>Type</div><div style={{ fontWeight: 600 }}>{detail.type}</div></div>
            <div><div style={{ color: T.muted, fontSize: 11, textTransform: "uppercase" }}>Verdieping</div><div style={{ fontWeight: 600 }}>{detail.verdieping || "—"}</div></div>
            <div><div style={{ color: T.muted, fontSize: 11, textTransform: "uppercase" }}>Oppervlakte</div><div style={{ fontWeight: 600 }}>{detail.oppervlakte ? `${detail.oppervlakte} m²` : "—"}</div></div>
            <div><div style={{ color: T.muted, fontSize: 11, textTransform: "uppercase" }}>Streefhuur</div><div style={{ fontWeight: 600, color: T.green }}>{eur(detail.max_huurprijs)}</div></div>
            <div><div style={{ color: T.muted, fontSize: 11, textTransform: "uppercase" }}>Meubilering</div><div style={{ fontWeight: 600 }}>{detail.meubilering}</div></div>
          </div>
          {detail.notities && <div style={{ background: T.surface, borderRadius: 8, padding: 12, fontSize: 13, color: T.muted, marginBottom: 14, fontStyle: "italic" }}>{detail.notities}</div>}
          <Divider />
          <NotitieBox
            notities={notities.filter(n => n.eenheid_id === detail.id)}
            onAdd={f => addNotitie(detail.id, detail.pand_id, f)}
            onDelete={delNotitie}
          />
        </Modal>
      )}

      {modal && (
        <Modal title="Eenheid toevoegen" onClose={() => setModal(false)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Pand">
              <select value={form.pand_id} onChange={e => setForm({ ...form, pand_id: e.target.value })}>
                <option value="">Kies pand...</option>
                {panden.map(p => <option key={p.id} value={p.id}>{p.naam}</option>)}
              </select>
            </Field>
            <Field label="Naam"><input value={form.naam} onChange={e => setForm({ ...form, naam: e.target.value })} placeholder="Kamer 1, Studio A..." /></Field>
            <Field label="Type">
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                {["Kamer","Studio","Appartement","Woning","Bedrijf","Garage"].map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Verdieping">
              <select value={form.verdieping} onChange={e => setForm({ ...form, verdieping: e.target.value })}>
                {["BG","1","2","3","4","Zolder"].map(v => <option key={v}>{v}</option>)}
              </select>
            </Field>
            <Field label="Oppervlakte m²"><input type="number" value={form.oppervlakte} onChange={e => setForm({ ...form, oppervlakte: e.target.value })} placeholder="22" /></Field>
            <Field label="Streefhuur (€)"><input type="number" value={form.max_huurprijs} onChange={e => setForm({ ...form, max_huurprijs: e.target.value })} placeholder="750" /></Field>
            <Field label="Status">
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                {["Leeg","Verhuurd","In onderhoud","Renovatie"].map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Meubilering">
              <select value={form.meubilering} onChange={e => setForm({ ...form, meubilering: e.target.value })}>
                {["Ongemeubileerd","Gestoffeerd","Gemeubileerd"].map(m => <option key={m}>{m}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Notities"><textarea rows={2} value={form.notities} onChange={e => setForm({ ...form, notities: e.target.value })} placeholder="Bijzonderheden eenheid..." style={{ resize: "vertical" }} /></Field>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Btn onClick={save} disabled={loading}>{loading ? "Opslaan..." : "Opslaan"}</Btn>
            <Btn variant="ghost" onClick={() => setModal(false)}>Annuleren</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── HUURDERS ─────────────────────────────────────────────
function Huurders({ huurders, setHuurders, eenheden, panden, notities, setNotities }) {
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ naam: "", email: "", tel: "", eenheid_id: "", borg: "", bsn: "", notities: "" });

  async function save() {
    setLoading(true);
    const { data } = await sb.from("huurders").insert([{ ...form, eenheid_id: +form.eenheid_id || null, borg: +form.borg || null }]).select();
    if (data) { setHuurders([...huurders, data[0]]); setModal(false); }
    setLoading(false);
  }
  async function del(id) {
    if (!confirm("Huurder verwijderen?")) return;
    await sb.from("huurders").delete().eq("id", id);
    setHuurders(huurders.filter(h => h.id !== id));
  }

  return (
    <div className="fadeIn">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700 }}>Huurders</div>
          <div style={{ color: T.muted, fontSize: 13 }}>{huurders.length} huurders</div>
        </div>
        <Btn onClick={() => setModal(true)}>+ Huurder toevoegen</Btn>
      </div>
      <Card>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr>{["Naam","Eenheid","Pand","Email","Telefoon","Borg","Notities",""].map(h => (
              <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: T.muted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: .5, borderBottom: `1px solid ${T.border}` }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {huurders.map(h => {
              const eenheid = eenheden.find(e => e.id === h.eenheid_id);
              const pand = panden.find(p => p.id === eenheid?.pand_id);
              return (
                <tr key={h.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                  <td style={{ padding: "12px 12px" }}><div style={{ fontWeight: 600 }}>{h.naam}</div><div style={{ color: T.muted, fontSize: 11 }}>{h.bsn}</div></td>
                  <td style={{ padding: "12px 12px" }}>{eenheid ? <Tag label={eenheid.naam} color={T.blue} /> : "—"}</td>
                  <td style={{ padding: "12px 12px", color: T.muted, fontSize: 13 }}>{pand?.naam || "—"}</td>
                  <td style={{ padding: "12px 12px", color: T.muted, fontSize: 13 }}>{h.email}</td>
                  <td style={{ padding: "12px 12px", color: T.muted, fontSize: 13 }}>{h.tel}</td>
                  <td style={{ padding: "12px 12px", fontWeight: 600, color: T.accent }}>{h.borg ? eur(h.borg) : "—"}</td>
                  <td style={{ padding: "12px 12px", color: T.muted, fontSize: 12, fontStyle: "italic" }}>{h.notities?.slice(0, 40) || "—"}</td>
                  <td style={{ padding: "12px 12px" }}><Btn variant="danger" small onClick={() => del(h.id)}>✕</Btn></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
      {modal && (
        <Modal title="Huurder toevoegen" onClose={() => setModal(false)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Naam"><input value={form.naam} onChange={e => setForm({ ...form, naam: e.target.value })} /></Field>
            <Field label="Email"><input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></Field>
            <Field label="Telefoon"><input value={form.tel} onChange={e => setForm({ ...form, tel: e.target.value })} /></Field>
            <Field label="Eenheid">
              <select value={form.eenheid_id} onChange={e => setForm({ ...form, eenheid_id: e.target.value })}>
                <option value="">Kies eenheid...</option>
                {eenheden.map(e => { const p = panden.find(p => p.id === e.pand_id); return <option key={e.id} value={e.id}>{p?.naam} · {e.naam}</option>; })}
              </select>
            </Field>
            <Field label="BSN / KVK"><input value={form.bsn} onChange={e => setForm({ ...form, bsn: e.target.value })} placeholder="****123" /></Field>
            <Field label="Borg (€)"><input type="number" value={form.borg} onChange={e => setForm({ ...form, borg: e.target.value })} /></Field>
          </div>
          <Field label="Notities"><textarea rows={2} value={form.notities} onChange={e => setForm({ ...form, notities: e.target.value })} placeholder="Bijzonderheden huurder..." style={{ resize: "vertical" }} /></Field>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Btn onClick={save} disabled={loading}>{loading ? "Opslaan..." : "Opslaan"}</Btn>
            <Btn variant="ghost" onClick={() => setModal(false)}>Annuleren</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── FINANCIEN (compact) ──────────────────────────────────
function Financien({ transacties, setTransacties, panden, eenheden }) {
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filterPand, setFilterPand] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [form, setForm] = useState({ pand_id: "", eenheid_id: "", datum: new Date().toISOString().split("T")[0], omschrijving: "", bedrag: "", type: "inkomen", categorie: "Huur", notities: "" });

  const pandEenheden = form.pand_id ? eenheden.filter(e => e.pand_id === +form.pand_id) : [];

  async function save() {
    setLoading(true);
    const bedrag = form.type === "uitgaven" ? -Math.abs(+form.bedrag) : +form.bedrag;
    const { data } = await sb.from("transacties").insert([{ ...form, pand_id: +form.pand_id || null, eenheid_id: +form.eenheid_id || null, bedrag }]).select();
    if (data) { setTransacties([...transacties, data[0]]); setModal(false); }
    setLoading(false);
  }
  async function del(id) {
    await sb.from("transacties").delete().eq("id", id);
    setTransacties(transacties.filter(t => t.id !== id));
  }

  const filtered = transacties.filter(t =>
    (filterPand === "all" || t.pand_id === +filterPand) &&
    (filterType === "all" || t.type === filterType)
  ).sort((a, b) => b.datum?.localeCompare(a.datum));

  const totInk = filtered.filter(t => t.type === "inkomen").reduce((s, t) => s + +t.bedrag, 0);
  const totUit = filtered.filter(t => t.type === "uitgaven").reduce((s, t) => s + Math.abs(+t.bedrag), 0);

  return (
    <div className="fadeIn">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700 }}>Financiën</div>
          <div style={{ color: T.muted, fontSize: 13 }}>{filtered.length} transacties · netto {eur(totInk - totUit)}</div>
        </div>
        <Btn onClick={() => setModal(true)}>+ Transactie</Btn>
      </div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
        <Stat label="Inkomen"  value={eur(totInk)} color={T.green} icon="↑" />
        <Stat label="Uitgaven" value={eur(totUit)} color={T.red}   icon="↓" />
        <Stat label="Netto"    value={eur(totInk - totUit)} color={(totInk - totUit) >= 0 ? T.green : T.red} icon="=" />
      </div>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <select value={filterPand} onChange={e => setFilterPand(e.target.value)} style={{ flex: 1, width: "auto" }}>
            <option value="all">Alle panden</option>
            {panden.map(p => <option key={p.id} value={p.id}>{p.naam}</option>)}
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ flex: 1, width: "auto" }}>
            <option value="all">Inkomen + Uitgaven</option>
            <option value="inkomen">Inkomen</option>
            <option value="uitgaven">Uitgaven</option>
          </select>
        </div>
      </Card>
      <Card>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr>{["Datum","Pand","Eenheid","Omschrijving","Categorie","Bedrag","Notitie",""].map(h => (
              <th key={h} style={{ textAlign: "left", padding: "8px 10px", color: T.muted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: .5, borderBottom: `1px solid ${T.border}` }}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {filtered.map(t => {
              const pand = panden.find(p => p.id === t.pand_id);
              const eenheid = eenheden.find(e => e.id === t.eenheid_id);
              return (
                <tr key={t.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                  <td style={{ padding: "11px 10px", color: T.muted, fontSize: 13 }}>{t.datum}</td>
                  <td style={{ padding: "11px 10px", fontSize: 13 }}>{pand?.naam || "—"}</td>
                  <td style={{ padding: "11px 10px" }}>{eenheid ? <Tag label={eenheid.naam} color={T.blue} /> : "—"}</td>
                  <td style={{ padding: "11px 10px" }}>{t.omschrijving}</td>
                  <td style={{ padding: "11px 10px" }}><Tag label={t.categorie} color={t.type === "inkomen" ? T.green : T.red} /></td>
                  <td style={{ padding: "11px 10px", fontWeight: 700, color: +t.bedrag >= 0 ? T.green : T.red }}>{+t.bedrag >= 0 ? "+" : ""}{eur(Math.abs(+t.bedrag))}</td>
                  <td style={{ padding: "11px 10px", color: T.muted, fontSize: 12, fontStyle: "italic" }}>{t.notities?.slice(0, 30) || ""}</td>
                  <td style={{ padding: "11px 10px" }}><Btn variant="danger" small onClick={() => del(t.id)}>✕</Btn></td>
                </tr>
              );
            })}
            {!filtered.length && <tr><td colSpan={8} style={{ padding: 28, textAlign: "center", color: T.muted }}>Geen transacties</td></tr>}
          </tbody>
        </table>
      </Card>
      {modal && (
        <Modal title="Transactie toevoegen" onClose={() => setModal(false)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Pand">
              <select value={form.pand_id} onChange={e => setForm({ ...form, pand_id: e.target.value, eenheid_id: "" })}>
                <option value="">Kies pand...</option>
                {panden.map(p => <option key={p.id} value={p.id}>{p.naam}</option>)}
              </select>
            </Field>
            <Field label="Eenheid (optioneel)">
              <select value={form.eenheid_id} onChange={e => setForm({ ...form, eenheid_id: e.target.value })}>
                <option value="">Heel pand</option>
                {pandEenheden.map(e => <option key={e.id} value={e.id}>{e.naam}</option>)}
              </select>
            </Field>
            <Field label="Datum"><input type="date" value={form.datum} onChange={e => setForm({ ...form, datum: e.target.value })} /></Field>
            <Field label="Type">
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value, categorie: CATS[e.target.value][0] })}>
                <option value="inkomen">Inkomen</option>
                <option value="uitgaven">Uitgaven</option>
              </select>
            </Field>
            <Field label="Categorie">
              <select value={form.categorie} onChange={e => setForm({ ...form, categorie: e.target.value })}>
                {CATS[form.type].map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Bedrag (€)"><input type="number" value={form.bedrag} onChange={e => setForm({ ...form, bedrag: e.target.value })} /></Field>
          </div>
          <Field label="Omschrijving"><input value={form.omschrijving} onChange={e => setForm({ ...form, omschrijving: e.target.value })} placeholder="Huur kamer 1 - maart" /></Field>
          <Field label="Notities"><textarea rows={2} value={form.notities} onChange={e => setForm({ ...form, notities: e.target.value })} placeholder="Extra toelichting..." style={{ resize: "vertical" }} /></Field>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Btn onClick={save} disabled={loading}>{loading ? "Opslaan..." : "Opslaan"}</Btn>
            <Btn variant="ghost" onClick={() => setModal(false)}>Annuleren</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── BEHEERDERS ───────────────────────────────────────────
function Beheerders({ beheerders, setBeheerders }) {
  const [form, setForm] = useState({ naam: "", email: "", rol: "Beheerder" });
  async function save() {
    if (!form.naam || !form.email) return;
    const { data } = await sb.from("beheerders").insert([form]).select();
    if (data) { setBeheerders([...beheerders, data[0]]); setForm({ naam: "", email: "", rol: "Beheerder" }); }
  }
  async function del(id) {
    await sb.from("beheerders").delete().eq("id", id);
    setBeheerders(beheerders.filter(b => b.id !== id));
  }
  return (
    <div className="fadeIn">
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Beheerders</div>
      <div style={{ color: T.muted, fontSize: 13, marginBottom: 24 }}>Goksu Investment · {beheerders.length} gebruikers</div>
      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 600, marginBottom: 14 }}>Beheerder toevoegen</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input value={form.naam} onChange={e => setForm({ ...form, naam: e.target.value })} placeholder="Naam" style={{ flex: 1, minWidth: 140 }} />
          <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@goksunvest.nl" style={{ flex: 2, minWidth: 200 }} />
          <select value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value })} style={{ width: "auto" }}>
            <option>Eigenaar</option><option>Beheerder</option><option>Lezer</option>
          </select>
          <Btn onClick={save}>Toevoegen</Btn>
        </div>
      </Card>
      <Card>
        {beheerders.map(b => (
          <div key={b.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: T.accent + "33", display: "flex", alignItems: "center", justifyContent: "center", color: T.accent, fontWeight: 700, fontSize: 16 }}>{b.naam.charAt(0)}</div>
              <div><div style={{ fontWeight: 600 }}>{b.naam}</div><div style={{ color: T.muted, fontSize: 13 }}>{b.email}</div></div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Tag label={b.rol} color={b.rol === "Eigenaar" ? T.accent : T.blue} />
              {b.rol !== "Eigenaar" && <Btn variant="danger" small onClick={() => del(b.id)}>✕</Btn>}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────
const NAV = [
  { id: "dashboard",  label: "Dashboard",  icon: "◎" },
  { id: "panden",     label: "Panden",     icon: "🏛" },
  { id: "eenheden",   label: "Eenheden",   icon: "🏠" },
  { id: "huurders",   label: "Huurders",   icon: "👤" },
  { id: "financien",  label: "Financiën",  icon: "💶" },
  { id: "beheerders", label: "Beheerders", icon: "👥" },
];

export default function App() {
  const [view, setView]               = useState("dashboard");
  const [panden, setPanden]           = useState([]);
  const [eenheden, setEenheden]       = useState([]);
  const [huurders, setHuurders]       = useState([]);
  const [contracten, setContracten]   = useState([]);
  const [transacties, setTransacties] = useState([]);
  const [beheerders, setBeheerders]   = useState([]);
  const [notities, setNotities]       = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    async function load() {
      const [p, e, h, c, t, b, n] = await Promise.all([
        sb.from("panden").select("*").order("id"),
        sb.from("eenheden").select("*").order("pand_id"),
        sb.from("huurders").select("*").order("id"),
        sb.from("contracten").select("*").order("id"),
        sb.from("transacties").select("*").order("datum", { ascending: false }),
        sb.from("beheerders").select("*").order("id"),
        sb.from("notities").select("*").order("created_at", { ascending: false }),
      ]);
      setPanden(p.data || []);
      setEenheden(e.data || []);
      setHuurders(h.data || []);
      setContracten(c.data || []);
      setTransacties(t.data || []);
      setBeheerders(b.data || []);
      setNotities(n.data || []);
      setLoading(false);
    }
    load();
  }, []);

  const alertCount = contracten.filter(c => { const d = daysUntil(c.indexatiedatum); return d > 0 && d <= 90; }).length;
  const leegCount  = eenheden.filter(e => e.status === "Leeg").length;

  return (
    <>
      <style>{css}</style>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* Sidebar */}
        <div style={{ width: 220, background: T.surface, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh" }}>
          <div style={{ padding: "24px 20px 20px", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ fontFamily: "'Playfair Display', serif", color: T.accent, fontSize: 16, fontWeight: 700 }}>Goksu Investment</div>
            <div style={{ color: T.muted, fontSize: 11, marginTop: 3 }}>Vastgoed Beheer</div>
          </div>
          <nav style={{ padding: "16px 10px", flex: 1 }}>
            {NAV.map(item => (
              <button key={item.id} onClick={() => setView(item.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 9, border: "none", cursor: "pointer", background: view === item.id ? T.accent + "22" : "transparent", color: view === item.id ? T.accent : T.muted, fontWeight: view === item.id ? 600 : 400, fontSize: 14, marginBottom: 2, fontFamily: "inherit", textAlign: "left", transition: "all .15s" }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
                {item.id === "eenheden" && leegCount > 0 && <span style={{ marginLeft: "auto", background: T.red, color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>{leegCount}</span>}
                {item.id === "financien" && alertCount > 0 && <span style={{ marginLeft: "auto", background: T.accent, color: "#000", borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>{alertCount}</span>}
              </button>
            ))}
          </nav>
          <div style={{ padding: "16px 20px", borderTop: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.accent + "33", display: "flex", alignItems: "center", justifyContent: "center", color: T.accent, fontSize: 13, fontWeight: 700 }}>G</div>
              <div><div style={{ fontSize: 12, fontWeight: 600 }}>Goksu Kaya</div><div style={{ fontSize: 11, color: T.muted }}>Eigenaar</div></div>
            </div>
          </div>
        </div>

        {/* Main */}
        <div style={{ flex: 1, padding: "32px 36px", overflowY: "auto" }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: 14 }}>
              <Spinner />
              <div style={{ color: T.muted, fontSize: 14 }}>Laden uit Supabase...</div>
            </div>
          ) : (
            <>
              {view === "dashboard"  && <Dashboard panden={panden} eenheden={eenheden} transacties={transacties} contracten={contracten} />}
              {view === "panden"     && <Panden panden={panden} setPanden={setPanden} eenheden={eenheden} notities={notities} setNotities={setNotities} />}
              {view === "eenheden"   && <Eenheden eenheden={eenheden} setEenheden={setEenheden} panden={panden} notities={notities} setNotities={setNotities} />}
              {view === "huurders"   && <Huurders huurders={huurders} setHuurders={setHuurders} eenheden={eenheden} panden={panden} notities={notities} setNotities={setNotities} />}
              {view === "financien"  && <Financien transacties={transacties} setTransacties={setTransacties} panden={panden} eenheden={eenheden} />}
              {view === "beheerders" && <Beheerders beheerders={beheerders} setBeheerders={setBeheerders} />}
            </>
          )}
        </div>
      </div>
    </>
  );
}
