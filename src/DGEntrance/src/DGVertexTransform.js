DG.VertexTransform = function (latlngs) {
    this._vertices = latlngs;
    this._vFr = latlngs.length - 2;
    this._vTo = latlngs.length - 1;
    this._angle = null;
};

DG.VertexTransform.prototype = {
    transform: function (map, ring, scale) {
        var fr = map.project(this._vertices[this._vFr]),
            to = map.project(this._vertices[this._vTo]),
            po = map.getPixelOrigin(),
            dx = to.x,
            dy = to.y,
            x = dx - fr.x,
            y = dy - fr.y,
            rx, ry, cosS, sinS,
            _ring = [];

        dx -= po.x;
        dy -= po.y;
        scale = scale || 1;
        if (!this._angle) {
            this._angle = DG.VertexTransform.getAngle(x, y);
        }
        cosS = this._angle.cos * scale;
        sinS = this._angle.sin * scale;
        for (var j = 0, len = ring.length; j < len; j++) {
            rx = ring[j].x;
            ry = ring[j].y;
            x = rx * cosS - ry * sinS + dx;
            y = rx * sinS + ry * cosS + dy;
            _ring.push(new DG.Point(+x.toFixed(2), +y.toFixed(2)));
        }
        return _ring;
    },

    scale: function (ring, scale) {
        var x, y, _ring = [];

        scale = scale || 1;
        for (var j = 0, len = ring.length; j < len; j++) {
            x = ring[j].x * scale;
            y = ring[j].y * scale;
            _ring.push(new DG.Point(x, y));
        }
        return _ring;
    },

    unScale: function (ring, scale) {
        scale = scale || 1;     //  Also safeguard against zero scale
        return this.scale(ring, 1 / scale);
    },

    rotate: function (ring, angle) {
        var cos = angle ? angle.cos : this._angle.cos,
            sin = angle ? angle.sin : this._angle.sin,
            x, y, rx, ry,
            _ring = [];

        for (var j = 0, len = ring.length; j < len; j++) {
            rx = ring[j].x;
            ry = ring[j].y;
            x = rx * cos - ry * sin;
            y = rx * sin + ry * cos;
            _ring.push(new DG.Point(x, y));
        }
        return _ring;
    },

    unRotate: function (ring, angle) {
        var cos = angle ? angle.cos : this._angle.cos,
            sin = angle ? angle.sin : this._angle.sin;
        return this.rotate(ring, {cos: cos, sin: -sin});
    },

    translate: function (ring, v) {
        var dx = v ? v.x : 0,
            dy = v ? v.y : 0,
            x, y, _ring = [];

        for (var j = 0, len = ring.length; j < len; j++) {
            x = ring[j].x + dx;
            y = ring[j].y + dy;
            _ring.push(new DG.Point(x, y));
        }
        return _ring;
    },

    unTranslate: function (ring, v) {
        var dx = v ? v.x : 0,
            dy = v ? v.y : 0;
        return this.translate(ring, new DG.Point(-dx, -dy));
    }
};

