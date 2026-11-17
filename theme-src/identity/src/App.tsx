import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  ArrowRight,
  Check,
  Copy,
  Download,
  Globe,
  Instagram,
  Mail,
  MessageCircle,
  Pause,
  Phone,
  Play,
  Radio,
  Share2,
  X,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { profile } from "./profile";
import { downloadContact, safeUrl } from "./actions";
import { IdentityStory } from "./components/IdentityStory";

function App() {
  const [systemReduced, setSystemReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [paused, setPaused] = useState(false);
  const [compactViewport, setCompactViewport] = useState(
    () =>
      matchMedia("(orientation: landscape) and (max-height: 650px)").matches,
  );
  const [message, setMessage] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const app = useRef<HTMLDivElement>(null);
  const shareInput = useRef<HTMLInputElement>(null);
  const lowPower =
    typeof navigator !== "undefined" &&
    (!!(navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection?.saveData ||
      ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ??
        8) <= 2);
  const motionLocked =
    systemReduced ||
    profile.appearance.motion === "off" ||
    lowPower ||
    compactViewport;
  const reduced = motionLocked || paused;
  const [videoReady, setVideoReady] = useState(false);
  useEffect(() => {
    const q = matchMedia("(prefers-reduced-motion: reduce)");
    const listener = () => setSystemReduced(q.matches);
    q.addEventListener("change", listener);
    const compact = matchMedia(
      "(orientation: landscape) and (max-height: 650px)",
    );
    const resize = () => setCompactViewport(compact.matches);
    compact.addEventListener("change", resize);
    return () => {
      q.removeEventListener("change", listener);
      compact.removeEventListener("change", resize);
    };
  }, []);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 4500);
    return () => clearTimeout(timer);
  }, [message]);
  useLayoutEffect(() => {
    if (reduced) return;
    const context = gsap.context(() => {
      document.querySelectorAll(".scroll-reveal").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.75,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 92%", once: true },
          },
        );
      });
    }, app);
    return () => context.revert();
  }, [reduced]);
  useEffect(() => {
    document.documentElement.style.scrollBehavior = reduced ? "auto" : "";
    ScrollTrigger.refresh();
    return () => {
      document.documentElement.style.scrollBehavior = "";
    };
  }, [reduced]);
  useEffect(() => {
    if (reduced || !profile.appearance.video) return;
    const timer = window.setTimeout(() => setVideoReady(true), 1500);
    return () => window.clearTimeout(timer);
  }, [reduced]);

  function saveContact() {
    try {
      downloadContact(profile);
      setMessage("Kontakt faylı hazırdır. Telefonda açıb yadda saxla.");
    } catch {
      setMessage(
        "Kontakt faylı yaradıla bilmədi. Zəng və ya mesaj keçidindən istifadə et.",
      );
    }
  }
  async function share() {
    const url = profile.canonicalUrl || window.location.href.split("#")[0];
    const data = {
      title: `${profile.name} — Beyond the Card`,
      text: "Bir addan daha artıq. Bir kimlik.",
      url,
    };
    if (navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
      }
    }
    setShareUrl(url);
    setCopied(false);
    setShareMessage("");
    dialog.current?.showModal();
  }
  async function copyUrl() {
    setCopied(false);
    setShareMessage("");
    try {
      await navigator.clipboard.writeText(shareUrl);
      if (!dialog.current?.open) return;
      setCopied(true);
      setShareMessage("Profil linki kopyalandı.");
    } catch {
      if (!dialog.current?.open) return;
      shareInput.current?.focus();
      shareInput.current?.select();
      setShareMessage("Linki seçdim. Brauzerin kopyalama əmrindən istifadə et.");
    }
  }
  const style = {
    "--bg": profile.appearance.background,
    "--accent": profile.appearance.accent,
    "--card": profile.appearance.card,
    "--display": profile.appearance.displayFont,
  } as CSSProperties;
  const socials = profile.social.filter((s) => safeUrl(s.url));
  const whatsapp = socials.find((s) => s.icon === "message");

  return (
    <div
      ref={app}
      className={`app ${reduced ? "motion-reduced" : ""}`}
      style={style}
    >
      <a className="skip-link" href="#about">
        Məzmuna keç
      </a>
      <header className="site-header">
        <a
          href="#identity"
          className="wordmark"
          aria-label={`${profile.name} — başlanğıc`}
        >
          <span className="monogram">
            {profile.monogram}
            <i />
          </span>
          <span>
            {profile.name.toLocaleUpperCase("az")}
            <small>DIGITAL IDENTITY</small>
          </span>
        </a>
        <nav aria-label="Əsas naviqasiya">
          <a className="nav-about" href="#about">
            Hekayə
          </a>
          <a className="nav-contact" href="#contact">
            Əlaqə yarat <ArrowUpRight size={16} />
          </a>
          <button
            className="motion-control"
            disabled={motionLocked}
            onClick={() => setPaused((p) => !p)}
            aria-label={
              motionLocked
                ? "Cihaz ayarına uyğun azaldılmış hərəkət"
                : paused
                  ? "Animasiyanı başlat"
                  : "Animasiyanı dayandır"
            }
            aria-pressed={reduced}
            title={
              motionLocked
                ? "Cihaz ayarına uyğun azaldılmış hərəkət"
                : paused
                  ? "Animasiyanı başlat"
                  : "Animasiyanı dayandır"
            }
          >
            {reduced ? <Play size={14} /> : <Pause size={14} />}
          </button>
        </nav>
      </header>
      {profile.appearance.video && (
        <div className="video-atmosphere" aria-hidden="true">
          <img src={profile.appearance.video.poster} alt="" />
          {!reduced && videoReady && (
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="none"
              poster={profile.appearance.video.poster}
            >
              <source src={profile.appearance.video.src} type="video/mp4" />
            </video>
          )}
        </div>
      )}
      <main>
        <IdentityStory profile={profile} reduced={reduced} />
        <section className="about-section section-shell" id="about">
          <div className="section-marker">
            <span>01 / HEKAYƏ</span>
            <span>OBYEKTİN ARXASINDA BİR İNSAN VAR.</span>
          </div>
          <div className="about-grid">
            <div className="about-heading scroll-reveal">
              <h2>
                Bir ad deyil.
                <br />
                <span className="outline-text">Bir hekayə.</span>
              </h2>
              <p className="about-note">
                Təqdimatlar qısa.
                <br />
                Yaxşı söhbətlər uzun olsun.
              </p>
            </div>
            <div className="about-body scroll-reveal">
              <span className="tiny-label">TANIŞ OLAQ</span>
              <p className="biography">{profile.biography}</p>
              <div className="about-signature">
                <span className="signature">{profile.name}</span>
                <span>{profile.location}</span>
              </div>
            </div>
          </div>
          <div className="quote-grid scroll-reveal">
            <div className="portrait-study">
              <img
                src={profile.portrait.src}
                alt={profile.portrait.alt}
                loading="lazy"
                decoding="async"
                style={{ objectPosition: profile.portrait.position }}
              />
              <span>PORTRET / 01</span>
            </div>
            <blockquote>
              <span className="quote-symbol" aria-hidden="true">
                “
              </span>
              {profile.quote}
              <cite>— {profile.name}</cite>
            </blockquote>
            <span className="side-label" aria-hidden="true">
              EVERY IDENTITY HAS A STORY
            </span>
          </div>
          {profile.additionalPhotos && profile.additionalPhotos.length > 0 && (
            <div className="additional-photos">
              {profile.additionalPhotos.map((photo) => (
                <img
                  key={photo.src}
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                />
              ))}
            </div>
          )}
        </section>
        {profile.sections?.map((section) => (
          <section
            key={section.title}
            className="custom-section section-shell scroll-reveal"
          >
            <h2>{section.title}</h2>
            <p>{section.text}</p>
          </section>
        ))}
        <section className="social-section section-shell" id="social">
          <div className="section-marker">
            <span>02 / RƏQƏMSAL İZ</span>
            <span>EYNİ İNSAN. FƏRQLİ TƏRƏFLƏR.</span>
          </div>
          <div className="social-head scroll-reveal">
            <h2>
              Söhbətin
              <br />
              <span>davamı.</span>
            </h2>
            <p>
              Bəzən bir mesaj kifayətdir.
              <br />
              Haradan başlamaq sənə qalıb.
            </p>
          </div>
          <div className="social-list">
            {socials.map((social, index) => {
              const Icon =
                social.icon === "instagram"
                  ? Instagram
                  : social.icon === "message"
                    ? MessageCircle
                    : Globe;
              return (
                <a
                  key={social.url}
                  className="social-row scroll-reveal"
                  href={social.url}
                  onClick={() => {
                    if (!social.id || !profile.clickEndpoint) return;
                    const key = `clicked-${social.id}`;
                    try {
                      if (sessionStorage.getItem(key)) return;
                      sessionStorage.setItem(key, "true");
                    } catch { /* Storage-disabled browsers still follow the link. */ }
                    fetch(`${profile.clickEndpoint}/${social.id}`, { keepalive: true }).catch(() => {});
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${profile.name} — ${social.label} (yeni tab)`}
                >
                  <span className="social-index">0{index + 1}</span>
                  <Icon className="social-icon" size={22} strokeWidth={1.25} />
                  <span className="social-name">{social.label}</span>
                  <span className="social-description">
                    {social.description}
                  </span>
                  <span className="social-arrow">
                    <ArrowUpRight size={24} strokeWidth={1} />
                  </span>
                </a>
              );
            })}
          </div>
          <div className="social-end">
            <span className="live-dot" /> REAL ƏLAQƏ. ARADA HEÇ NƏ YOX.
          </div>
        </section>
        <section className="contact-section" id="contact">
          <div className="contact-inner section-shell">
            <div className="section-marker">
              <span>03 / İLK ADDIM</span>
              <span>BİR TOXUNUŞ YETƏR.</span>
            </div>
            <div className="contact-layout">
              <div className="contact-copy scroll-reveal">
                <span className="tiny-label">A CONNECTION STARTS HERE.</span>
                <h2>
                  Bir salam.
                  <br />
                  <em>Yeni hekayə.</em>
                </h2>
                <p>
                  Bu tanışlıq burada bitməsin.
                  <br />
                  Nömrəmi saxla, söhbətə sonra davam edək.
                </p>
                <button className="primary-action" onClick={saveContact}>
                  <Download size={19} />
                  <span>Kontaktı saxla</span>
                  <ArrowUpRight size={20} />
                </button>
                <span className="contact-hint">
                  VCARD · BİRBAŞA TELEFON KİTABÇANA
                </span>
              </div>
              <div className="contact-sculpture" aria-hidden="true">
                <span className="orbit orbit-one" />
                <span className="orbit orbit-two" />
                <div className="signature-card">
                  <span className="signature-card-top">
                    BEYOND THE CARD <Radio size={17} />
                  </span>
                  <span className="signature-monogram">{profile.monogram}</span>
                  <span className="signature-card-bottom">
                    {profile.name}
                    <ArrowUpRight size={18} />
                  </span>
                </div>
                <span className="object-caption">
                  FİZİKİ OBYEKT. RƏQƏMSAL DAVAM.
                </span>
              </div>
            </div>
            <div className="contact-links">
              {profile.phone && (
                <a href={`tel:${profile.phone}`}>
                  <Phone size={16} />
                  <span>Zəng et</span>
                  <ArrowUpRight size={16} />
                </a>
              )}
              {profile.email && (
                <a href={`mailto:${profile.email}`}>
                  <Mail size={16} />
                  <span>E-poçt</span>
                  <ArrowUpRight size={16} />
                </a>
              )}
              {whatsapp && (
                <a
                  href={whatsapp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle size={16} />
                  <span>Mesaj yaz</span>
                  <ArrowUpRight size={16} />
                </a>
              )}
              <button onClick={share}>
                <Share2 size={16} />
                <span>Profili paylaş</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer section-shell">
        <a className="footer-brand" href="#identity">
          <span className="monogram">
            {profile.monogram}
            <i />
          </span>
          <span>
            {profile.name}
            <small>MORE THAN A NAME. AN IDENTITY.</small>
          </span>
        </a>
        <span className="footer-credit">
          CRAFTED FOR CONNECTION
          <br />
          <strong>NFC BAKU / IDENTITY</strong>
        </span>
        <a className="back-top" href="#identity" aria-label="Yuxarı qayıt">
          <ArrowDown size={18} />
        </a>
      </footer>
      <div
        className={`toast ${message ? "visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        {message && (
          <>
            <Check size={17} />
            <span>{message}</span>
          </>
        )}
      </div>
      <dialog
        ref={dialog}
        className="share-dialog"
        onClose={() => {
          setCopied(false);
          setShareMessage("");
        }}
        onClick={(event) => {
          if (event.target === dialog.current) dialog.current.close();
        }}
        aria-labelledby="share-title"
      >
        <button
          className="dialog-close"
          onClick={() => dialog.current?.close()}
          aria-label="Bağla"
        >
          <X size={20} />
        </button>
        <span className="tiny-label">ƏLAQƏNİ DAVAM ETDİR</span>
        <h2 id="share-title">Kimliyi paylaş.</h2>
        <p>Linki kopyala və istədiyin yerdə paylaş.</p>
        <label htmlFor="profile-url">Profil linki</label>
        <input
          id="profile-url"
          ref={shareInput}
          value={shareUrl}
          readOnly
          onFocus={(e) => e.target.select()}
        />
        <button className="primary-action" onClick={copyUrl}>
          {copied ? <Check size={18} /> : <Copy size={18} />}
          <span>{copied ? "Kopyalandı" : "Linki kopyala"}</span>
        </button>
        <p className="share-feedback" role="status" aria-live="polite" aria-atomic="true">
          {shareMessage}
        </p>
      </dialog>
    </div>
  );
}
export default App;
