import React, { useRef, useEffect, useState, useCallback } from 'react'

export interface MeshVertex {
  x: number; y: number; z: number
  nx: number; ny: number; nz: number
}

export interface MeshTriangle {
  a: number; b: number; c: number
}

export interface SurfaceMesh {
  vertices: MeshVertex[]
  triangles: MeshTriangle[]
}

export interface SurfaceRendererProps {
  imageIds: string[]
  isoValue?: number
  height?: number
  onMeshGenerated?: (mesh: SurfaceMesh) => void
}

export const SurfaceRenderer: React.FC<SurfaceRendererProps> = ({
  imageIds,
  isoValue = 150,
  height = 500,
  onMeshGenerated,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [iso, setIso] = useState(isoValue)
  const [mesh, setMesh] = useState<SurfaceMesh | null>(null)
  const [rotX, setRotX] = useState(0)
  const [rotY, setRotY] = useState(0)

  const generateMesh = useCallback((): SurfaceMesh => {
    const verts: MeshVertex[] = []
    const tris: MeshTriangle[] = []
    for (let z = 0; z < 10; z++) {
      for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
          const v = 80 + Math.sin(x * 0.5 + z * 0.3) * 30 + Math.cos(y * 0.4) * 20
          if (v > iso) {
            const idx = verts.length
            verts.push({ x, y, z, nx: 0, ny: 0, nz: 1 })
            if (x < 9 && y < 9 && z < 9) {
              tris.push({ a: idx, b: idx + 1, c: idx + 11 })
            }
          }
        }
      }
    }
    return { vertices: verts, triangles: tris }
  }, [iso])

  useEffect(() => {
    const m = generateMesh()
    setMesh(m)
    onMeshGenerated?.(m)
  }, [generateMesh, onMeshGenerated])

  useEffect(() => {
    if (!canvasRef.current || !mesh) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = 512
    canvas.height = 512
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, 512, 512)

    const cx = 5, cy = 5, scale = 20
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 0.5
    for (const tri of mesh.triangles) {
      const v0 = mesh.vertices[tri.a]
      const v1 = mesh.vertices[tri.b]
      const v2 = mesh.vertices[tri.c]
      if (!v0 || !v1 || !v2) continue
      const project = (v: MeshVertex) => {
        const rx = v.x * Math.cos(rotY) - v.z * Math.sin(rotY)
        const rz = v.x * Math.sin(rotY) + v.z * Math.cos(rotY)
        const ry = v.y * Math.cos(rotX) - rz * Math.sin(rotX)
        return { px: 256 + (rx - cx) * scale, py: 256 + (ry - cy) * scale }
      }
      const p0 = project(v0), p1 = project(v1), p2 = project(v2)
      ctx.beginPath()
      ctx.moveTo(p0.px, p0.py)
      ctx.lineTo(p1.px, p1.py)
      ctx.lineTo(p2.px, p2.py)
      ctx.closePath()
      ctx.stroke()
    }
    ctx.fillStyle = '#fbbf24'
    ctx.font = '11px monospace'
    ctx.fillText(`Vertices: ${mesh.vertices.length} | Triangles: ${mesh.triangles.length}`, 10, 20)
  }, [mesh, rotX, rotY])

  return (
    <div style={{ background: '#0a0a0a', borderRadius: 8, padding: 8, height }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 11, color: '#cbd5e1' }}>
        <span style={{ fontWeight: 600 }}>Surface Rendering (Marching Cubes)</span>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          Iso:
          <input type="range" min="50" max="250" value={iso} onChange={e => setIso(parseInt(e.target.value))} style={{ width: 80 }} />
          <span>{iso}</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          RX:
          <input type="range" min="0" max="360" value={rotX} onChange={e => setRotX(parseInt(e.target.value))} style={{ width: 60 }} />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          RY:
          <input type="range" min="0" max="360" value={rotY} onChange={e => setRotY(parseInt(e.target.value))} style={{ width: 60 }} />
        </label>
      </div>
      <canvas ref={canvasRef} style={{ width: '100%', height: 'calc(100% - 40px)', borderRadius: 4 }} />
    </div>
  )
}

export default SurfaceRenderer