DG.VertexTransform.getLength = function (x, y) {
    var dx, dy;

    if (typeof x === 'number') {
        //  'x' and 'y' are absolute coordinates of vector
        return Math.sqrt(x * x + y * y);
    } else {
        //  'x' and 'y' are vector objects
        dx = y.x - x.x;
        dy = y.y - x.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
};

DG.VertexTransform.getAngle = function (x, y, o) {
    var l, sp, x1, y1, x2, y2;

    if (typeof x === 'number') {
        //  'x' and 'y' are absolute coordinates of vector
        l = Math.sqrt(x * x + y * y);
        if (l > 0) {
            return {cos: x / l, sin: y / l};
        } else {
            return {cos: 1, sin: 0};
        }
    } else {
        //  'x' and 'y' are vector objects
        x1 = x.x; y1 = x.y;
        x2 = y.x; y2 = y.y;
        if (o) {
            x1 -= o.x; y1 -= o.y;
            x2 -= o.x; y2 -= o.y;
        }
        sp = Math.sqrt(x1 * x1 + y1 * y1) * Math.sqrt(x2 * x2 + y2 * y2);
        return {
            cos: (x1 * x2 + y1 * y2) / sp,
            sin: (x1 * y2 - x2 * y1) / sp
        };
    }
};




DG.ShapeTransform = function (vertices) {
    DG.VertexTransform.call(this, vertices);
    this._map = null;
    this._shape = null;
    this._angles = null;
};

DG.ShapeTransform.prototype = DG.Util.create(DG.VertexTransform.prototype);
DG.extend(DG.ShapeTransform.prototype, {
    prepare: function (map, shape) {
        var ov = this._getLastVector(map);

        this._map = map;
        this._shape = shape;
        this._angle = DG.VertexTransform.getAngle(ov.x, ov.y);
        this._angles = this._getAngles();
        return this;
    },

    transform: function (ring, scale) {
        var to = this._map.project(this._vertices[this._vTo]),
            po = this._map.getPixelOrigin(),
            dx = to.x - po.x,
            dy = to.y - po.y,
            x, y, _ring = [];

        scale = scale || 1;
        for (var j = 0, len = ring.length; j < len; j++) {
            x = ring[j].x * scale + dx;
            y = ring[j].y * scale + dy;
            _ring.push(new DG.Point(+x.toFixed(2), +y.toFixed(2)));
        }
        return _ring;
    },

    getAngles: function () {
        return this._angles;
    },

    _getAngles: function () {
        var i, len, absSin, det, cos, sin, cot, angle, angles = [],
            getAngle = DG.VertexTransform.getAngle,
            path = this.getTranslatedPath(),
            fullAngle = {cos: 1, sin: 0};

        for (i = 1, len = path.length - 1; i < len; i++) {
            angle = getAngle(path[i - 1], path[i + 1], path[i]);

            absSin = Math.abs(angle.sin);
            if (absSin < 0.000001) {
                //  Exclude angle from vertices array
                this._excludeVertex(i);
            } else {
                //  This is half ∢α cotangent, sign describes angle direction and used to shortcut stroke calculations
                //  '-1' - right angle is inner angle, '1' - left angle is inner angle (if seen from [0, 0] to [-1, 0])
                angle.cot = (1 + angle.cos) / angle.sin;

                //  We need to rotate next segment to [-1, 0] axis, so we need complementary angle actually
                angle.cos = -angle.cos;

                //  Complimentary angle also used to calculate it's quaternary ∢β tangent
                //  ∢β tangent used in approximation of outer arc segment by Bézier curve
                cot = (1 + angle.cos) / angle.sin;
                //sin = (cot < 0 ? -1 : 1) / Math.sqrt(1 + cot * cot);
                //cos = Math.sqrt(1 - sin * sin);
                //angle.tan = sin / (1 + cos);
                det = Math.sqrt(4 * cot * cot + 4) * (cot < 0 ? -1 : 1);
                angle.tan = -0.5 * (cot + cot - det);

                angles.push(angle);

                cos = fullAngle.cos * angle.cos - fullAngle.sin * angle.sin;
                sin = fullAngle.sin * angle.cos + fullAngle.cos * angle.sin;

                fullAngle = {cos: cos, sin: sin};
            }
        }

        //  Used in final stroke points translation
        angles.fullAngle =  {cos: fullAngle.cos, sin: -fullAngle.sin};
        return angles;
    },

    getTranslatedPath: function (zoom) {
        var map = this._map,
            vertices = this._vertices,
            i = vertices.length - 1,
            dx, dy, v, path = [];

        zoom = zoom || map.getMaxZoom();
        v = map.project(vertices[i], zoom);
        dx = v.x; dy = v.y;
        path.push(new DG.Point(0, 0));

        while (i--) {
            v = map.project(vertices[i], zoom);
            path.push(new DG.Point(v.x - dx, v.y - dy));
        }

        return this.unRotate(path);
    },

    _excludeVertex: function (index) {
        index = this._vertices.length - index - 1;
        this._vertices.splice(index, 1);
    },

    _getLastVector: function (map) {
        return map.project(this._vertices[this._vTo])
            .subtract(map.project(this._vertices[this._vFr]));
    }
});

DG.ShapeTransform.transform = function (rings, angle, vector) {
    var cos = angle.cos, sin = angle.sin,
        dx = vector.x, dy = vector.y,
        ring, x, y, j, i = rings.length;

    while (i--) {
        ring = rings[i];
        j = ring.length;
        while (j--) {
            x = ring[j].x - dx;
            y = ring[j].y - dy;
            ring[j].x = x * cos - y * sin;
            ring[j].y = x * sin + y * cos;
        }
    }
};
