import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { animate, useMotionValue, type AnimationPlaybackControls } from 'framer-motion';
import { STAGES, stream } from '../content/profile';
import { useReducedMotion } from '../hooks/useTheme';
import './pipeline.css';

const N = stream.length;
const LAST_CYCLE = N + STAGES.length - 1; // every instruction has retired by here
const SECONDS_PER_CYCLE = 1.15; // autoplay speed
const REPLAY_PAUSE = 1.6; // beat on a full register file before looping
const IDLE_RESUME_MS = 2000; // hand control back if the pipeline is left alone

/** Apple's momentum projection (Designing Fluid Interfaces), not the v²/2a form. */
function project(velocity: number, decelerationRate = 0.995) {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/** Progressive resistance past the ends of the stream instead of a hard stop. */
function rubberband(overshoot: number, dimension: number, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

export default function Pipeline() {
  const reduced = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cycle = useMotionValue(0);

  const [colWidth, setColWidth] = useState(140);
  const [retired, setRetired] = useState(0);
  const [head, setHead] = useState(0); // newest instruction currently in the pipe
  const [engaged, setEngaged] = useState(false); // user has taken over from autoplay
  const [lastTouch, setLastTouch] = useState(0); // bumped on every interaction
  const [dragging, setDragging] = useState(false);

  const runningAnim = useRef<AnimationPlaybackControls | null>(null);
  const lastRetired = useRef(0);
  const lastHead = useRef(0);
  const colWidthRef = useRef(colWidth);
  colWidthRef.current = colWidth;

  const stop = useCallback(() => {
    runningAnim.current?.stop();
    runningAnim.current = null;
  }, []);

  /* ---- measurement ---- */
  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const measure = () => setColWidth(el.clientWidth / STAGES.length);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ---- paint chips straight from the motion value, every frame ----
     Positions are written to the DOM imperatively so a scrub stays 1:1 with
     the pointer and never waits on a React render. */
  const paint = useCallback(
    (c: number) => {
      const w = colWidthRef.current;
      chipRefs.current.forEach((node, i) => {
        if (!node) return;
        const p = c - i; // which stage instruction i is sitting in
        const visible = p > -0.9 && p < STAGES.length + 0.4;
        node.style.visibility = visible ? 'visible' : 'hidden';
        if (!visible) return;
        const clamped = Math.max(-0.9, Math.min(STAGES.length + 0.4, p));
        // Fade in as it enters Fetch and out as it leaves Writeback.
        const edge = Math.min(clamped + 0.9, STAGES.length + 0.4 - clamped, 1);
        node.style.transform = `translate3d(${clamped * w}px, 0, 0)`;
        node.style.opacity = String(Math.max(0, edge));
        node.style.zIndex = String(100 - i);
      });
      /* These only change once per cycle. Calling setState every frame would
         re-render the whole register file at 60fps and fight the animation. */
      const nextRetired = Math.max(0, Math.min(N, Math.floor(c - STAGES.length + 1)));
      const nextHead = Math.max(0, Math.min(N - 1, Math.floor(c)));
      if (nextRetired !== lastRetired.current) {
        lastRetired.current = nextRetired;
        setRetired(nextRetired);
      }
      if (nextHead !== lastHead.current) {
        lastHead.current = nextHead;
        setHead(nextHead);
      }
    },
    [],
  );

  useEffect(() => {
    paint(cycle.get());
    return cycle.on('change', paint);
  }, [cycle, paint]);

  useEffect(() => paint(cycle.get()), [colWidth, paint, cycle]);

  /* ---- autoplay until the user takes over ----
     One continuous linear sweep rather than a spring per cycle: stepping to the
     next cycle and settling reads as stop-start, while a constant glide is what
     a pipeline actually looks like. */
  useEffect(() => {
    if (reduced || engaged) return;
    stop();

    let cancelled = false;
    let timer: number | undefined;

    /* Each sweep starts wherever the clock currently sits, so handing control
       back after a scrub picks up from there instead of snapping to zero. */
    const sweep = () => {
      if (cancelled) return;
      const remaining = LAST_CYCLE - cycle.get();

      if (remaining <= 0.01) {
        timer = window.setTimeout(() => {
          if (cancelled) return;
          cycle.set(0);
          sweep();
        }, REPLAY_PAUSE * 1000);
        return;
      }

      runningAnim.current = animate(cycle, LAST_CYCLE, {
        duration: remaining * SECONDS_PER_CYCLE,
        ease: 'linear',
        onComplete: sweep, // never fires on stop(), so cleanup stays clean
      });
    };

    sweep();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      runningAnim.current?.stop();
    };
  }, [reduced, engaged, cycle, stop]);

  /* ---- handing control back ----
     Interacting takes the clock over; clicking away, tabbing away, or simply
     leaving it alone gives it back. */
  useEffect(() => {
    if (!engaged) return;
    const el = trackRef.current;
    const isOutside = (target: EventTarget | null) => !!el && !el.contains(target as Node);

    const onPointerDownAway = (e: PointerEvent) => {
      if (isOutside(e.target)) setEngaged(false);
    };
    const onFocusAway = (e: FocusEvent) => {
      if (isOutside(e.target)) setEngaged(false);
    };

    document.addEventListener('pointerdown', onPointerDownAway);
    document.addEventListener('focusin', onFocusAway);
    return () => {
      document.removeEventListener('pointerdown', onPointerDownAway);
      document.removeEventListener('focusin', onFocusAway);
    };
  }, [engaged]);

  useEffect(() => {
    if (!engaged || dragging) return;
    const id = setTimeout(() => setEngaged(false), IDLE_RESUME_MS);
    return () => clearTimeout(id);
  }, [engaged, dragging, lastTouch]);

  /* Reduced motion: show the end state rather than moving anything. */
  useEffect(() => {
    if (reduced) {
      stop();
      cycle.set(LAST_CYCLE);
    }
  }, [reduced, cycle, stop]);

  /* ---- 1:1 drag with velocity handoff ---- */
  const drag = useRef({ startX: 0, startCycle: 0, history: [] as { t: number; x: number }[] });

  const onPointerDown = (e: React.PointerEvent) => {
    if (reduced) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    stop();
    setEngaged(true);
    setLastTouch(performance.now());
    setDragging(true);
    drag.current = {
      startX: e.clientX,
      startCycle: cycle.get(), // start from the presentation value, so no jump on interrupt
      history: [{ t: performance.now(), x: e.clientX }],
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const { startX, startCycle, history } = drag.current;
    // Dragging right advances the stream, pushing instructions the way they travel.
    const raw = startCycle + (e.clientX - startX) / colWidthRef.current;

    let next = raw;
    if (raw < 0) next = -rubberband(-raw, LAST_CYCLE);
    else if (raw > LAST_CYCLE) next = LAST_CYCLE + rubberband(raw - LAST_CYCLE, LAST_CYCLE);
    cycle.set(next);

    history.push({ t: performance.now(), x: e.clientX });
    if (history.length > 6) history.shift();
  };

  const endDrag = (e: React.PointerEvent) => {
    if (!dragging) return;
    setDragging(false);
    setLastTouch(performance.now());
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);

    const { history } = drag.current;
    const first = history[0];
    const last = history[history.length - 1];
    const dt = last && first ? last.t - first.t : 0;
    // px/s at release, converted into cycles/s to match the drag mapping.
    const pxPerSec = dt > 8 ? ((last.x - first.x) / dt) * 1000 : 0;
    const velocity = pxPerSec / colWidthRef.current;

    const landing = cycle.get() + project(velocity);
    const target = Math.max(0, Math.min(LAST_CYCLE, Math.round(landing)));

    runningAnim.current = animate(cycle, target, {
      type: 'spring',
      // A flick carried momentum, so a little overshoot is honest here.
      bounce: Math.abs(velocity) > 0.4 ? 0.18 : 0,
      duration: 0.4,
      velocity,
    });
  };

  const step = (delta: number) => {
    stop();
    setEngaged(true);
    setLastTouch(performance.now());
    const target = Math.max(0, Math.min(LAST_CYCLE, Math.round(cycle.get()) + delta));
    runningAnim.current = animate(cycle, target, { type: 'spring', bounce: 0, duration: 0.4 });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      step(1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      step(-1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      step(-LAST_CYCLE);
    } else if (e.key === 'End') {
      e.preventDefault();
      step(LAST_CYCLE);
    }
  };

  return (
    <div className="pipe">
      <div className="pipe__head">
        <span className="eyebrow">Instruction Pipeline</span>
        <span className="pipe__hint">
          {reduced ? 'Reduced motion — showing final state' : 'Drag the track, or use ← →'}
        </span>
      </div>

      <div
        ref={trackRef}
        className={`pipe__track${dragging ? ' is-dragging' : ''}`}
        role="slider"
        tabIndex={0}
        aria-label="Instruction pipeline clock. Scrub to advance the cycle."
        aria-valuemin={0}
        aria-valuemax={LAST_CYCLE}
        aria-valuenow={retired}
        aria-valuetext={`${retired} of ${N} instructions retired`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
      >
        <div className="pipe__stages" aria-hidden="true">
          {STAGES.map((s) => (
            <div className="pipe__stage" key={s.id}>
              <span className="pipe__stage-id mono">{s.id}</span>
              <span className="pipe__stage-label">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="pipe__lane">
          {stream.map((ins, i) => (
            <div
              key={ins.reg}
              className="pipe__chip"
              ref={(node) => {
                chipRefs.current[i] = node;
              }}
              style={{ width: `calc(${100 / STAGES.length}% - 10px)` }}
            >
              <span className="pipe__op mono">{ins.op}</span>
              <span className="pipe__operands mono">{ins.operands}</span>
            </div>
          ))}
        </div>
      </div>

      <ol className="pipe__regs">
        {stream.map((ins, i) => {
          const written = i < retired;
          const inFlight = !written && i <= head;
          return (
            <li
              key={ins.reg}
              className={`pipe__reg${written ? ' is-written' : ''}${inFlight ? ' is-inflight' : ''}`}
            >
              <span className="pipe__reg-name mono">{ins.reg}</span>
              <span className="pipe__reg-value">{written ? ins.writes : '—'}</span>
              <span className="pipe__reg-note">{written ? ins.note : ''}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
