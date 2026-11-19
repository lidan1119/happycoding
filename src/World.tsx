import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { cast, sets, type Npc, type Stage } from "./staging.ts";

export default function World({
  stage,
  ending = false,
  onInspect,
}: {
  stage: Stage;
  ending?: boolean;
  onInspect?: (description: string, npc?: Npc) => void;
}) {
  const { set } = stage;
  const current = useRef(stage);
  current.current = stage;
  const redraw = useRef<() => void>(() => {});
  useEffect(() => {
    redraw.current();
  }, [stage.beat, stage.focus, stage.npcs.join(",")]);
  const host = useRef<HTMLDivElement>(null);
  const inspectionCallback = useRef(onInspect);
  inspectionCallback.current = onInspect;
  const [unavailable, setUnavailable] = useState(false);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: "low-power",
      });
    } catch {
      setUnavailable(true);
      return;
    }
    setUnavailable(false);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const bg = ending ? "#554653" : sets[set].color;
    scene.background = new THREE.Color(bg);
    scene.fog = new THREE.Fog(bg, 24, 65);
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);

    const ambient = new THREE.HemisphereLight(0xa5c7ff, 0x31263e, 2);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(ending ? 0xffd2a8 : 0xaabaff, 3);
    sun.position.set(8, 12, 5);
    scene.add(sun);
    const city = new THREE.Group();
    scene.add(city);
    const materials: THREE.Material[] = [];
    const textures: THREE.Texture[] = [];
    const mat = (color: number, emissive = 0) => {
      const m = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.78,
        emissive,
        emissiveIntensity: emissive ? 1.4 : 0,
      });
      materials.push(m);
      return m;
    };
    const blue = mat(0x29394d),
      dark = mat(0x182335),
      edge = mat(0x435169),
      lime = mat(0xd4f784, 0x667b29),
      glass = mat(0x355c6d, 0x1c3b4a),
      coral = mat(0xf0ac92, 0x86432d),
      cream = mat(0xd7d3be),
      window = mat(
        set === "bridge" ? 0x353742 : 0xe4d49d,
        set === "bridge" ? 0 : 0x7b622b,
      );
    const box = (
      w: number,
      h: number,
      d: number,
      x: number,
      y: number,
      z: number,
      m: THREE.Material,
      parent: THREE.Group = city,
    ) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
      mesh.position.set(x, y, z);
      parent.add(mesh);
      return mesh;
    };
    box(24, 0.3, 15, 0, -0.2, 0, dark);
    box(24, 0.08, 2.5, 0, 0, 4.5, edge);
    for (let i = -11; i < 12; i += 2.2)
      box(0.8, 0.025, 0.1, i, 0.06, 4.5, cream);
    for (const [x, z, h] of [
      [-8, -4, 6],
      [-4, -6, 9],
      [1, -6, 7],
      [6, -5, 11],
      [10, -2, 6],
      [-10, 1, 4],
    ] as number[][]) {
      box(3, h, 3, x, h / 2, z, blue);
      box(3.15, 0.2, 3.15, x, h, z, edge);
      for (let y = 1; y < h; y += 1.4)
        for (let col = -0.85; col <= 0.85; col += 0.85)
          box(0.4, 0.6, 0.03, x + col, y, z + 1.52, window);
    }
    const sign = (
      text: string,
      w: number,
      h: number,
      x: number,
      y: number,
      z: number,
      color = "#d4f784",
      parent: THREE.Group = city,
    ) => {
      const canvas = document.createElement("canvas");
      canvas.width = 768;
      canvas.height = 160;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#17262d";
      ctx.fillRect(0, 0, 768, 160);
      ctx.fillStyle = color;
      ctx.font = "bold 65px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, 384, 85);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      textures.push(texture);
      const material = new THREE.MeshBasicMaterial({ map: texture });
      materials.push(material);
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
      plane.position.set(x, y, z);
      plane.userData.inspect = `路牌上写着「${text}」。你伸手碰了一下，字还暖着。`;
      parent.add(plane);
    };
    if (set === "street") {
      box(6, 2.6, 4, 0, 1.3, 0, blue).userData.inspect =
        "店门上的营业时间写着：直到你愿意出发。店主留下的灯还亮着。";
      box(6.4, 0.35, 4.4, 0, 2.8, 0, lime);
      box(5.3, 1.9, 0.08, 0, 1.2, 2.03, glass);
      box(0.12, 1.9, 0.12, -0.1, 1.2, 2.1, edge);
      box(0.14, 2, 0.12, -2.1, 1.2, 2.1, edge);
      sign("✳ 平行人生小卖部", 5.4, 0.85, 0, 2.5, 2.27);
      box(1.1, 1.5, 0.9, 4, 0.75, 1, coral);
      sign("明天有售", 0.95, 0.4, 4, 1.1, 1.46, "#fff2d4");
      box(1, 0.8, 1, -4, 0.4, 2, cream);
    } else if (set === "station" || set === "bus") {
      box(14, 0.5, 3, 0, 0.4, 1, edge);
      for (const x of [-5, 5]) {
        box(0.18, 3, 0.18, x, 1.8, -0.4, coral);
      }
      box(13, 0.2, 2, -0.1, 3.4, -0.4, blue);
      sign(
        set === "station" ? "0 路 · 以后再说站" : "末班车 · 未知站",
        6,
        0.8,
        0,
        2.6,
        0.65,
      );
    } else if (set === "archive") {
      box(8, 4, 4, 0, 2, -1, blue).userData.inspect =
        "窗里存着尚未发生的清晨。窗外的人，却被默认放弃了它们。";
      box(8.4, 0.3, 4.4, 0, 4.1, -1, coral);
      for (const x of [-3, -1, 1, 3]) box(0.25, 3.6, 0.3, x, 1.9, 1.1, cream);
      sign("明天失物招领处", 6.8, 0.8, 0, 3.5, 1.32, "#f5cfb2");
      for (let i = 0; i < 4; i++)
        box(
          8 - i * 0.4,
          0.15,
          1 + i * 0.4,
          0,
          0.1 + i * 0.15,
          2.5 - i * 0.2,
          edge,
        );
    } else if (set === "bridge" || set === "console") {
      box(17, 0.4, 3, 0, 1, 1, edge);
      for (const x of [-7, 7]) {
        box(0.3, 5, 0.3, x, 2.2, 1, blue);
        for (let i = 0; i < 7; i++)
          box(0.12, 0.12, 3, x + i * (x < 0 ? 1 : -1), 3 - i * 0.28, 1, coral);
      }
      box(1.7, 1, 0.8, 5, 1.7, 2, lime);
      sign("明天控制台", 2.4, 0.6, 5, 2.4, 2.44);
    }
    if (["shop", "office", "board", "queue", "bakery", "home"].includes(set)) {
      const warm = set === "shop" || set === "bakery" || set === "home";
      box(16, 0.2, 12, 0, 0, 0, edge);
      box(16, 6, 0.3, 0, 3, -4, warm ? coral : blue);
      box(0.3, 6, 8, -8, 3, 0, blue);
      sign(
        sets[set].label,
        7,
        0.9,
        0,
        4.5,
        -3.81,
        warm ? "#fff0ba" : "#d4f784",
      );
      if (set === "board") {
        box(8, 0.24, 2.6, 0, 1.25, 0, cream);
        for (const x of [-3, -1, 1, 3]) box(0.8, 1, 0.8, x, 0.5, -2, coral);
      } else {
        box(6, 1.2, 1.2, 0, 0.6, -1, blue);
        box(6.2, 0.16, 1.45, 0, 1.25, -1, cream);
        if (set === "shop") {
          box(1.1, 0.55, 0.65, 0, 1.61, -0.7, dark);
          sign("明天暂停营业", 2.2, 0.52, 0, 2, -0.31);
          box(0.39, 0.025, 0.55, 0.47, 1.36, -0.08, cream);
        }
        if (set === "bakery") {
          box(0.95, 0.35, 0.95, 0, 1.55, -0.65, coral);
          for (const x of [-0.25, 0, 0.25])
            box(0.06, 0.34, 0.06, x, 1.87, -0.7, lime);
        }
        if (set === "home") {
          box(1.7, 3, 0.15, -4, 1.5, -3.75, cream);
          box(0.8, 0.12, 1, 3, 1.42, -1, coral);
        }
        for (const x of [-5, 5]) {
          box(2.5, 3, 0.5, x, 1.5, -3, edge);
          for (let row = 0; row < 3; row++)
            for (let col = 0; col < 4; col++)
              box(
                0.32,
                0.46,
                0.46,
                x - 0.85 + col * 0.53,
                0.55 + row * 0.88,
                -2.55,
                (row + col) % 2 ? coral : glass,
              );
        }
      }
    }
    if (set === "roof" || set === "dream") {
      box(14, 0.3, 9, 0, 0, 0, edge);
      for (const x of [-4, 0, 4]) {
        box(0.26, 3, 0.26, x, 1.5, -1, cream);
        sign(
          set === "roof" ? (x ? "未来可期" : "欠费停播") : "未完待续",
          3,
          0.85,
          x,
          3,
          -0.81,
        );
        if (set === "dream") box(1.6, 0.15, 1.6, x, 0.3, 1.5, lime);
      }
    }

    const characters = new Map<Npc, THREE.Group>();
    for (const [id, info] of Object.entries(cast) as [
      Npc,
      (typeof cast)[Npc],
    ][]) {
      const actor = new THREE.Group();
      const outfit = mat(info.color);
      const cat = id === "cat" || id === "guard";
      const skin = mat(cat ? (id === "guard" ? 0x9898a1 : 0xe3a461) : 0xd7b99e);
      const add = (
        w: number,
        h: number,
        d: number,
        x: number,
        y: number,
        z: number,
        m: THREE.Material,
      ) => {
        const part = box(w, h, d, x, y, z, m, actor);
        part.userData.npc = id;
        return part;
      };
      add(0.72, 0.88, 0.44, 0, 1, 0, outfit);
      add(0.64, 0.62, 0.59, 0, 1.77, 0.04, skin);
      for (const x of [-0.21, 0.21]) {
        add(0.2, 0.62, 0.26, x, 0.36, 0, dark);
        add(0.13, 0.54, 0.2, x * 2.08, 1, 0.01, outfit);
        add(0.095, 0.07, 0.025, x * 0.78, 1.81, 0.347, dark);
        if (cat)
          add(0.19, 0.25, 0.2, x, 2.15, 0.01, skin).rotation.z =
            x > 0 ? -0.27 : 0.27;
      }
      if (cat) {
        add(0.11, 0.08, 0.07, 0, 1.7, 0.35, coral);
        add(0.1, 0.44, 0.04, 0, 1.11, 0.24, coral);
        if (id === "cat") add(0.39, 0.32, 0.2, 0.56, 0.69, 0.06, cream);
      } else if (id === "driver" || id === "station" || id === "courier") {
        add(0.72, 0.17, 0.68, 0, 2.05, 0.08, outfit);
      } else if (id === "clerk") {
        add(0.69, 0.09, 0.04, 0, 1.81, 0.36, dark);
        add(0.17, 0.23, 0.04, 0.19, 1.17, 0.24, cream);
      } else if (id === "keeper") {
        add(0.45, 0.52, 0.04, 0, 0.91, 0.24, cream);
      } else if (id === "cleaner") {
        add(0.08, 1.7, 0.08, 0.55, 0.87, 0.1, cream);
      }
      actor.scale.setScalar(id === "child" ? 0.69 : 1.3);
      actor.visible = false;
      city.add(actor);
      characters.set(id, actor);
    }
    const train = new THREE.Group();
    if (set === "station" || set === "bus") {
      city.add(train);
      box(8, 1.5, 1.8, 0, 1.5, 3, coral, train).userData.inspect =
        "车票背面印着：不保证终点，保证同行。司机还没有熄火。";
      for (let i = -3; i <= 3; i += 1.2)
        box(0.8, 0.65, 0.06, i, 1.7, 3.94, glass, train);
      for (const x of [-2.8, 2.8]) box(0.8, 0.4, 1.9, x, 0.65, 3, dark, train);
    }
    const lamp = new THREE.PointLight(0xd4f784, 12, 12);
    lamp.position.set(0, 4, 4);
    scene.add(lamp);
    const stars = new THREE.Group();
    scene.add(stars);
    const starGeo = new THREE.SphereGeometry(0.04, 5, 4);
    for (let i = 0; i < 45; i++) {
      const mesh = new THREE.Mesh(starGeo, cream);
      mesh.position.set(
        Math.sin(i * 43.2) * 24,
        8 + (i % 9),
        -9 - Math.cos(i * 73.3) * 8,
      );
      stars.add(mesh);
    }
    const frameScene = () => {
      const { beat, focus, npcs } = current.current;
      for (const [id, actor] of characters) {
        const index = npcs.indexOf(id);
        actor.visible = index !== -1;
        actor.position.set((index - (npcs.length - 1) / 2) * 2.25, 0, 2.5);
        actor.rotation.y = 0.2;
      }
      const interior =
        set === "shop" ||
        set === "office" ||
        set === "board" ||
        set === "bakery" ||
        set === "home" ||
        set === "queue";
      const variation = ((focus % 13) - 6) * 0.75;
      if (set === "shop" && !ending) {
        const shots = [
          [5, 4, 12],
          [-1.4, 2.7, 8],
          [-4, 3, 10],
        ];
        const [x, y, z] = shots[Math.min(beat, 2)];
        camera.position.set(x, y, z);
        camera.lookAt(beat === 2 ? -0.7 : 0, 0.62, 0);
      } else {
        camera.position.set(
          (interior ? 4 : 9) + variation - (beat % 3) * 3,
          (interior ? 4.5 : 7) - (beat % 3) * 0.9,
          (interior ? 15 : 21) - (beat % 3) * 2.1,
        );
        camera.lookAt(0, 0.25, 1);
      }
      camera.fov = el.clientWidth < 650 ? 47 : 36;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };
    redraw.current = frameScene;
    let frame = 0,
      dead = false;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let pointer = 0,
      elapsed = 0,
      last = 0;
    const resize = () => {
      const w = el.clientWidth,
        h = el.clientHeight || 280;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      frameScene();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    resize();
    const move = (e: PointerEvent) => {
      pointer =
        (e.clientX - el.getBoundingClientRect().left) / el.clientWidth - 0.5;
    };
    el.addEventListener("pointermove", move);
    const raycaster = new THREE.Raycaster();
    const inspect = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const point = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(point, camera);
      const hit = raycaster
        .intersectObjects(city.children, true)
        .find(
          (h) =>
            h.object.visible &&
            h.object.parent?.visible &&
            (h.object.userData.inspect || h.object.userData.npc),
        );
      if (!hit) return;
      const id = hit.object.userData.npc as Npc | undefined;
      if (id) inspectionCallback.current?.(cast[id].line, id);
      else inspectionCallback.current?.(String(hit.object.userData.inspect));
    };
    renderer.domElement.addEventListener("click", inspect);
    const lost = (e: Event) => {
      e.preventDefault();
      dead = true;
      redraw.current = () => {};
      cancelAnimationFrame(frame);
      setUnavailable(true);
    };
    renderer.domElement.addEventListener("webglcontextlost", lost);
    const draw = (time: number) => {
      if (dead) return;
      const dt = Math.min((time - last) / 1000, 0.05);
      last = time;
      if (!paused && !motion.matches && !document.hidden) elapsed += dt;
      const offset =
        motion.matches || paused
          ? 0
          : Math.sin(elapsed * 0.12) * 0.045 + pointer * 0.04;
      city.rotation.y = offset;
      if (train.parent) train.position.x = Math.sin(elapsed * 0.18) * 1.4;
      renderer.render(scene, camera);
      if (!paused && !motion.matches) frame = requestAnimationFrame(draw);
    };
    const resume = () => {
      cancelAnimationFrame(frame);
      last = performance.now();
      frame = requestAnimationFrame(draw);
    };
    motion.addEventListener("change", resume);
    frame = requestAnimationFrame(draw);
    return () => {
      dead = true;
      redraw.current = () => {};
      cancelAnimationFrame(frame);
      observer.disconnect();
      motion.removeEventListener("change", resume);
      el.removeEventListener("pointermove", move);
      renderer.domElement.removeEventListener("click", inspect);
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) o.geometry.dispose();
      });
      for (const m of materials) m.dispose();
      for (const t of textures) t.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [set, ending, paused]);
  return (
    <div
      className={`world ${unavailable ? "world-fallback" : ""}`}
      data-location={set}
      data-beat={stage.beat}
      style={unavailable ? { background: sets[set].color } : undefined}
    >
      <div className="world-canvas" ref={host} aria-hidden="true" />
      <div className="world-overlay">
        <span className="world-dot" />
        {sets[set].label}
        <small>
          {unavailable ? "静态场景 · 剧情正常运行" : "微缩夜城 · 夜间营业"}
        </small>
      </div>
      {!unavailable && (
        <button
          className="world-toggle"
          onClick={() => setPaused(!paused)}
          aria-pressed={paused}
        >
          {paused ? "▷ 播放场景" : "Ⅱ 暂停场景"}
        </button>
      )}
      {unavailable && (
        <div className="fallback-city" aria-hidden="true">
          <span>{sets[set].icon}</span>
        </div>
      )}
    </div>
  );
}
