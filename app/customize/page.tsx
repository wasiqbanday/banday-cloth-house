"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls, useTexture } from "@react-three/drei";
import {
  BufferGeometry,
  DoubleSide,
  Float32BufferAttribute,
  RepeatWrapping,
  SRGBColorSpace,
  Texture,
  Vector2,
} from "three";

type FabricId = "silk" | "velvet" | "chiffon" | "brocade";
type PatternId = "solid" | "floral" | "editorial" | "heritage";
type SleeveId = "sleeveless" | "cap" | "long";
type NecklineId = "classic" | "vneck" | "high";
type LengthId = "midi" | "ankle" | "gown";

type Measurements = {
  bust: string;
  waist: string;
  hip: string;
  height: string;
};

const colors = [
  { label: "Ivory Pearl", value: "#f4eadc" },
  { label: "Rose Blush", value: "#d98f91" },
  { label: "Midnight", value: "#171b28" },
  { label: "Sage Noir", value: "#526b5f" },
  { label: "Ruby Wine", value: "#7c1f34" },
  { label: "Antique Gold", value: "#b79b56" },
];

const fabrics: Record<FabricId, { label: string; price: number; finish: string }> =
  {
    silk: { label: "Italian Silk", price: 3200, finish: "Fluid sheen" },
    velvet: { label: "Soft Velvet", price: 4200, finish: "Deep texture" },
    chiffon: { label: "Layered Chiffon", price: 2800, finish: "Airy drape" },
    brocade: { label: "Kashmir Brocade", price: 5200, finish: "Heritage weave" },
  };

const patterns: Record<
  PatternId,
  { label: string; price: number; texture: string; note: string }
> = {
  solid: {
    label: "Solid Atelier",
    price: 0,
    texture:
      "https://lh4.googleusercontent.com/-XY5BUdTsab0/UV6Ycw8yxTI/AAAAAAAALQM/OLcuyAOY3RI/s1000/1.jpg",
    note: "Clean color focus",
  },
  floral: {
    label: "Botanical Print",
    price: 1400,
    texture:
      "https://lh6.googleusercontent.com/-KyU014fnQeI/UV6YerKF2BI/AAAAAAAALQU/_2mJwc7cllg/s1000/2.jpg",
    note: "Soft statement",
  },
  editorial: {
    label: "Editorial Texture",
    price: 1800,
    texture:
      "https://lh5.googleusercontent.com/-iJF4OZ72Ndg/UV6YmQXhfII/AAAAAAAALQc/ImKjCv17_d8/s1000/3.jpg",
    note: "Modern visual depth",
  },
  heritage: {
    label: "Heritage Motif",
    price: 2200,
    texture:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=85",
    note: "Occasion-ready detail",
  },
};

const sleeves: Record<SleeveId, { label: string; price: number }> = {
  sleeveless: { label: "Sleeveless", price: 0 },
  cap: { label: "Cap Sleeve", price: 900 },
  long: { label: "Long Sleeve", price: 1600 },
};

const necklines: Record<NecklineId, { label: string; price: number }> = {
  classic: { label: "Classic Round", price: 0 },
  vneck: { label: "Soft V-Neck", price: 700 },
  high: { label: "High Collar", price: 1100 },
};

const lengths: Record<LengthId, { label: string; price: number; skirt: number }> = {
  midi: { label: "Midi", price: 0, skirt: 1.55 },
  ankle: { label: "Ankle", price: 1300, skirt: 1.95 },
  gown: { label: "Evening Gown", price: 2600, skirt: 2.35 },
};

const basePrice = 6800;
const trimColor = "#c7a35b";
const mannequinSkin = "#cfa98c";

const fabricProfiles: Record<
  FabricId,
  {
    bump: number;
    clearcoat: number;
    metalness: number;
    opacity: number;
    roughness: number;
  }
