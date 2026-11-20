import { useEffect, useRef } from "react";
import * as THREE from "three";
import { antipode, duration, type Coordinates } from "./trajectory";
import { coordinatesOf, direction } from "./geography";

const vertex = `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewDirection;
void main() {
  vUv = uv;
  vNormal = normalize(mat3(modelMatrix) * normal);
  vec4 world = modelMatrix * vec4(position, 1.0);
  vViewDirection = cameraPosition - world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`;
const daylight = `
uniform sampler2D surface;
uniform vec3 sun;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewDirection;
void main() {
  vec3 n = normalize(vNormal);
  vec3 view = normalize(vViewDirection);
  float light = smoothstep(-.31, .7, dot(n, sun));
  float rim = pow(1.0 - max(dot(n, view), 0.0), 3.2);
  vec3 photo = texture2D(surface, vUv).rgb;
  vec3 night = photo * vec3(.15, .23, .37);
  vec3 day = photo * vec3(1.01, 1.05, 1.13);
  vec3 color = mix(night, day, light) + vec3(.085, .21, .37) * rim * (.48 + light * .52);
  gl_FragColor = vec4(color, 1.0);
  #include <colorspace_fragment>
}`;
const halo = `
varying vec3 vNormal;
varying vec3 vViewDirection;
void main(){
  float haze = pow(1.0 - abs(dot(normalize(vNormal),normalize(vViewDirection))),3.8);
  gl_FragColor = vec4(.18,.44,.77,haze*.48);
}`;

const smooth = (t: number) => THREE.MathUtils.smootherstep(t, 0, 1);

