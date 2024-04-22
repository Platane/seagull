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
  console.log("  ".repeat(d) + "·", n.name);
  n.children.forEach((c) => logScene(c, d + 1));
};

/**
 * return geometry as list of triangles flattened
 */
const getPositionVectors = (m: THREE.Mesh) => {
  const positions = m.geometry.getAttribute("position")!;
  const indexes = m.geometry.getIndex()!;

  return Array.from(indexes.array).map((i) => {
    const p = new THREE.Vector3(
      positions.getX(i),
      positions.getY(i),
      positions.getZ(i),
    );

    p.applyMatrix4(m.matrixWorld);

    return p;
  });
};

/**
 * pack vertices flat list
 */
export const pack = (vertices: THREE.Vector3[]) => {
  const bb = new THREE.Box3();
  vertices.forEach((p) => bb.expandByPoint(p));

  const center = bb.getCenter(new THREE.Vector3());
  const size = bb.getSize(new THREE.Vector3());

  const payload = new Uint8Array(
    vertices
      .map((v) =>
        [
          ((v.x - center.x + size.x / 2) / size.x) * 0.9999,
          ((v.y - center.y + size.y / 2) / size.y) * 0.9999,
          ((v.z - center.z + size.z / 2) / size.z) * 0.9999,
        ].map((x) => x * 256),
      )
      .flat(),
  );

  return { payload, size, center };
};

const extractBones = (bone: THREE.Bone | THREE.Object3D): THREE.Matrix4[] => [
  bone.matrixWorld,
  ...bone.children.flatMap(extractBones),
];

//
//
//
//

{
  const model = await loadModel(__dirname + "/seagull.glb");
  model.updateWorldMatrix(true, true);
  const nodes = model.children as THREE.Mesh[];

  logScene(model);

  const body = getPositionVectors(nodes.find((o) => o.name === "body")!);
  const leg = getPositionVectors(nodes.find((o) => o.name === "leg")!);
  const eye = getPositionVectors(nodes.find((o) => o.name === "eye")!);
  const beak = getPositionVectors(nodes.find((o) => o.name === "beak")!);
  const flap = getPositionVectors(nodes.find((o) => o.name === "flap")!);

  const vertices = [...body, ...flap, ...eye, ...beak, ...leg];

  const S = 1 / 42;

  // biome-ignore format: <explanation>
  const rotate = new THREE.Matrix4().set(
    1, 0, 0, 0,
    0, 0,-1, 0,
    0, 1, 0, 0,
    0, 0, 0, 1,
  )

  const packed = pack(
    vertices.map((p) => p.applyMatrix4(rotate).multiplyScalar(S)),
  );

  const assetDir = __dirname + "/../game/assets/models";
  const seagullDir = assetDir + "/seagull";

  fs.mkdirSync(seagullDir, { recursive: true });

  fs.writeFileSync(seagullDir + "/geometry.bin", packed.payload);
  fs.writeFileSync(
    seagullDir + "/geometry-meta.json",
    JSON.stringify(
      {
        size: packed.size.toArray(),
        center: packed.center.toArray(),
        verticesSegments: [
          body.length + flap.length,
          eye.length,
          beak.length,
          leg.length,
        ],
      },
      null,
      2,
    ),
  );

  {
    const poses = [
      extractBones(nodes.find((o) => o.name === "pose-bind")!),
      extractBones(nodes.find((o) => o.name === "pose-idle")!),
    ];
    const bonesCount = poses[0].length;
    const posesCount = poses.length;

    const payload = new Float32Array(
      poses.flatMap((bones) =>
        bones.flatMap((m) => {
          const p = new THREE.Vector3();
          const q = new THREE.Quaternion();
          const s = new THREE.Vector3();

          m.decompose(p, q, s);

          const pp = p.applyMatrix4(rotate).multiplyScalar(S);

          const Q = new THREE.Quaternion();
          Q.setFromRotationMatrix(rotate);

          const qq = Q.multiply(q);

          return [...pp.toArray(), 0, 0, 0, 1];
          return [...pp.toArray(), ...qq.toArray()];
        }),
      ),
    );

    fs.writeFileSync(seagullDir + "/pose.bin", payload);

    fs.writeFileSync(
      seagullDir + "/pose-meta.json",
      JSON.stringify(
        { bonesCount, posesCount, poses: ["bind", "idle"] },
        null,
        2,
      ),
    );
  }
}