> = {
  silk: {
    bump: 0.035,
    clearcoat: 0.52,
    metalness: 0.03,
    opacity: 1,
    roughness: 0.26,
  },
  velvet: {
    bump: 0.07,
    clearcoat: 0.08,
    metalness: 0,
    opacity: 1,
    roughness: 0.82,
  },
  chiffon: {
    bump: 0.024,
    clearcoat: 0.18,
    metalness: 0,
    opacity: 0.78,
    roughness: 0.5,
  },
  brocade: {
    bump: 0.095,
    clearcoat: 0.28,
    metalness: 0.16,
    opacity: 1,
    roughness: 0.38,
  },
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

function useAtelierTexture(pattern: PatternId) {
  const sourceTexture = useTexture(patterns[pattern].texture) as Texture;

  return useMemo(() => {
    const nextTexture = sourceTexture.clone();
    nextTexture.colorSpace = SRGBColorSpace;
    nextTexture.wrapS = RepeatWrapping;
    nextTexture.wrapT = RepeatWrapping;
    nextTexture.repeat.set(pattern === "heritage" ? 1.45 : 2.15, 2.65);
    nextTexture.needsUpdate = true;
    return nextTexture;
  }, [pattern, sourceTexture]);
}

function createPleatedSkirtGeometry({
  height,
  waistRadius,
  hemRadius,
}: {
  height: number;
  waistRadius: number;
  hemRadius: number;
}) {
  const segments = 176;
  const rings = 44;
  const pleats = 22;
  const topY = 0.44;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let ring = 0; ring <= rings; ring += 1) {
    const v = ring / rings;
    const eased = v * v * (3 - 2 * v);
    const y = topY - height * v;
    const baseRadius = waistRadius + (hemRadius - waistRadius) * eased;

    for (let segment = 0; segment <= segments; segment += 1) {
      const u = segment / segments;
      const theta = u * Math.PI * 2;
      const fold =
        Math.sin(theta * pleats) * (0.018 + 0.032 * v) +
        Math.sin(theta * pleats * 2) * 0.007 * v;
      const radius = baseRadius + fold;
      const ovalDepth = 0.72 + 0.1 * v;

      positions.push(
        Math.cos(theta) * radius,
        y,
        Math.sin(theta) * radius * ovalDepth
      );
      uvs.push(u * 2.8, v * 2.4);
    }
  }

  for (let ring = 0; ring < rings; ring += 1) {
    for (let segment = 0; segment < segments; segment += 1) {
      const row = ring * (segments + 1);
      const nextRow = (ring + 1) * (segments + 1);
      const a = row + segment;
      const b = row + segment + 1;
      const c = nextRow + segment;
      const d = nextRow + segment + 1;

      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setIndex(indices);
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();

  return geometry;
}

function FabricMaterial({
  color,
  fabric,
  pattern,
  texture,
  opacity,
  side,
}: {
  color: string;
  fabric: FabricId;
  pattern: PatternId;
  texture: Texture;
  opacity?: number;
  side?: typeof DoubleSide;
}) {
  const profile = fabricProfiles[fabric];
  const materialOpacity = opacity ?? profile.opacity;

  return (
    <meshPhysicalMaterial
      color={color}
      map={pattern === "solid" ? undefined : texture}
      bumpMap={texture}
      bumpScale={profile.bump}
      clearcoat={profile.clearcoat}
      clearcoatRoughness={0.36}
      metalness={profile.metalness}
      opacity={materialOpacity}
      roughness={profile.roughness}
      side={side}
      transparent={materialOpacity < 1}
    />
  );
}

function AtelierMannequin({ sleeve }: { sleeve: SleeveId }) {
  return (
    <group>
      <mesh castShadow position={[0, 1.82, 0]}>
        <sphereGeometry args={[0.19, 40, 32]} />
        <meshStandardMaterial color={mannequinSkin} roughness={0.58} />
      </mesh>
      <mesh castShadow position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.075, 0.1, 0.28, 32]} />
        <meshStandardMaterial color={mannequinSkin} roughness={0.58} />
      </mesh>
      <mesh castShadow position={[0, 1.24, 0]} scale={[1, 0.2, 0.38]}>
        <sphereGeometry args={[0.6, 48, 24]} />
        <meshStandardMaterial color={mannequinSkin} roughness={0.62} />
      </mesh>

      <mesh
        castShadow
        position={[-0.67, 0.98, 0]}
        rotation={[0, 0, sleeve === "long" ? 0.17 : 0.28]}
      >
        <cylinderGeometry args={[0.055, 0.045, 0.86, 32]} />
        <meshStandardMaterial color={mannequinSkin} roughness={0.6} />
      </mesh>
      <mesh
        castShadow
        position={[0.67, 0.98, 0]}
        rotation={[0, 0, sleeve === "long" ? -0.17 : -0.28]}
      >
        <cylinderGeometry args={[0.055, 0.045, 0.86, 32]} />
        <meshStandardMaterial color={mannequinSkin} roughness={0.6} />
      </mesh>
      <mesh position={[-0.76, 0.51, 0]} scale={[0.7, 1, 0.7]}>
        <sphereGeometry args={[0.06, 24, 18]} />
        <meshStandardMaterial color={mannequinSkin} roughness={0.62} />
      </mesh>
      <mesh position={[0.76, 0.51, 0]} scale={[0.7, 1, 0.7]}>
        <sphereGeometry args={[0.06, 24, 18]} />
        <meshStandardMaterial color={mannequinSkin} roughness={0.62} />
      </mesh>

      <mesh position={[0, -1.66, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.56, 24]} />
        <meshStandardMaterial color="#191919" roughness={0.46} />
      </mesh>
      <mesh position={[0, -1.96, 0]}>
        <cylinderGeometry args={[0.58, 0.58, 0.05, 64]} />
        <meshStandardMaterial color="#171717" roughness={0.5} />
      </mesh>
    </group>
  );
}