export function Globe({
  origin,
  coastline,
  onSelect,
  started,
  finished,
  onUnavailable,
}: {
  origin: Coordinates;
  coastline?: Coordinates;
  onSelect: (point: Coordinates) => void;
  started: number | null;
  finished: boolean;
  onUnavailable: () => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const zoomControl = useRef<(factor: number) => void>(() => {});
  const position = useRef({ origin, coastline, onSelect, started, finished });
  position.current = { origin, coastline, onSelect, started, finished };

  useEffect(() => {
    const element = canvas.current!;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: element,
        alpha: true,
        antialias: true,
      });
    } catch {
      onUnavailable();
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.025, 30);
    const sun = new THREE.Vector3();
    let dirty = true;
    let lastElapsed = -1;
    const texture = new THREE.TextureLoader().load(
      import.meta.env.BASE_URL + "earth/earth.jpg",
      () => {
        dirty = true;
      },
      undefined,
      onUnavailable,
    );
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const sphere = new THREE.SphereGeometry(1, 96, 64);
    const surface = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: daylight,
      uniforms: { surface: { value: texture }, sun: { value: sun } },
    });
    const earth = new THREE.Mesh(sphere, surface);
    scene.add(earth);
    const air = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: halo,
      side: THREE.BackSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const atmosphere = new THREE.Mesh(sphere, air);
    atmosphere.scale.setScalar(1.026);
    scene.add(atmosphere);
    const pinGeometry = new THREE.RingGeometry(0.017, 0.024, 40);
    const pinMaterial = new THREE.MeshBasicMaterial({
      color: "#ffe2a5",
      side: THREE.DoubleSide,
    });
    const pins = [
      new THREE.Mesh(pinGeometry, pinMaterial),
      new THREE.Mesh(pinGeometry, pinMaterial),
    ];
    const coastMaterial = new THREE.MeshBasicMaterial({
      color: "#9be8dc",
      side: THREE.DoubleSide,
    });
    const coastPin = new THREE.Mesh(pinGeometry, coastMaterial);
    coastPin.scale.setScalar(0.76);
    scene.add(...pins, coastPin);
    const front = new THREE.Vector3(0, 0, 1);
    function putPin(pin: THREE.Mesh, normal: THREE.Vector3) {
      pin.position.copy(normal).multiplyScalar(1.005);
      pin.quaternion.setFromUnitVectors(front, normal);
    }

    let previousOrigin: Coordinates | undefined;
    let previousCoastline: Coordinates | undefined;
    let departureDirection = direction(position.current.origin);
    let arrivalDirection = direction(antipode(position.current.origin));
    let longitudeOffset = 0,
      latitudeOffset = 0;
    let zoom = 1;
    const pointers = new Map<
      number,
      { x: number; y: number; moved: boolean }
    >();
    const ray = new THREE.Raycaster();
    const screen = new THREE.Vector2();
    const canExplore = () =>
      position.current.started === null || position.current.finished;
    function zoomBy(factor: number) {
      if (!canExplore()) return;
      zoom = factor === 0 ? 1 : THREE.MathUtils.clamp(zoom * factor, 0.57, 12);
      dirty = true;
    }
    zoomControl.current = zoomBy;
    const wheel = (event: WheelEvent) => {
      if (!canExplore()) return;
      event.preventDefault();
      const units =
        event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? element.clientHeight
            : 1;
      zoomBy(Math.exp(-event.deltaY * units * 0.0014));
    };
    const down = (event: PointerEvent) => {
      if (!canExplore() || event.button !== 0 || pointers.size >= 2) return;
      const moved = pointers.size !== 0;
      if (moved) for (const point of pointers.values()) point.moved = true;
      pointers.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
        moved,
      });
      element.setPointerCapture(event.pointerId);
    };
    const move = (event: PointerEvent) => {
      const point = pointers.get(event.pointerId);
      if (!point || !canExplore()) return;
      const x = event.clientX - point.x,
        y = event.clientY - point.y;
      const second = [...pointers.entries()].find(
        ([id]) => id !== event.pointerId,
      )?.[1];
      if (second) {
        const before = Math.hypot(point.x - second.x, point.y - second.y);
        const after = Math.hypot(
          event.clientX - second.x,
          event.clientY - second.y,
        );
        if (before > 0 && after > 0) zoomBy(after / before);
      } else {
        if (!point.moved && Math.hypot(x, y) < 6) return;
        longitudeOffset -= (x * 0.007) / Math.max(1, zoom);
        latitudeOffset += (y * 0.006) / Math.max(1, zoom);
        dirty = true;
      }
      pointers.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
        moved: true,
      });
    };
    const up = (event: PointerEvent) => {
      const point = pointers.get(event.pointerId);
      if (!point) return;
      pointers.delete(event.pointerId);
      if (point.moved || !canExplore()) return;
      const bounds = element.getBoundingClientRect();
      screen.set(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        1 - ((event.clientY - bounds.top) / bounds.height) * 2,
      );
      ray.setFromCamera(screen, camera);
      const hit = ray.intersectObject(earth, false)[0];
      if (hit) position.current.onSelect(coordinatesOf(hit.point.normalize()));
    };
    const cancel = (event: PointerEvent) => {
      pointers.delete(event.pointerId);
    };
    element.addEventListener("wheel", wheel, { passive: false });
    element.addEventListener("pointerdown", down);
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerup", up);
    element.addEventListener("pointercancel", cancel);
    element.addEventListener("lostpointercapture", cancel);
    const heading = new THREE.Vector3();
    const axis = new THREE.Vector3(0, 1, 0);
    const look = new THREE.Vector3();
    const spherical = new THREE.Spherical();
    let previousFinished = false;
    let narrow = false;
    const resize = () => {
      const width = element.clientWidth,
        height = element.clientHeight;
      if (!width || !height) return;
      narrow = width < 720;
      camera.aspect = width / height;
      camera.fov = narrow ? 49 : 40;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      dirty = true;
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();
    const contextLost = (event: Event) => {
      event.preventDefault();
      onUnavailable();
    };
    element.addEventListener("webglcontextlost", contextLost);
    renderer.setAnimationLoop((time) => {
      const {
        origin: selected,
        coastline: coast,
        started: start,
        finished: done,
      } = position.current;
      if (previousOrigin !== selected) {
        previousOrigin = selected;
        departureDirection = direction(selected);
        arrivalDirection = direction(antipode(selected));
        putPin(pins[0], departureDirection);
        putPin(pins[1], arrivalDirection);
        longitudeOffset = latitudeOffset = 0;
        zoom = 1;
        dirty = true;
      }
      if (previousCoastline !== coast) {
        previousCoastline = coast;
        if (coast) putPin(coastPin, direction(coast));
        dirty = true;
      }
      if (previousFinished !== done) {
        previousFinished = done;
        longitudeOffset = latitudeOffset = 0;
        zoom = 1;
      }
      coastPin.visible = Boolean(done && coast);
      const elapsed = done
        ? duration
        : start === null
          ? 0
          : Math.max(0, time - start);
      if (!dirty && elapsed === lastElapsed) return;
      dirty = false;
      lastElapsed = elapsed;
      const otherSide = elapsed >= 2500;
      const pin = otherSide ? arrivalDirection : departureDirection;
      const reveal = smooth((elapsed - 2750) / 2000);
      const dive = smooth(elapsed / 1370);
      const magnification = start === null || done ? zoom : 1;
      heading
        .copy(pin)
        .applyAxisAngle(
          axis,
          (otherSide ? -0.16 * reveal : 0.19 * (1 - dive)) /
            Math.max(1, magnification),
        );
      if (start === null || done) {
        spherical.setFromVector3(heading);
        spherical.theta += longitudeOffset;
        spherical.phi = THREE.MathUtils.clamp(
          spherical.phi + latitudeOffset,
          0.015,
          Math.PI - 0.015,
        );
        heading.setFromSpherical(spherical);
      }
      const distance = otherSide
        ? THREE.MathUtils.lerp(1.27, narrow ? 3.55 : 3.12, reveal)
        : THREE.MathUtils.lerp(narrow ? 3.6 : 3.18, 1.16, dive);
      camera.position
        .copy(heading)
        .multiplyScalar(1 + (distance - 1) / magnification);
      for (const ring of pins)
        ring.scale.setScalar(1 / Math.max(1, magnification));
      camera.lookAt(look.set(0, narrow ? -0.05 : 0, 0));
      const framing = otherSide ? reveal : 1 - dive;
      camera.setViewOffset(
        element.clientWidth,
        element.clientHeight,
        narrow ? 0 : -element.clientWidth * 0.17 * framing,
        narrow ? element.clientHeight * 0.03 : 0,
        element.clientWidth,
        element.clientHeight,
      );
      sun.copy(pin).applyAxisAngle(axis, otherSide ? -0.65 : 0.85);
      sun.y += otherSide ? 0.34 : 0.18;
      sun.normalize();
      renderer.render(scene, camera);
    });
    return () => {
      renderer.setAnimationLoop(null);
      observer.disconnect();
      element.removeEventListener("webglcontextlost", contextLost);
      texture.dispose();
      sphere.dispose();
      surface.dispose();
      air.dispose();
      pinGeometry.dispose();
      pinMaterial.dispose();
      coastMaterial.dispose();
      zoomControl.current = () => {};
      element.removeEventListener("wheel", wheel);
      element.removeEventListener("pointerdown", down);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerup", up);
      element.removeEventListener("pointercancel", cancel);
      element.removeEventListener("lostpointercapture", cancel);
      renderer.dispose();
    };
  }, [onUnavailable]);
  const flying = started !== null && !finished;
  return (
    <>
      <canvas aria-label="地球与穿越落点" role="img" ref={canvas} />
      {!flying && (
        <div className="globe-zoom" role="group" aria-label="地球缩放">
          <button
            type="button"
            aria-label="放大地球"
            title="放大地球"
            onClick={() => zoomControl.current(1.45)}
          >
            +
          </button>
          <button
            type="button"
            aria-label="缩小地球"
            title="缩小地球"
            onClick={() => zoomControl.current(1 / 1.45)}
          >
            −
          </button>
          <button
            type="button"
            aria-label="恢复默认缩放"
            title="恢复默认缩放"
            onClick={() => zoomControl.current(0)}
          >
            ↺
          </button>
        </div>
      )}
    </>
  );
}
