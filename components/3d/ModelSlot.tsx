"use client";

import { Component, Suspense, useMemo, type ReactNode } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { Model3D } from "@/data/models3d";

type V3 = [number, number, number];

class ModelBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn("[LND 3D] Modelo .glb não carregou — usando o modelo procedural.", error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/** Carrega um .glb e o encaixa (escala uniforme + centralização) na caixa reservada para a peça. */
function GlbModel({ model, center, size }: { model: Model3D; center: V3; size: V3 }) {
  const gltf = useGLTF(model.url);
  const object = useMemo(() => {
    const root = gltf.scene.clone(true);
    const wrapper = new THREE.Group();
    if (model.rotation) root.rotation.set(...model.rotation);
    wrapper.add(root);
    wrapper.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(wrapper);
    const dims = box.getSize(new THREE.Vector3());
    const mid = box.getCenter(new THREE.Vector3());
    const k = Math.min(size[0] / dims.x, size[1] / dims.y, size[2] / dims.z) * (model.scale ?? 1);
    root.position.set(-mid.x, -mid.y, -mid.z);
    const outer = new THREE.Group();
    outer.add(wrapper);
    wrapper.scale.setScalar(k);
    // o painel de vidro e os pontos clicáveis ficam por cima; o GLB não deve capturar cliques
    root.traverse((o) => {
      o.raycast = () => null;
    });
    return outer;
  }, [gltf.scene, model, size]);
  return <primitive object={object} position={center} />;
}

/**
 * Renderiza o modelo licenciado (.glb) quando existir; caso contrário (ou enquanto carrega / se falhar)
 * mostra a peça procedural passada como `children`.
 */
export default function ModelSlot({
  model,
  center,
  size,
  children,
}: {
  model?: Model3D;
  center: V3;
  size: V3;
  children: ReactNode;
}) {
  if (!model) return <>{children}</>;
  return (
    <ModelBoundary key={model.url} fallback={children}>
      <Suspense fallback={children}>
        <GlbModel model={model} center={center} size={size} />
      </Suspense>
    </ModelBoundary>
  );
}
