import { useLayoutEffect, useRef } from "react";
import { ArrowDown, ArrowUpRight, MoveUpRight, Radio } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Profile } from "../profile";
gsap.registerPlugin(ScrollTrigger);

export function IdentityStory({
  profile,
  reduced,
}: {
  profile: Profile;
  reduced: boolean;
}) {
  const section = useRef<HTMLElement>(null);
  const shell = useRef<HTMLDivElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const cardName = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const root = section.current!;
    const syncScene = (progress: number) => {
      root.dataset.progress = progress.toFixed(3);
      root.dataset.view = progress < 0.08 ? "card" : "reveal";
      root.style.setProperty("--progress", String(progress));
      const phase = progress < 0.27 ? "01" : progress < 0.62 ? "02" : "03";
      const number = root.querySelector(".phase-number");
      const label = root.querySelector(".phase-label");
      if (number) number.textContent = phase;
      if (label)
        label.textContent = phase === "01" ? "KART" : phase === "02" ? "KİMLİK" : "TANIŞLIQ";
    };
    syncScene(reduced ? 1 : 0);
    if (reduced) return () => syncScene(0);
    const object = shell.current!;
    const media = gsap.matchMedia();
    media.add(
      { mobile: "(max-width: 760px)", desktop: "(min-width: 761px)" },
      (context) => {
        const mobile = !!context.conditions?.mobile;
        const startW = () =>
          mobile
            ? Math.min(innerWidth - 64, 360)
            : Math.min(innerWidth * 0.33, 454);
        const finalW = () =>
          mobile
            ? Math.min(innerWidth * 0.66, 290)
            : Math.min(innerWidth * 0.29, 388);
        const finalH = () =>
          mobile
            ? Math.min(innerHeight * 0.34, 300)
            : Math.min(innerHeight * 0.61, 540, finalW() * 1.4);
        const state = { progress: 0 };
        syncScene(0);
        gsap.set(object, {
          x: 0,
          y: 0,
          xPercent: -50,
          yPercent: -50,
          rotationX: 13,
          rotationY: -17,
          rotationZ: -12,
          transformPerspective: 1400,
        });
        gsap.set(".identity-reveal", { autoAlpha: 0, y: 28 });
        gsap.set(".reveal-detail", { autoAlpha: 0, y: 16 });
        gsap.set(".photo-treatment", { opacity: 0.25 });
        gsap.set(".hero-word", { autoAlpha: 1, y: 0 });
        gsap.set(".hero-bottom", { autoAlpha: 1, y: 0 });
        gsap.set(".card-face-front", { opacity: 1 });
        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.38,
            invalidateOnRefresh: true,
            onUpdate: (self) => syncScene(self.progress),
            onRefresh: (self) => syncScene(self.progress),
          },
        });
        timeline
          .to(state, { progress: 1, duration: 1 }, 0)
          .to(".hero-word", { y: -65, autoAlpha: 0, duration: 0.27 }, 0)
          .to(".hero-bottom", { autoAlpha: 0, y: -15, duration: 0.18 }, 0.03)
          .to(
            object,
            {
              rotationY: -180,
              rotationX: 0,
              rotationZ: 0,
              duration: 0.5,
              ease: "power1.inOut",
            },
            0.06,
          )
          .fromTo(
            object,
            {
              width: startW,
              height: () => startW() * 0.63,
              left: "50%",
              top: mobile ? "49%" : "57%",
              borderRadius: 14,
            },
            {
              width: finalW,
              height: finalH,
              borderRadius: mobile ? 4 : 5,
              top: mobile ? "33%" : "49%",
              left: mobile ? "50%" : "30%",
              duration: 0.48,
              ease: "power2.inOut",
            },
            0.35,
          )
          .to(".photo-treatment", { opacity: 1, duration: 0.38 }, 0.34)
          .to(".card-shine", { opacity: 0, duration: 0.3 }, 0.42)
          .to(".identity-reveal", { autoAlpha: 1, y: 0, duration: 0.25 }, 0.62)
          .to(
            ".reveal-detail",
            { autoAlpha: 1, y: 0, stagger: 0.035, duration: 0.16 },
            0.73,
          );
        // Reflective light follows the same uninterrupted card surface.
        timeline.to(root, { "--shine": "160%", duration: 0.65 }, 0.04);
        timeline.scrollTrigger?.refresh();
        return () => {
          timeline.scrollTrigger?.kill();
          timeline.kill();
          syncScene(0);
        };
      },
      root,
    );
    const onMove = (event: PointerEvent) => {
      if (!tilt.current || matchMedia("(pointer: coarse)").matches) return;
      const p = Number(root.dataset.progress || 0);
      if (p > 0.08) {
        gsap.to(tilt.current, { rotationX: 0, rotationY: 0, duration: 0.4 });
        return;
      }
      const amplitude = profile.appearance.motion === "subtle" ? 2 : 4;
      gsap.to(tilt.current, {
        rotationY: (event.clientX / innerWidth - 0.5) * amplitude,
        rotationX: -(event.clientY / innerHeight - 0.5) * amplitude,
        duration: 0.7,
        overwrite: true,
      });
    };
    root.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      root.removeEventListener("pointermove", onMove);
      gsap.killTweensOf(tilt.current);
      gsap.set(tilt.current, { clearProps: "transform" });
      media.revert();
      syncScene(0);
      root.style.removeProperty("--shine");
    };
  }, [reduced, profile.appearance.motion]);

  useLayoutEffect(() => {
    const root = section.current!;
    const names = [
      root.querySelector<HTMLElement>(".hero-name-text"),
      cardName.current,
      root.querySelector<HTMLElement>(".identity-reveal h2 span"),
    ];
    let active = true;
    const fitNames = () => {
      if (!active) return;
      for (const name of names) {
        if (!name) continue;
        name.style.fontSize = "";
        const available = name.clientWidth;
        if (available > 0 && name.scrollWidth > available) {
          const size = parseFloat(getComputedStyle(name).fontSize);
          name.style.fontSize = `${size * ((available - 1) / name.scrollWidth)}px`;
        }
      }
    };
    const observer = new ResizeObserver(fitNames);
    observer.observe(root);
    observer.observe(shell.current!);
    window.addEventListener("resize", fitNames);
    void document.fonts.ready.then(fitNames);
    fitNames();
    return () => {
      active = false;
      observer.disconnect();
      window.removeEventListener("resize", fitNames);
    };
  }, [profile.name, reduced]);

  function explore() {
    if (reduced) {
      document.querySelector("#about")?.scrollIntoView({ behavior: "auto" });
      return;
    }
    const node = section.current!;
    const target =
      node.getBoundingClientRect().top +
      scrollY +
      (node.offsetHeight - innerHeight) * 0.95;
    window.scrollTo({ top: target, behavior: "smooth" });
  }

  return (
    <section
      ref={section}
      className={`identity-story ${reduced ? "story-static" : ""}`}
      id="identity"
      aria-label="Kartdan rəqəmsal kimliyə"
      data-progress="0"
      data-view="card"
    >
      <div className="identity-stage">
        <div className="stage-grid" aria-hidden="true" />
        <div className="horizon-light" aria-hidden="true" />
        <div className="nfc-pulse" aria-hidden="true" />
        <h1 className="sr-only">{profile.name} — Rəqəmsal kimlik</h1>
        <div className="hero-word" aria-hidden="true">
          <span className="eyebrow hero-overline">
            NFC BAKU <span>—</span> ŞƏXSİ RƏQƏMSAL KİMLİK
          </span>
          <div className="hero-name">
            <span className="hero-name-text">{profile.name}</span>
            <span className="hero-asterisk">✳</span>
          </div>
        </div>

        <div
          ref={shell}
          className="identity-object"
          data-testid="identity-object"
          aria-hidden="true"
        >
          <div ref={tilt} className="card-tilt">
            <div className="card-arrival">
              <div className="card-face card-face-front">
                <div className="card-grain" />
                <div className="card-shine" />
                <div className="card-meta">
                  <span>IDENTITY / 001</span>
                  <Radio size={21} strokeWidth={1.3} />
                </div>
                <div className="embossed-monogram">{profile.monogram}</div>
                <div className="card-name">
                  <span ref={cardName}>{profile.name}</span>
                  <MoveUpRight size={22} strokeWidth={1} />
                </div>
                <span className="card-bottom">BEYOND THE CARD</span>
              </div>
              <div className="card-face card-face-back">
                <img
                  className="photo-treatment"
                  src={profile.portrait.src}
                  style={{ objectPosition: profile.portrait.position }}
                  alt=""
                  fetchPriority="high"
                  decoding="async"
                />
                <div className="photo-shade" />
                <span className="portrait-index">
                  01 — {profile.name.toLocaleUpperCase("az")}
                </span>
                <span className="portrait-rule" />
              </div>
            </div>
          </div>
        </div>

        <div className="hero-bottom">
          <div className="hero-intro">
            <span className="small-rule" />
            <p>
              Bir addan daha artıq.
              <br />
              <em>Bir kimlik.</em>
            </p>
          </div>
          <button className="explore" onClick={explore}>
            <span>
              KİMLİYİ KƏŞF ET
              <span className="explore-small">
                Kartdan hekayəyə. Aşağı sürüşdür.
              </span>
            </span>
            <span className="arrow-circle">
              <ArrowDown size={20} />
            </span>
          </button>
        </div>

        <div className="identity-reveal">
          <span className="eyebrow reveal-detail">KARTIN DİGƏR TƏRƏFİ</span>
          <h2>
            Salam,
            <br /> mən <span>{profile.name}.</span>
          </h2>
          <div className="identity-meta reveal-detail">
            <span className="location-dot" />
            {profile.location}
            {profile.profession && <span> / {profile.profession}</span>}
          </div>
          <p className="reveal-detail">
            Bir toxunuş bizi tanış etdi.
            <br />
            Qalanı gözəl bir söhbət ola bilər.
          </p>
          <a className="text-link reveal-detail" href="#about">
            Hekayəni kəşf et <ArrowUpRight size={18} />
          </a>
        </div>
        <div className="stage-bottom" aria-hidden="true">
          <span>FİZİKİ KART → RƏQƏMSAL KİMLİK</span>
          <span className="stage-progress">
            <span className="phase-number">01</span>
            <span className="phase-track">
              <i />
            </span>
            <span className="phase-label">KART</span>
          </span>
        </div>
      </div>
    </section>
  );
}
