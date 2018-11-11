import * as Victor from "victor";

export function calcMinGrid(area, w, h) {
    const ratio = w / h;
    const height = Math.sqrt(area / ratio)
    

    return {
        width: Math.ceil(height * ratio),
        height: Math.ceil(height),
        cellHeight: h / (Math.ceil(height) - 1),
        cellWidth: w / (Math.ceil(height * ratio) - 1),
    }
}

export function distToSegmentSquared(p: Victor, v: Victor, w: Victor) {
    var l2 = v.distanceSq(w);
    if (l2 == 0) return p.distanceSq(v);
    var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return p.distanceSq(new Victor(v.x + t * (w.x - v.x), v.y + t * (w.y - v.y)));
}

export function distToSegment(p: Victor, v: Victor, w: Victor) { return Math.sqrt(distToSegmentSquared(p, v, w)); }