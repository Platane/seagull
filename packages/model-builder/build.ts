import * as fs from "node:fs";
import * as THREE from "three";
import { GLTFLoader } from "three-stdlib";

/**
 * load a local model
 */
const loadModel = async (modelFilename: string) => {
  // monkey patch for gltf loader
  class E {}
  (global as any).ProgressEvent = E;

  const loader = new GLTFLoader();

  const buffer = fs.readFileSync(modelFilename);
  const { scene } = await loader.parseAsync(
    Uint8Array.from(buffer).buffer,
    "model.glb",
  );

  return scene;
};

/**
 * log scene
 */
const logScene = (n: THREE.Object3D, d = 0) => {
  console.log(" ".repeat(d) + "·", n.name);
  n.children.forEach((c) => logScene(c, d + 1));
};

/**
 * return geometry as list of triangles flattened
 */
const getPositionVectors = (geo: THREE.BufferGeometry) => {
  const positions = geo.getAttribute("position")!;
  const indexes = geo.getIndex()!;

  return Array.from(indexes.array).map(
    (i) =>
      new THREE.Vector3(
        positions.getX(i),
        positions.getY(i),
        positions.getZ(i),
      ),
  );
};

/**
 * pack vertices flat list
 */
export const pack = (vertices: THREE.Vector3[]) => {
  const bb = new THREE.Box3();
  vertices.forEach((p) => bb.expandByPoint(p));

  const center = bb.getCenter(new THREE.Vector3());
  const size = bb.getSize(new THREE.Vector3());

  const pack = new Uint8Array(
    vertices
      .map((v) =>
        [
          ((v.x - center.x + size.x / 2) / size.x) * 0.999,
          ((v.y - center.y + size.y / 2) / size.y) * 0.999,
          ((v.z - center.z + size.z / 2) / size.z) * 0.999,
        ].map((x) => x * 256),
      )
      .flat(),
  );

  return { pack, size };
};

//
//
//
//

{
  const model = await loadModel(__dirname + "/seagull.glb");
  const nodes = model.children as THREE.Mesh[];

  logScene(model);

  const bones = nodes
    .filter((o) => o.name.startsWith("gizmo"))
    .map((o) => o.position.round().toArray());

  console.log("\n\nbones\n" + bones.join("\n"));

  const body = getPositionVectors(
    nodes.find((o) => o.name === "body")!.geometry,
  );
  const leg = getPositionVectors(nodes.find((o) => o.name === "leg")!.geometry);
  const eye = getPositionVectors(nodes.find((o) => o.name === "eye")!.geometry);
  const beak = getPositionVectors(
    nodes.find((o) => o.name === "beak")!.geometry,
  );
  const flap = getPositionVectors(
    nodes.find((o) => o.name === "flap")!.geometry,
  );

  const packed = pack([...body, ...flap, ...eye, ...beak, ...leg]);

  const meta = {
    verticesSegments: [
      body.length + flap.length,
      eye.length,
      beak.length,
      leg.length,
    ],

    packedGeometrySize: packed.size.round().toArray(),
    bones,
  };

  const assetDir = __dirname + "/../game/assets/models";
  const seagullDir = assetDir + "/seagull";

  fs.mkdirSync(seagullDir, { recursive: true });

  fs.writeFileSync(seagullDir + "/geometry.bin", packed.pack);
  fs.writeFileSync(seagullDir + "/meta.json", JSON.stringify(meta, null, 2));
}