function Bodice({
  color,
  fabric,
  pattern,
  texture,
}: {
  color: string;
  fabric: FabricId;
  pattern: PatternId;
  texture: Texture;
}) {
  const points = useMemo(
    () => [
      new Vector2(0.25, -0.48),
      new Vector2(0.44, -0.42),
      new Vector2(0.53, -0.06),
      new Vector2(0.47, 0.26),
      new Vector2(0.34, 0.5),
      new Vector2(0.17, 0.62),
    ],
    []
  );

  return (
    <mesh castShadow receiveShadow position={[0, 0.92, 0]} scale={[1, 1, 0.72]}>
      <latheGeometry args={[points, 144]} />
      <FabricMaterial
        color={color}
        fabric={fabric}
        pattern={pattern}
        texture={texture}
        side={DoubleSide}
      />
    </mesh>
  );
}

function PleatedSkirt({
  color,
  fabric,
  pattern,
  texture,
  length,
}: {
  color: string;
  fabric: FabricId;
  pattern: PatternId;
  texture: Texture;
  length: LengthId;
}) {
  const skirtHeight = lengths[length].skirt;
  const hemRadius = length === "gown" ? 1.25 : length === "ankle" ? 1.13 : 1.0;
  const geometry = useMemo(
    () =>
      createPleatedSkirtGeometry({
        height: skirtHeight,
        waistRadius: 0.47,
        hemRadius,
      }),
    [hemRadius, skirtHeight]
  );

  return (
    <>
      <mesh castShadow receiveShadow geometry={geometry}>
        <FabricMaterial
          color={color}
          fabric={fabric}
          pattern={pattern}
          texture={texture}
          side={DoubleSide}
        />
      </mesh>

      {fabric === "chiffon" && (
        <mesh castShadow receiveShadow geometry={geometry} scale={[1.025, 1.01, 1.025]}>
          <meshPhysicalMaterial
            color="#ffffff"
            opacity={0.2}
            roughness={0.56}
            side={DoubleSide}
            transparent
          />
        </mesh>
      )}

      <group>
        {Array.from({ length: 18 }).map((_, index) => {
          const theta = (index / 18) * Math.PI * 2;
          const radius = (0.52 + hemRadius) / 2;

          return (
            <mesh
              key={`pleat-${index}`}
              position={[
                Math.cos(theta) * radius,
                0.44 - skirtHeight / 2,
                Math.sin(theta) * radius * 0.79,
              ]}
              rotation={[0, -theta, 0]}
            >
              <boxGeometry args={[0.006, skirtHeight * 0.88, 0.004]} />
              <meshStandardMaterial
                color={fabric === "brocade" ? trimColor : "#050505"}
                opacity={fabric === "brocade" ? 0.55 : 0.16}
                transparent
              />
            </mesh>
          );
        })}
      </group>
    </>
  );
}

