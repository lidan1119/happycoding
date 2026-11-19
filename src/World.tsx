import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
const labels = [
  "宇宙拐角 · 午夜便利店",
  "以后再说站 · 末班车进站",
  "失物招领处 · 明天档案馆",
  "最后一座桥 · 城市停电中",
  "午夜天台 · 天亮之前",
];
export default function World({
  act = 1,
  ending = false,
  onInspect,
}: {
  act?: number;
  ending?: boolean;
  onInspect?: (description: string) => void;
}) {
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
    const bg = ending
      ? "#343756"
      : act === 4
        ? "#101829"
        : act === 3
          ? "#1e1936"
          : "#131d32";
    scene.background = new THREE.Color(bg);
    scene.fog = new THREE.Fog(bg, 24, 65);
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(act === 3 ? 14 : 16, act === 4 ? 11 : 13, 22);
    camera.lookAt(0, -1, 0);
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
      window = mat(act === 4 ? 0x353742 : 0xe4d49d, act === 4 ? 0 : 0x7b622b);
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
    if (act === 1) {
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
    } else if (act === 2 || act === 5) {
      box(14, 0.5, 3, 0, 0.4, 1, edge);
      for (const x of [-5, 5]) {
        box(0.18, 3, 0.18, x, 1.8, -0.4, coral);
      }
      box(13, 0.2, 2, -0.1, 3.4, -0.4, blue);
      sign(
        act === 2 ? "0 路 · 以后再说站" : "末班车 · 未知站",
        6,
        0.8,
        0,
        2.6,
        0.65,
      );
    } else if (act === 3) {
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
    } else {
      box(17, 0.4, 3, 0, 1, 1, edge);
      for (const x of [-7, 7]) {
        box(0.3, 5, 0.3, x, 2.2, 1, blue);
        for (let i = 0; i < 7; i++)
          box(0.12, 0.12, 3, x + i * (x < 0 ? 1 : -1), 3 - i * 0.28, 1, coral);
      }
      box(1.7, 1, 0.8, 5, 1.7, 2, lime);
      sign("明天控制台", 2.4, 0.6, 5, 2.4, 2.44);
    }
    const train = new THREE.Group();
    if (act === 2 || act === 5) {
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
      renderer.render(scene, camera);
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
        .find((h) => h.object.userData.inspect);
      if (hit)
        inspectionCallback.current?.(String(hit.object.userData.inspect));
    };
    renderer.domElement.addEventListener("click", inspect);
    const lost = (e: Event) => {
      e.preventDefault();
      dead = true;
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
  }, [act, ending, paused]);
  return (
    <div className={`world act-${act} ${unavailable ? "world-fallback" : ""}`}>
      <div className="world-canvas" ref={host} aria-hidden="true" />
      <div className="world-overlay">
        <span className="world-dot" />
        {labels[act - 1]}
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
          ▥ ▥ <span>✳</span> ▥ ▥
        </div>
      )}
    </div>
  );
}
