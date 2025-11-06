import React, { useEffect, useMemo, useState } from "react";
import { ShoppingCart, Plus, Minus, Trash2, Pencil, Save, X, Upload, Download, Search, LogIn, LogOut, PackageSearch, PackageOpen, Tag, Layers, Image as ImageIcon } from "lucide-react";

const CURRENCY = "ARS";
const fmt = (n) => new Intl.NumberFormat("es-AR", { style: "currency", currency: CURRENCY, maximumFractionDigits: 0 }).format(Number(n||0));
const uid = () => Math.random().toString(36).slice(2, 10);
const readFile = (file) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); });

const INITIAL_PRODUCTS = [
  { id: uid(), name: "Set Stanley 1.0 L + Mate + Bombilla", category: "BAZAR", price: 54999, stock: 12, desc: "Termo 1000 ml, mate 180 ml, bombilla. Varios colores.", image: "", tags: ["térmico","mate"], featured: true },
  { id: uid(), name: "Pava Eléctrica 2 L", category: "ELECTRO", price: 37999, stock: 7, desc: "1500W, corte automático, colores únicos.", image: "", tags: ["electro"], featured: true },
  { id: uid(), name: "Perfume Árabe Unisex 100 ml", category: "PERFUME", price: 45999, stock: 25, desc: "Fragancia intensa y original de larga duración.", image: "", tags: ["fragancia"], featured: false },
];

const CATEGORIES = ["TODOS","BAZAR","ELECTRO","PERFUME"];