function Sleeves({
  color,
  fabric,
  pattern,
  sleeve,
  texture,
}: {
  color: string;
  fabric: FabricId;
  pattern: PatternId;
  sleeve: SleeveId;
  texture: Texture;
}) {
  if (sleeve === "sleeveless") return null;

  const isLong = sleeve === "long";

  return (
    <group>
      {[-1, 1].map((side) => (
        <group key={side} scale={[side, 1, 1]}>
          <mesh
            castShadow
            receiveShadow
            position={[0.54, 1.2, 0]}
            scale={[1.05, 0.62, 0.78]}
          >
            <sphereGeometry args={[0.19, 36, 24]} />
            <FabricMaterial
              color={color}
              fabric={fabric}
              pattern={pattern}
              texture={texture}
            />
          </mesh>

          {isLong && (
            <>
              <mesh
                castShadow
                receiveShadow
                position={[0.69, 0.86, 0]}
                rotation={[0, 0, -0.18]}
              >
                <cylinderGeometry args={[0.13, 0.09, 0.8, 48]} />
                <FabricMaterial
                  color={color}
                  fabric={fabric}
                  pattern={pattern}
                  texture={texture}
                />
              </mesh>
              <mesh position={[0.77, 0.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.095, 0.012, 12, 42]} />
                <meshStandardMaterial
                  color={trimColor}
                  metalness={0.35}
                  roughness={0.28}
                />
              </mesh>
            </>
          )}
        </group>
      ))}
    </group>
  );
}

function DressTrim({
  length,
  neckline,
}: {
  length: LengthId;
  neckline: NecklineId;
}) {
  const skirtHeight = lengths[length].skirt;
  const hemRadius = length === "gown" ? 1.25 : length === "ankle" ? 1.13 : 1.0;

  return (
    <group>
      <mesh position={[0, 0.45, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.72, 1]}>
        <torusGeometry args={[0.49, 0.022, 18, 96]} />
        <meshStandardMaterial color={trimColor} roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh
        position={[0, 0.44 - skirtHeight, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[1, 0.8, 1]}
      >
        <torusGeometry args={[hemRadius, 0.018, 16, 120]} />
        <meshStandardMaterial color={trimColor} roughness={0.34} metalness={0.36} />
      </mesh>

      {neckline === "high" ? (
        <mesh position={[0, 1.49, 0]} scale={[1, 1, 0.72]}>
          <cylinderGeometry args={[0.23, 0.28, 0.18, 64]} />
          <meshStandardMaterial color={trimColor} roughness={0.32} metalness={0.42} />
        </mesh>
      ) : neckline === "vneck" ? (
        <group position={[0, 1.34, 0.33]}>
          {[-1, 1].map((side) => (
            <mesh
              key={side}
              position={[side * 0.11, 0.05, 0]}
              rotation={[0, 0, side * 0.66]}
            >
              <cylinderGeometry args={[0.012, 0.012, 0.43, 18]} />
              <meshStandardMaterial
                color={trimColor}
                metalness={0.42}
                roughness={0.32}
              />
            </mesh>
          ))}
        </group>
      ) : (
        <mesh position={[0, 1.45, 0.08]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.62, 1]}>
          <torusGeometry args={[0.26, 0.013, 12, 68]} />
          <meshStandardMaterial color={trimColor} roughness={0.35} metalness={0.45} />
        </mesh>
      )}

      {Array.from({ length: 4 }).map((_, index) => (
        <mesh key={`button-${index}`} position={[0, 1.22 - index * 0.16, 0.39]}>
          <sphereGeometry args={[0.026, 20, 16]} />
          <meshStandardMaterial color={trimColor} roughness={0.28} metalness={0.55} />
        </mesh>
      ))}
    </group>
  );
}

