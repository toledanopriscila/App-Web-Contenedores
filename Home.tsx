/*
  Filosofía visual elegida: Neo-Industrial CleanOps.
  Este archivo implementa un tablero administrativo de lectura rápida: base blanco técnico,
  acentos azul petróleo, estados verdes/rojos estrictamente operativos, tarjetas compactas,
  tipografía técnica para números y microinteracciones sobrias.
*/
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AlertTriangle, CalendarClock, CheckCircle2, Cog, Container, Search, XCircle } from "lucide-react";

type Rental = {
  client: string;
  location: string;
  days: number;
  total: number;
  startDate: string;
  dueDate: string;
};

type ContainerItem = {
  id: number;
  status: "available" | "occupied";
  rental?: Rental;
};

const HERO_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663651797908/MDTUvBTatCao68EjYJwrUx/servicios-maipu-container-hero-T5Dbg2EJmz2ZwDqxqU62Nq.webp";
const CARD_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663651797908/MDTUvBTatCao68EjYJwrUx/servicios-maipu-container-card-E8zbJuP3VaJkJ6h4wFbfbq.webp";
const ALERT_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663651797908/MDTUvBTatCao68EjYJwrUx/servicios-maipu-alert-panel-9NWCRzCaysv8Bn8foX4D4w.webp";

// Container images - single custom image from user
const CONTAINER_IMAGES = [
  "/manus-storage/container-custom_64584f08.png",
];

function getContainerImage(id: number): string {
  return CONTAINER_IMAGES[(id - 1) % CONTAINER_IMAGES.length];
}

const STORAGE_KEY = "servicios-maipu-containers";
const PRICE_KEY = "servicios-maipu-price";