export default function App() {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem("jx_store_products");
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem("jx_cart")||"[]"));
  const [admin, setAdmin] = useState(() => JSON.parse(localStorage.getItem("jx_admin")||"false"));
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("TODOS");
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pinInput, setPinInput] = useState("");

  useEffect(() => localStorage.setItem("jx_store_products", JSON.stringify(products)), [products]);
  useEffect(() => localStorage.setItem("jx_cart", JSON.stringify(cart)), [cart]);
  useEffect(() => localStorage.setItem("jx_admin", JSON.stringify(admin)), [admin]);

  const filtered = useMemo(() => products.filter(p => {
    const inCat = cat === "TODOS" || p.category === cat;
    const q = query.trim().toLowerCase();
    const inQ = !q || [p.name, p.desc, (p.tags||[]).join(" ")].join(" ").toLowerCase().includes(q);
    return inCat && inQ;
  }), [products, cat, query]);

  const total = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);

  const addToCart = (p) => setCart(prev => {
    const i = prev.findIndex(x => x.id === p.id);
    if (i >= 0) { const next = [...prev]; next[i] = { ...next[i], qty: Math.min(next[i].qty + 1, (p.stock||1)) }; return next; }
    return [...prev, { id: p.id, name: p.name, price: Number(p.price||0), qty: 1 }];
  });

  const changeQty = (id, d) => setCart(prev => prev.map(i => i.id===id?{...i, qty: Math.max(1, i.qty + d)}:i));
  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id!==id));

  const exportJSON = () => {
    const data = JSON.stringify(products, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "catalogo.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = async (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const txt = await f.text();
    try { const arr = JSON.parse(txt); if (Array.isArray(arr)) setProducts(arr); } catch {}
  };

  const startCreate = () => { setEditing({ id: uid(), name: "", category: "BAZAR", price: 0, stock: 0, desc: "", image: "", tags: [], featured: false }); setShowEditor(true); };
  const startEdit = (p) => { setEditing({ ...p }); setShowEditor(true); };
  const saveEdit = (p) => {
    setProducts(prev => {
      const i = prev.findIndex(x => x.id === p.id);
      if (i >= 0) { const next = [...prev]; next[i] = p; return next; }
      return [p, ...prev];
    });
    setShowEditor(false); setEditing(null);
  };
  const deleteProd = (id) => setProducts(prev => prev.filter(p => p.id!==id));

  const whatsappCheckout = () => {
    const phone = "5493804160373";
    const lines = cart.map(i=>`• ${i.qty}× ${i.name} – ${fmt(i.price*i.qty)}`);
    const msg = encodeURIComponent(`¡Hola! Quiero comprar estos productos:\\n${lines.join("\\n")}\\nTotal: ${fmt(total)}`);
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <header className="sticky top-0 z-40 backdrop-blur bg-neutral-950/70 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-fuchsia-500/20 grid place-items-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">ElectroHome</h1>
              <p className="text-xs text-white/60 -mt-0.5">La Rioja · Envíos a todo el país</p>
            </div>
          </div>

          <div className="hidden md:flex ml-6 flex-1 items-center gap-2">
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
              <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar producto..." className="w-full bg-white/5 rounded-xl pl-10 pr-4 py-2.5 outline-none border border-white/10 focus:border-white/25" />
            </div>
            <select value={cat} onChange={e=>setCat(e.target.value)} className="bg-white/5 rounded-xl px-3 py-2 border border-white/10">
              {CATEGORIES.map(c=> <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {!admin ? (
              <button onClick={()=>{
                if (pinInput === "2468") setAdmin(True); else alert("PIN incorrecto (pista: 2468)");
              }} className="hidden md:inline-flex items-center gap-2 bg-white text-black rounded-xl px-3 py-2 text-sm">
                <LogIn className="w-4 h-4"/> Admin
              </button>
            ) : (
              <button onClick={()=>setAdmin(false)} className="hidden md:inline-flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 text-sm">
                <LogOut className="w-4 h-4"/> Salir
              </button>
            )}
            <div className="relative">
              <button onClick={()=>document.getElementById("cart").showModal()} className="inline-flex items-center gap-2 bg-fuchsia-500 rounded-xl px-3 py-2 text-sm">
                <ShoppingCart className="w-4 h-4"/> Carrito ({cart.reduce((s,i)=>s+i.qty,0)})
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-6 items-center">
        <div>
          <h2 className="text-3xl md:text-5xl font-bold leading-tight">Catálogo editable para <span className="text-fuchsia-400">ventas digitales</span></h2>
          <p className="text-white/70 mt-3">Agregá, editá o borrá productos, gestioná precios y stock, y cerrá ventas por WhatsApp.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={startCreate} className="inline-flex items-center gap-2 bg-white text-black rounded-xl px-4 py-2">
              <Plus className="w-4 h-4"/> Nuevo producto
            </button>
            <label className="inline-flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2 cursor-pointer">
              <Upload className="w-4 h-4"/> Importar JSON
              <input onChange={importJSON} type="file" accept="application/json" className="hidden" />
            </label>
            <button onClick={exportJSON} className="inline-flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2">
              <Download className="w-4 h-4"/> Exportar JSON
            </button>
          </div>
          <p className="text-xs text-white/50 mt-3">PIN de Admin: 2468</p>
        </div>
        <div className="bg-gradient-to-br from-fuchsia-500/20 to-cyan-500/10 border border-white/10 rounded-2xl p-6">
          <div className="grid grid-cols-3 gap-3">
            {products.slice(0,3).map(p => (
              <div key={p.id} className="bg-white/5 rounded-xl p-3">
                <div className="aspect-square rounded-lg bg-black/30 grid place-items-center overflow-hidden">
                  {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover"/> : <ImageIcon className="w-8 h-8 text-white/40"/>}
                </div>
                <p className="mt-2 text-xs line-clamp-2">{p.name}</p>
                <div className="text-sm font-semibold">{fmt(p.price)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 pb-24">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-semibold flex items-center gap-2"><PackageSearch className="w-5 h-5"/> Productos</h3>
          {admin && (
            <button onClick={startCreate} className="inline-flex items-center gap-2 bg-white text-black rounded-xl px-3 py-2 text-sm"><Plus className="w-4 h-4"/> Agregar</button>
          )}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <article key={p.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
              <div className="relative">
                <div className="aspect-[4/3] bg-black/30 grid place-items-center overflow-hidden">
                  {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover"/> : <ImageIcon className="w-10 h-10 text-white/40"/>}
                </div>
                {p.featured && <span className="absolute top-2 left-2 text-[10px] bg-fuchsia-500 rounded-full px-2 py-1">Destacado</span>}
                <span className="absolute top-2 right-2 text-[10px] bg-white/10 rounded-full px-2 py-1 border border-white/10">{p.category}</span>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h4 className="font-semibold leading-tight line-clamp-2">{p.name}</h4>
                <p className="text-sm text-white/60 line-clamp-2 mt-1">{p.desc}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <div className="text-lg font-bold">{fmt(p.price)}</div>
                    <div className="text-xs text-white/60">Stock: {p.stock ?? 0}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {admin && (<><button onClick={()=>startEdit(p)} className="p-2 rounded-lg bg-white/10"><Pencil className="w-4 h-4"/></button><button onClick={()=>deleteProd(p.id)} className="p-2 rounded-lg bg-white/10"><Trash2 className="w-4 h-4"/></button></>)}
                    <button onClick={()=>addToCart(p)} className="inline-flex items-center gap-2 bg-fuchsia-500 rounded-xl px-3 py-2 text-sm"><Plus className="w-4 h-4"/> Agregar</button>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">{(p.tags||[]).map(t=> <span key={t} className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10">#{t}</span>)}</div>
              </div>
            </article>
          ))}
        </div>
      </main>

      <footer className="border-t border-white/10 py-10">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-6 text-sm text-white/70">
          <div><h5 className="font-semibold text-white mb-2">Contacto</h5><p>La Rioja, Argentina · Envíos a todo el país</p><p>WhatsApp: <a href="https://wa.me/5493804160373" className="underline">+54 9 380 416 0373</a></p></div>
          <div><h5 className="font-semibold text-white mb-2">Información</h5><ul className="space-y-1 list-disc ml-4"><li>Pagos: Transferencia / Efectivo / A convenir</li><li>Garantía de calidad</li><li>Asistencia por video del armado del pedido</li></ul></div>
          <div><h5 className="font-semibold text-white mb-2">Notas</h5><p>Admin PIN: 2468 · Editá productos desde el botón “Nuevo producto”.</p></div>
        </div>
        <p className="text-center text-xs text-white/40 mt-6">© {new Date().getFullYear()} ElectroHome — Hecho para convertir.</p>
      </footer>

      <dialog id="cart" className="modal">
        <div className="modal-box bg-neutral-900 text-white border border-white/10 max-w-2xl p-6">
          <h3 className="font-bold text-lg flex items-center gap-2"><ShoppingCart className="w-5 h-5"/> Tu carrito</h3>
          <div className="mt-4 space-y-3 max-h-[50vh] overflow-auto pr-1">
            {cart.length===0 && <p className="text-white/60 text-sm">Aún no agregaste productos.</p>}
            {cart.map(i => (
              <div key={i.id} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                <div><p className="font-medium">{i.name}</p><p className="text-xs text-white/60">{fmt(i.price)} c/u</p></div>
                <div className="flex items-center gap-2">
                  <button onClick={()=>changeQty(i.id,-1)} className="p-2 bg-white/10 rounded-lg"><Minus className="w-4 h-4"/></button>
                  <span className="w-8 text-center">{i.qty}</span>
                  <button onClick={()=>changeQty(i.id,1)} className="p-2 bg-white/10 rounded-lg"><Plus className="w-4 h-4"/></button>
                  <button onClick={()=>removeFromCart(i.id)} className="p-2 bg-white/10 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between"><div className="text-white/80">Total</div><div className="text-xl font-bold">{fmt(total)}</div></div>
          <div className="mt-4 flex gap-2 justify-end"><button onClick={whatsappCheckout} className="bg-fuchsia-500 rounded-xl px-4 py-2">Finalizar por WhatsApp</button><form method="dialog"><button className="bg-white/10 rounded-xl px-4 py-2">Cerrar</button></form></div>
        </div>
        <form method="dialog" className="modal-backdrop"><button>close</button></form>
      </dialog>

      {showEditor && (<EditorModal initial={editing} onClose={()=>{ setShowEditor(false); setEditing(null); }} onSave={saveEdit} />)}
    </div>
  );
}

function EditorModal({ initial, onClose, onSave }) {
  const [p, setP] = useState(initial);
  const set = (k, v) => setP(prev => ({...prev, [k]: v}));
  return (
    <div className="fixed inset-0 z-50 bg-black/60 grid place-items-center p-4">
      <div className="w-full max-w-2xl bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between border-b border-white/10">
          <h4 className="font-semibold flex items-center gap-2"><PackageOpen className="w-5 h-5"/> {initial?.name ? "Editar" : "Nuevo"} producto</h4>
          <button onClick={onClose} className="p-2 bg-white/10 rounded-lg"><X className="w-4 h-4"/></button>
        </div>
        <div className="p-5 grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="text-sm text-white/70">Nombre</label>
            <input value={p.name} onChange={e=>set("name", e.target.value)} className="w-full bg-white/5 rounded-xl px-3 py-2 border border-white/10" />
            <label className="text-sm text-white/70">Categoría</label>
            <select value={p.category} onChange={e=>set("category", e.target.value)} className="w-full bg-white/5 rounded-xl px-3 py-2 border border-white/10">
              {CATEGORIES.filter(c=>c!=="TODOS").map(c=> <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm text-white/70">Precio</label><input type="number" value={p.price} onChange={e=>set("price", Number(e.target.value))} className="w-full bg-white/5 rounded-xl px-3 py-2 border border-white/10" /></div>
              <div><label className="text-sm text-white/70">Stock</label><input type="number" value={p.stock} onChange={e=>set("stock", Number(e.target.value))} className="w-full bg-white/5 rounded-xl px-3 py-2 border border-white/10" /></div>
            </div>
            <label className="text-sm text-white/70">Etiquetas (coma)</label>
            <input value={(p.tags||[]).join(", ")} onChange={e=>set("tags", e.target.value.split(",").map(t=>t.trim()).filter(Boolean))} className="w-full bg-white/5 rounded-xl px-3 py-2 border border-white/10" />
            <div className="flex items-center gap-2"><input id="featured" type="checkbox" checked={!!p.featured} onChange={e=>set("featured", e.target.checked)} /><label htmlFor="featured" className="text-sm">Destacado</label></div>
          </div>
          <div className="space-y-3">
            <label className="text-sm text-white/70">Descripción</label>
            <textarea value={p.desc} onChange={e=>set("desc", e.target.value)} className="w-full min-h-[120px] bg-white/5 rounded-xl px-3 py-2 border border-white/10" />
            <label className="text-sm text-white/70">Imagen</label>
            <div className="flex items-center gap-3 mt-1">
              <div className="w-28 h-28 rounded-xl bg-black/30 grid place-items-center overflow-hidden">
                {p.image ? <img src={p.image} alt="preview" className="w-full h-full object-cover"/> : <ImageIcon className="w-6 h-6 text-white/40"/>}
              </div>
              <label className="inline-flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 border border-white/10 cursor-pointer">
                <Upload className="w-4 h-4"/> Subir
                <input type="file" accept="image/*" className="hidden" onChange={async e=>{ const f=e.target.files?.[0]; if(!f) return; const b64=await readFile(f); set("image", b64); }} />
              </label>
              {p.image && <button onClick={()=>set("image","")} className="inline-flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 border border-white/10"><Trash2 className="w-4 h-4"/> Quitar</button>}
            </div>
          </div>
        </div>
        <div className="px-5 py-4 border-t border-white/10 flex items-center justify-end gap-2">
          <button onClick={onClose} className="bg-white/10 rounded-xl px-4 py-2">Cancelar</button>
          <button onClick={()=>onSave(p)} className="inline-flex items-center gap-2 bg-white text-black rounded-xl px-4 py-2"><Save className="w-4 h-4"/> Guardar</button>
        </div>
      </div>
    </div>
  );
}