function StudioSet() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.02, 0]}>
        <circleGeometry args={[2.9, 96]} />
        <meshStandardMaterial color="#111111" roughness={0.62} />
      </mesh>
      <mesh position={[-1.45, 1.35, -0.04]}>
        <boxGeometry args={[0.42, 0.035, 0.035]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.34} />
      </mesh>
      <mesh position={[1.34, -0.98, 0.18]}>
        <boxGeometry args={[0.5, 0.028, 0.028]} />
        <meshStandardMaterial color={trimColor} roughness={0.25} metalness={0.38} />
      </mesh>
    </group>
  );
}

function DressModel({
  color,
  fabric,
  pattern,
  sleeve,
  neckline,
  length,
}: {
  color: string;
  fabric: FabricId;
  pattern: PatternId;
  sleeve: SleeveId;
  neckline: NecklineId;
  length: LengthId;
}) {
  const texture = useAtelierTexture(pattern);

  return (
    <group position={[0, -0.1, 0]} rotation={[0, -0.18, 0]}>
      <AtelierMannequin sleeve={sleeve} />
      <Bodice color={color} fabric={fabric} pattern={pattern} texture={texture} />
      <PleatedSkirt
        color={color}
        fabric={fabric}
        pattern={pattern}
        texture={texture}
        length={length}
      />
      <Sleeves
        color={color}
        fabric={fabric}
        pattern={pattern}
        sleeve={sleeve}
        texture={texture}
      />
      <DressTrim length={length} neckline={neckline} />
      <StudioSet />
    </group>
  );
}

function DressCanvas(props: {
  color: string;
  fabric: FabricId;
  pattern: PatternId;
  sleeve: SleeveId;
  neckline: NecklineId;
  length: LengthId;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0.7, 5.25], fov: 36 }}
      dpr={[1, 1.6]}
      gl={{ preserveDrawingBuffer: true }}
      shadows
    >
      <color attach="background" args={["#090909"]} />
      <fog attach="fog" args={["#090909", 5.5, 9]} />
      <ambientLight intensity={0.92} />
      <directionalLight castShadow position={[3.5, 4.4, 4.8]} intensity={2.45} />
      <spotLight
        castShadow
        position={[-3.8, 5.4, 3.6]}
        angle={0.38}
        penumbra={0.8}
        intensity={2.85}
      />
      <rectAreaLight position={[0, 2.4, 3.1]} intensity={2.6} width={3} height={2.1} />
      <Suspense fallback={null}>
        <DressModel {...props} />
      </Suspense>
      <ContactShadows
        blur={2.8}
        far={4}
        opacity={0.45}
        position={[0, -2, 0]}
        resolution={1024}
      />
      <OrbitControls
        autoRotate
        autoRotateSpeed={0.28}
        enablePan={false}
        minDistance={4}
        maxDistance={6.1}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 5}
        target={[0, 0.04, 0]}
      />
    </Canvas>
  );
}