function createInitialContainers(): ContainerItem[] {
  return Array.from({ length: 20 }, (_, index) => ({
    id: index + 1,
    status: "available",
  }));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function calculateDueDate(days: number) {
  const due = new Date();
  due.setDate(due.getDate() + Number(days || 0));
  due.setHours(18, 0, 0, 0);
  return due.toISOString();
}

function daysRemaining(dueDate?: string) {
  if (!dueDate) return 0;
  const now = new Date();
  const due = new Date(dueDate);
  const diff = due.getTime() - now.getTime();
  // Usar Math.ceil para redondear hacia arriba (si hay horas restantes, cuenta como 1 día)
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function isDueTomorrow(container: ContainerItem) {
  if (container.status !== "occupied" || !container.rental?.dueDate) return false;
  const remaining = daysRemaining(container.rental.dueDate);
  // Mostrar si quedan 0, 1 o 2 días (vence hoy, mañana o pasado mañana)
  return remaining >= 0 && remaining <= 2;
}

export default function Home() {
  const [containers, setContainers] = useState<ContainerItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : createInitialContainers();
    } catch {
      return createInitialContainers();
    }
  });
  const [pricePerDay, setPricePerDay] = useState<number>(() => {
    const saved = localStorage.getItem(PRICE_KEY);
    return saved ? Number(saved) : 18000;
  });
  const [selectedContainer, setSelectedContainer] = useState<ContainerItem | null>(null);
  const [showRentalModal, setShowRentalModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({ client: "", location: "", days: 1 });
  const [priceDraft, setPriceDraft] = useState(pricePerDay);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(containers));
  }, [containers]);

  useEffect(() => {
    localStorage.setItem(PRICE_KEY, String(pricePerDay));
    setPriceDraft(pricePerDay);
  }, [pricePerDay]);

  const stats = useMemo(() => {
    const occupied = containers.filter((item) => item.status === "occupied").length;
    return {
      occupied,
      available: containers.length - occupied,
    };
  }, [containers]);

  const tomorrowPickups = useMemo(() => containers.filter(isDueTomorrow), [containers]);

  const filteredContainers = useMemo(() => {
    const cleanSearch = searchTerm.trim();
    if (!cleanSearch) return containers;
    return containers.filter((item) => String(item.id).includes(cleanSearch));
  }, [containers, searchTerm]);

  const liveTotal = Number(form.days || 0) * Number(pricePerDay || 0);

  function openRental(container: ContainerItem) {
    if (container.status !== "available") return;
    setSelectedContainer(container);
    setForm({ client: "", location: "", days: 1 });
    setShowRentalModal(true);
  }

  function saveRental(event: FormEvent) {
    event.preventDefault();
    if (!selectedContainer || !form.client.trim() || !form.location.trim() || form.days < 1) return;

    const rental: Rental = {
      client: form.client.trim(),
      location: form.location.trim(),
      days: Number(form.days),
      total: liveTotal,
      startDate: new Date().toISOString(),
      dueDate: calculateDueDate(Number(form.days)),
    };

    setContainers((current) =>
      current.map((item) =>
        item.id === selectedContainer.id
          ? { ...item, status: "occupied", rental }
          : item,
      ),
    );
    setShowRentalModal(false);
    setSelectedContainer(null);
  }

  function releaseContainer(id: number) {
    setContainers((current) =>
      current.map((item) => (item.id === id ? { id: item.id, status: "available" } : item)),
    );
  }

  function savePrice(event: FormEvent) {
    event.preventDefault();
    if (priceDraft < 0) return;
    setPricePerDay(Number(priceDraft));
    setShowConfigModal(false);
  }

  function resetDemo() {
    setContainers(createInitialContainers());
    setSearchTerm("");
  }

  return (
    <main className="app-shell">
      <nav className="navbar navbar-expand-lg sticky-top clean-navbar">
        <div className="container-fluid px-3 px-lg-4">
          <a className="navbar-brand d-flex align-items-center gap-2" href="#top" aria-label="Servicios Maipú">
            <span className="brand-mark"><Container size={22} /></span>
            <span>
              <strong>Servicios Maipú</strong>
              <small>Gestión de contenedores</small>
            </span>
          </a>
          <div className="d-flex align-items-center gap-2 ms-auto">
            <button className="btn btn-outline-primary btn-clean" type="button" onClick={() => setShowConfigModal(true)}>
              <Cog size={17} /> Configuración
            </button>
          </div>
        </div>
      </nav>

      <section id="top" className="hero-strip" style={{ backgroundImage: `linear-gradient(90deg, rgba(248,251,252,.98) 0%, rgba(248,251,252,.92) 45%, rgba(248,251,252,.34) 100%), url(${HERO_IMAGE})` }}>
        <div className="container-fluid px-3 px-lg-4">
          <div className="row align-items-end g-4">
            <div className="col-lg-7">
              <h1>Servicios Maipú</h1>
              <p className="hero-copy mb-0">Gestión de contenedores</p>
            </div>
            <div className="col-lg-5">
              <div className="price-pill ms-lg-auto">
                <span>Precio por día configurado</span>
                <strong>{formatCurrency(pricePerDay)}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-fluid px-3 px-lg-4 dashboard-area">
        <div className="stats-grid mb-4">
          <article className="stat-card stat-available">
            <div>
              <span>Contenedores libres</span>
              <strong>{stats.available}</strong>
            </div>
            <CheckCircle2 aria-hidden="true" />
          </article>
          <article className="stat-card stat-occupied">
            <div>
              <span>Contenedores ocupados</span>
              <strong>{stats.occupied}</strong>
            </div>
            <XCircle aria-hidden="true" />
          </article>
        </div>

        <section className="tomorrow-panel mb-4" style={{ backgroundImage: `linear-gradient(90deg, rgba(255,255,255,.96), rgba(255,255,255,.86)), url(${ALERT_IMAGE})` }}>
          <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
            <div>
              <p className="eyebrow mb-1 text-danger">Retiros para mañana</p>
              <h2 className="mb-1">Contenedores que vencen en las próximas 24 horas</h2>
              <p className="mb-0 muted-copy">La lista se actualiza automáticamente según la fecha de vencimiento guardada en cada alquiler.</p>
            </div>
            <span className="alert-count"><AlertTriangle size={18} /> {tomorrowPickups.length} alertas</span>
          </div>
          <div className="pickup-list mt-3">
            {tomorrowPickups.length === 0 ? (
              <div className="empty-alert">No hay retiros programados para las próximas 24 horas.</div>
            ) : (
              tomorrowPickups.map((item) => (
                <div className="pickup-item" key={item.id}>
                  <strong>#{String(item.id).padStart(2, "0")}</strong>
                  <span>{item.rental?.client}</span>
                  <small>{item.rental?.location}</small>
                </div>
              ))
            )}
          </div>
        </section>

        <div className="toolbar-card mb-4">
          <div className="search-box">
            <Search size={18} />
            <input
              type="number"
              inputMode="numeric"
              className="form-control"
              placeholder="Buscar por número de contenedor"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              aria-label="Buscar contenedor por número"
            />
          </div>
          <button className="btn btn-outline-secondary btn-clean" type="button" onClick={resetDemo}>Limpiar registros</button>
        </div>

        <section className="containers-grid" aria-label="Cuadrícula de contenedores">
          {filteredContainers.map((item, index) => {
            const remaining = daysRemaining(item.rental?.dueDate);
            const occupied = item.status === "occupied";
            return (
              <article
                key={item.id}
                className={`container-card ${occupied ? "is-occupied" : "is-available"}`}
                style={{ animationDelay: `${index * 35}ms` }}
              >
                <button
                  type="button"
                  className="container-card-button"
                  onClick={() => openRental(item)}
                  disabled={occupied}
                  aria-label={occupied ? `Contenedor ${item.id} ocupado` : `Registrar alquiler para contenedor ${item.id}`}
                >
                  <div className="card-status-line" />
                  <div className="card-topline">
                    <span className="status-chip">{occupied ? "Ocupado" : "Disponible"}</span>
                    <span className="container-number">#{String(item.id).padStart(2, "0")}</span>
                  </div>
                  <div className="container-image-wrap">
                    <img src={getContainerImage(item.id)} alt={`Contenedor ${item.id}`} />
                  </div>
                  {occupied && item.rental ? (
                    <div className="rental-detail">
                      <strong>{item.rental.client}</strong>
                      <span>{item.rental.location}</span>
                      <small className="rental-total">Total: {formatCurrency(item.rental.total)}</small>
                    </div>
                  ) : (
                    <div className="available-hint">Clic para cargar alquiler</div>
                  )}
                </button>
                {occupied && (
                  <div className="reminder-band">
                    Quedan <strong>{remaining}</strong> días para retirar
                    <button className="btn btn-sm btn-light release-btn" type="button" onClick={() => releaseContainer(item.id)}>Liberar</button>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      </section>

      {showRentalModal && selectedContainer && (
        <div className="modal fade show d-block clean-modal" tabIndex={-1} role="dialog" aria-modal="true">
          <div className="modal-backdrop-custom" onClick={() => setShowRentalModal(false)} />
          <div className="modal-dialog modal-dialog-centered">
            <form className="modal-content" onSubmit={saveRental}>
              <div className="modal-header">
                <div>
                  <p className="eyebrow mb-1">Nuevo alquiler</p>
                  <h3 className="modal-title">Contenedor #{String(selectedContainer.id).padStart(2, "0")}</h3>
                </div>
                <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setShowRentalModal(false)} />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Cliente:</label>
                  <input type="text" className="form-control" value={form.client} onChange={(event) => setForm({ ...form, client: event.target.value })} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Ubicación:</label>
                  <input type="text" className="form-control" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} required />
                </div>
                <div className="row g-3 align-items-end">
                  <div className="col-6">
                    <label className="form-label">Días:</label>
                    <input type="number" min="1" className="form-control" value={form.days} onChange={(event) => setForm({ ...form, days: Number(event.target.value) })} required />
                  </div>
                  <div className="col-6">
                    <div className="live-total">
                      <span>Total a cobrar</span>
                      <strong>{formatCurrency(liveTotal)}</strong>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline-secondary btn-clean" onClick={() => setShowRentalModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary btn-clean">Guardar alquiler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showConfigModal && (
        <div className="modal fade show d-block clean-modal" tabIndex={-1} role="dialog" aria-modal="true">
          <div className="modal-backdrop-custom" onClick={() => setShowConfigModal(false)} />
          <div className="modal-dialog modal-dialog-centered">
            <form className="modal-content" onSubmit={savePrice}>
              <div className="modal-header">
                <div>
                  <p className="eyebrow mb-1">Configuración</p>
                  <h3 className="modal-title">Precio por día</h3>
                </div>
                <button type="button" className="btn-close" aria-label="Cerrar" onClick={() => setShowConfigModal(false)} />
              </div>
              <div className="modal-body">
                <label className="form-label">Valor diario del alquiler</label>
                <div className="input-group">
                  <span className="input-group-text">$</span>
                  <input type="number" min="0" className="form-control" value={priceDraft} onChange={(event) => setPriceDraft(Number(event.target.value))} />
                </div>
                <p className="config-note mt-3 mb-0">Este importe se usa inmediatamente para calcular el total automático al cargar un nuevo alquiler.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary btn-clean" onClick={() => setShowConfigModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary btn-clean">Guardar precio</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