export default function CustomizePage() {
  const router = useRouter();
  const [fabric, setFabric] = useState<FabricId>("silk");
  const [pattern, setPattern] = useState<PatternId>("solid");
  const [sleeve, setSleeve] = useState<SleeveId>("cap");
  const [neckline, setNeckline] = useState<NecklineId>("classic");
  const [length, setLength] = useState<LengthId>("ankle");
  const [color, setColor] = useState(colors[1].value);
  const [notes, setNotes] = useState("");
  const [measurements, setMeasurements] = useState<Measurements>({
    bust: "",
    waist: "",
    hip: "",
    height: "",
  });
  const [notice, setNotice] = useState("");

  const estimate = useMemo(
    () =>
      basePrice +
      fabrics[fabric].price +
      patterns[pattern].price +
      sleeves[sleeve].price +
      necklines[neckline].price +
      lengths[length].price,
    [fabric, length, neckline, pattern, sleeve]
  );

  const updateMeasurement = (field: keyof Measurements, value: string) => {
    setMeasurements((prev) => ({ ...prev, [field]: value }));
  };

  const addCustomDesignToCart = (goToCart = false) => {
    const customDesign = {
      fabric: fabrics[fabric].label,
      color,
      pattern: patterns[pattern].label,
      sleeve: sleeves[sleeve].label,
      neckline: necklines[neckline].label,
      length: lengths[length].label,
      measurements,
      notes,
    };

    const item = {
      id: `custom-${Date.now()}`,
      name: `${lengths[length].label} Custom ${fabrics[fabric].label} Dress`,
      price: estimate,
      image: patterns[pattern].texture,
      category: "Custom Atelier",
      quantity: 1,
      size: "Made to measure",
      customDesign,
    };

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    localStorage.setItem("cart", JSON.stringify([...cart, item]));
    setNotice("Custom design added to cart.");

    if (goToCart) {
      router.push("/cart");
    } else {
      window.setTimeout(() => setNotice(""), 2200);
    }
  };

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-white">
      <section className="relative overflow-hidden border-b border-white/10 pt-28">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,155,155,0.16),rgba(0,0,0,0)_38%,rgba(197,160,89,0.14))]" />
        <div className="pointer-events-none absolute inset-x-0 top-20 font-display text-[18vw] font-black uppercase italic leading-none text-white/[0.035]">
          Atelier
        </div>

        <div className="relative z-10 mx-auto grid max-w-[1500px] gap-8 px-5 pb-10 md:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:pb-16">
          <section className="min-h-[620px] overflow-hidden rounded-[8px] border border-white/12 bg-black shadow-[0_30px_100px_rgba(0,0,0,0.42)]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.34em] text-[var(--rose)]">
                  Live 3D Preview
                </p>
                <h1 className="mt-2 font-display text-4xl font-light leading-none md:text-6xl">
                  Design your dress
                </h1>
              </div>
              <div className="hidden text-right text-[10px] uppercase tracking-[0.24em] text-white/45 sm:block">
                Drag to rotate
                <br />
                Scroll to zoom
              </div>
            </div>

            <div className="h-[520px] md:h-[660px]">
              <DressCanvas
                color={color}
                fabric={fabric}
                pattern={pattern}
                sleeve={sleeve}
                neckline={neckline}
                length={length}
              />
            </div>
          </section>

          <section className="rounded-[8px] border border-white/12 bg-white/[0.08] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-2xl md:p-7">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.34em] text-[var(--gold)]">
                  Custom Studio
                </p>
                <h2 className="mt-2 font-display text-4xl font-light">
                  Made to measure
                </h2>
                <p className="mt-3 max-w-xl text-sm font-light leading-7 text-white/62">
                  Choose the silhouette, textile mood, and finishing details.
                  Your configuration is saved as a custom cart item for final
                  review.
                </p>
              </div>
              <div className="rounded-[6px] border border-white/12 bg-black/30 px-4 py-3">
                <p className="text-[9px] uppercase tracking-[0.26em] text-white/45">
                  Estimate
                </p>
                <p className="mt-1 font-display text-3xl text-[var(--gold)]">
                  {formatPrice(estimate)}
                </p>
              </div>
            </div>

            <div className="mt-7 space-y-7">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-white/76">
                    Color
                  </h3>
                  <span className="text-xs text-white/42">
                    {colors.find((item) => item.value === color)?.label}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                  {colors.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      aria-label={item.label}
                      onClick={() => setColor(item.value)}
                      className={`h-12 rounded-[6px] border transition ${
                        color === item.value
                          ? "border-[var(--gold)] ring-2 ring-[var(--gold)]/25"
                          : "border-white/12"
                      }`}
                      style={{ backgroundColor: item.value }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-white/76">
                  Fabric
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(Object.keys(fabrics) as FabricId[]).map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setFabric(id)}
                      className={`rounded-[6px] border p-4 text-left transition ${
                        fabric === id
                          ? "border-[var(--rose)] bg-[var(--rose)]/12"
                          : "border-white/12 bg-white/[0.04] hover:border-white/28"
                      }`}
                    >
                      <span className="text-sm font-semibold">
                        {fabrics[id].label}
                      </span>
                      <span className="mt-1 block text-xs text-white/48">
                        {fabrics[id].finish} / +{formatPrice(fabrics[id].price)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-white/76">
                  Pattern References
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(Object.keys(patterns) as PatternId[]).map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPattern(id)}
                      className={`group overflow-hidden rounded-[6px] border text-left transition ${
                        pattern === id
                          ? "border-[var(--gold)] bg-[var(--gold)]/10"
                          : "border-white/12 bg-white/[0.04] hover:border-white/28"
                      }`}
                    >
                      <div className="relative h-24">
                        <Image
                          src={patterns[id].texture}
                          alt={patterns[id].label}
                          fill
                          sizes="(max-width: 768px) 50vw, 260px"
                          className="object-cover opacity-75 transition group-hover:scale-105"
                        />
                      </div>
                      <div className="p-3">
                        <span className="text-sm font-semibold">
                          {patterns[id].label}
                        </span>
                        <span className="mt-1 block text-xs text-white/48">
                          {patterns[id].note} / +{formatPrice(patterns[id].price)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <OptionGroup
                  title="Sleeve"
                  value={sleeve}
                  options={sleeves}
                  onChange={(value) => setSleeve(value as SleeveId)}
                />
                <OptionGroup
                  title="Neckline"
                  value={neckline}
                  options={necklines}
                  onChange={(value) => setNeckline(value as NecklineId)}
                />
                <OptionGroup
                  title="Length"
                  value={length}
                  options={lengths}
                  onChange={(value) => setLength(value as LengthId)}
                />
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-white/76">
                  Measurements
                </h3>
                <div className="grid gap-3 sm:grid-cols-4">
                  {(Object.keys(measurements) as (keyof Measurements)[]).map(
                    (field) => (
                      <input
                        key={field}
                        value={measurements[field]}
                        onChange={(event) =>
                          updateMeasurement(field, event.target.value)
                        }
                        placeholder={`${field} in cm`}
                        inputMode="numeric"
                        className="focus-ring rounded-[6px] border border-white/10 bg-white/5 px-4 py-3 text-sm capitalize text-white placeholder:text-white/28 focus:border-[var(--rose)]/55"
                      />
                    )
                  )}
                </div>
              </div>

              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Add occasion, lining, modesty, embroidery, or fitting notes."
                className="focus-ring min-h-[110px] w-full rounded-[6px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/28 focus:border-[var(--rose)]/55"
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => addCustomDesignToCart(false)}
                  className="btn-luxe inline-flex items-center justify-center"
                >
                  Add Design
                </button>
                <button
                  type="button"
                  onClick={() => addCustomDesignToCart(true)}
                  className="rounded-[6px] border border-white/16 bg-white px-5 py-4 text-sm font-semibold uppercase tracking-[0.22em] text-black transition hover:bg-[#f7efe5]"
                >
                  Review Cart
                </button>
              </div>

              {notice && (
                <p className="rounded-[6px] border border-[var(--rose)]/25 bg-[var(--rose)]/10 px-4 py-3 text-sm text-white/76">
                  {notice}
                </p>
              )}
            </div>
          </section>
        </div>
      </section>

      <section className="bg-white px-5 py-14 text-zinc-950 md:px-10">
        <div className="mx-auto grid max-w-[1400px] gap-5 md:grid-cols-3">
          {[
            ["01", "3D Preview", "Rotate the design and inspect the silhouette before adding it to cart."],
            ["02", "Made To Measure", "Send exact measurements and notes for a cleaner tailor consultation."],
            ["03", "Atelier Review", "Every custom request is reviewed before final stitching and dispatch."],
          ].map(([number, title, text]) => (
            <article key={title} className="border border-zinc-200 p-6">
              <span className="font-display text-4xl italic text-[var(--rose)]">
                {number}
              </span>
              <h3 className="mt-6 font-display text-3xl font-semibold">
                {title}
              </h3>
              <p className="mt-3 text-sm font-light leading-7 text-zinc-600">
                {text}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function OptionGroup({
  title,
  value,
  options,
  onChange,
}: {
  title: string;
  value: string;
  options: Record<string, { label: string; price: number }>;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-white/76">
        {title}
      </h3>
      <div className="space-y-2">
        {Object.entries(options).map(([id, option]) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`w-full rounded-[6px] border px-3 py-3 text-left text-xs transition ${
              value === id
                ? "border-[var(--gold)] bg-[var(--gold)]/10 text-white"
                : "border-white/10 bg-white/[0.04] text-white/58 hover:border-white/28"
            }`}
          >
            <span className="block font-semibold">{option.label}</span>
            <span className="mt-1 block">+{formatPrice(option.price)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
