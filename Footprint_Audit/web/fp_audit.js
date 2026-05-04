const KonvaScaleBy = 1.1;
const mm2px_scale = 500;

const fill_background_color = 'lightyellow';
const fill_outline_color = 'brown';
const symbol_strokeWidth = 15;
const sym_pinNameColor = '#9A4499';
const sym_pinNumColor = 'black'


const fp_bgColor = '#778899';
const fp_strokeWidth = 15;
const fp_strokeColor_default = 'yellow';
const fp_strokeColor_SilkS = 'white';
const fp_strokeColor_Fab = 'darkgrey';
const fp_strokeColor_CrtYd = 'violet';
const fp_pinTextColor = 'black';
const fp_SMDpadColor = 'red';
const fp_THTcontactColor = 'gold';
const fp_NP_THT_Color = 'blue';

const measurement_line_strokeColor = 'lightgreen';
const measurement_line_id = 'MeasurementLine';
const measurement_value_id = 'MeasurementValue';

const snapPoints_cellSize = 100;
const snapPoints_proximityThreshold = 50;

// Reload whole site on resize to resize each canvas
window.addEventListener('resize', () => { location.reload() });

function arcToKonvaProps(S, M, E, thickness = 0) {
    const cross2D = (a, b) => a.x * b.y - a.y * b.x;
    const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
    const add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
    const scale = (a, t) => ({ x: a.x * t, y: a.y * t });
    const toDeg = (r) => r * (180 / Math.PI);
    // Perpendicular bisectors
    const P1 = { x: (S.x + M.x) / 2, y: (S.y + M.y) / 2 };
    const P2 = { x: (M.x + E.x) / 2, y: (M.y + E.y) / 2 };
    const n1 = { x: -(M.y - S.y), y: M.x - S.x };
    const n2 = { x: -(E.y - M.y), y: E.x - M.x };
    const denom = cross2D(n1, n2);
    if (Math.abs(denom) < 1e-10) throw new Error("Points are collinear — no arc");
    const t = cross2D(sub(P2, P1), n2) / denom;
    const C = add(P1, scale(n1, t));
    const R = Math.hypot(S.x - C.x, S.y - C.y);
    const startAngle = Math.atan2(S.y - C.y, S.x - C.x);
    const endAngle = Math.atan2(E.y - C.y, E.x - C.x);
    const midAngle = Math.atan2(M.y - C.y, M.x - C.x);
    // Determine CCW sweep from start to end, validated by mid point
    let sweep = endAngle - startAngle;
    let midCheck = midAngle - startAngle;
    if (sweep < 0) sweep += 2 * Math.PI;
    if (midCheck < 0) midCheck += 2 * Math.PI;
    // If mid doesn't fall in CCW sweep → arc goes the other way
    if (midCheck > sweep) sweep = sweep - 2 * Math.PI;
    // Konva.Arc draws CCW with a positive angle from `rotation`
    // If our sweep is negative (CW), flip start to end and use positive sweep
    let rotation = startAngle;
    if (sweep < 0) {
        rotation = endAngle;      // start drawing from the other end
        sweep = -sweep;           // make angle positive
    }

    return {
        x: C.x,
        y: C.y,
        outerRadius: R + thickness / 2,
        innerRadius: R - thickness / 2,  // 0 for a line arc
        rotation: toDeg(rotation),
        angle: toDeg(sweep),             // always positive for Konva
    };
}

function drawSymbol(stage, layer, symbol_geometry) {
    for (var i = 0; i < symbol_geometry.length; ++i) {
        var newKonvaNode;
        switch (symbol_geometry[i].type) {
            case "SymbolRectangle":
                newKonvaNode = new Konva.Rect({
                    x: (stage.width() / 2) + symbol_geometry[i].start.x * mm2px_scale,
                    y: (stage.height() / 2) - symbol_geometry[i].start.y * mm2px_scale,
                    width: ((stage.width() / 2) + symbol_geometry[i].end.x * mm2px_scale) - ((stage.width() / 2) + symbol_geometry[i].start.x * mm2px_scale),
                    height: ((stage.height() / 2) - symbol_geometry[i].end.y * mm2px_scale) - ((stage.height() / 2) - symbol_geometry[i].start.y * mm2px_scale),
                });
                break;
            case "SymbolPolyline":
                var points = []
                for (var j = 0; j < symbol_geometry[i].points.length; ++j) {
                    points.push((stage.width() / 2) + symbol_geometry[i].points[j].x * mm2px_scale);
                    points.push((stage.height() / 2) - symbol_geometry[i].points[j].y * mm2px_scale);
                }
                newKonvaNode = new Konva.Line({
                    points: points,
                    fillAfterStrokeEnabled: true
                });
                break;
            case "SymbolCircle":
                newKonvaNode = new Konva.Circle({
                    x: (stage.width() / 2) + symbol_geometry[i].center.x * mm2px_scale,
                    y: (stage.height() / 2) - symbol_geometry[i].center.y * mm2px_scale,
                    radius: symbol_geometry[i].radius * mm2px_scale,
                });
                break;
            case "SymbolArc":
                var konvaParams = arcToKonvaProps(symbol_geometry[i].start, symbol_geometry[i].mid, symbol_geometry[i].end, thickness = 0);
                newKonvaNode = new Konva.Arc({
                    x: (stage.width() / 2) + konvaParams.x * mm2px_scale,
                    y: (stage.height() / 2) - konvaParams.y * mm2px_scale,
                    rotation: konvaParams.rotation,
                    innerRadius: konvaParams.innerRadius * mm2px_scale,
                    outerRadius: konvaParams.outerRadius * mm2px_scale,
                    angle: konvaParams.angle,
                    clockwise: true,
                });
                break;
            case "SymbolPin":
                var points = [
                    (stage.width() / 2) + symbol_geometry[i].position.x * mm2px_scale,
                    (stage.height() / 2) - symbol_geometry[i].position.y * mm2px_scale
                ];
                newKonvaNode = new Konva.Line({
                    fillAfterStrokeEnabled: true,
                });
                var pinNum = new Konva.Text({
                    width: symbol_geometry[i].length * mm2px_scale,
                    height: symbol_geometry[i].length * mm2px_scale / 2.5,
                    text: symbol_geometry[i].number,
                    align: 'center',
                    fill: sym_pinNumColor,
                    fontSize: symbol_geometry[i].length * mm2px_scale / 2.5
                });
                var pinName = new Konva.Text({
                    width: symbol_geometry[i].name.length * symbol_geometry[i].length * mm2px_scale / 3,
                    height: pinNum.height(),
                    text: symbol_geometry[i].name,
                    align: 'center',
                    fill: sym_pinNameColor,
                    fontSize: symbol_geometry[i].length * mm2px_scale / 2.5
                });
                switch (symbol_geometry[i].rotation) {
                    case 0: // left
                        points.push(points[0] + symbol_geometry[i].length * mm2px_scale);
                        points.push(points[1]);
                        pinNum.x(stage.width() / 2 + symbol_geometry[i].position.x * mm2px_scale);
                        pinNum.y(stage.height() / 2 - symbol_geometry[i].position.y * mm2px_scale - symbol_geometry[i].length * mm2px_scale / 2.5);
                        pinName.x(stage.width() / 2 + symbol_geometry[i].position.x * mm2px_scale - pinName.width());
                        pinName.y(stage.height() / 2 - symbol_geometry[i].position.y * mm2px_scale - pinName.height() / 2);
                        break;
                    case 90: // down 
                        points.push(points[0]);
                        points.push(points[1] - symbol_geometry[i].length * mm2px_scale);
                        pinNum.x((stage.width() / 2) + symbol_geometry[i].position.x * mm2px_scale - symbol_geometry[i].length * mm2px_scale / 2.5);
                        pinNum.y((stage.height() / 2) - symbol_geometry[i].position.y * mm2px_scale);
                        pinNum.rotation(270);
                        pinName.x(stage.width() / 2 + symbol_geometry[i].position.x * mm2px_scale - pinName.height() / 2);
                        pinName.y(stage.height() / 2 - symbol_geometry[i].position.y * mm2px_scale + pinName.width());
                        pinName.rotation(270);
                        break;
                    case 180: // right
                        points.push(points[0] - symbol_geometry[i].length * mm2px_scale);
                        points.push(points[1]);
                        pinNum.x((stage.width() / 2) + (symbol_geometry[i].position.x - symbol_geometry[i].length) * mm2px_scale);
                        pinNum.y((stage.height() / 2) - symbol_geometry[i].position.y * mm2px_scale);
                        pinName.x(stage.width() / 2 + symbol_geometry[i].position.x * mm2px_scale);
                        pinName.y(stage.height() / 2 - symbol_geometry[i].position.y * mm2px_scale - pinName.height() / 2);
                        break;
                    case 270: // up
                        points.push(points[0]);
                        points.push(points[1] + symbol_geometry[i].length * mm2px_scale);
                        pinNum.x((stage.width() / 2) + symbol_geometry[i].position.x * mm2px_scale);
                        pinNum.y((stage.height() / 2) - symbol_geometry[i].position.y * mm2px_scale + symbol_geometry[i].length * mm2px_scale);
                        pinNum.rotation(270);
                        pinName.x(stage.width() / 2 + symbol_geometry[i].position.x * mm2px_scale - pinName.height() / 2);
                        pinName.y(stage.height() / 2 - symbol_geometry[i].position.y * mm2px_scale);
                        pinName.rotation(270);
                        break;
                }
                newKonvaNode.points(points);
                layer.add(pinNum);
                layer.add(pinName);
                break;
            default:
                console.log("ERROR: Undefined Symbol Shape Type: " + symbol_geometry[i].type)
        }
        newKonvaNode.stroke(fill_outline_color);
        newKonvaNode.strokeWidth(symbol_strokeWidth);
        if (symbol_geometry[i].fill_type == "background") {
            newKonvaNode.fill(fill_background_color);
        }
        if (symbol_geometry[i].fill_type == "outline") {
            newKonvaNode.fill(fill_outline_color);
        }
        layer.add(newKonvaNode);
    }
}

function drawFootprint(stage, layer, footprint_geometry) {
    for (var i = 0; i < footprint_geometry.length; ++i) {
        var newKonvaNode;
        switch (footprint_geometry[i].type) {
            case "FP_Rectangle":
                newKonvaNode = new Konva.Rect({
                    x: (stage.width() / 2) + footprint_geometry[i].start.x * mm2px_scale,
                    y: (stage.height() / 2) + footprint_geometry[i].start.y * mm2px_scale,
                    width: ((stage.width() / 2) + footprint_geometry[i].end.x * mm2px_scale) - ((stage.width() / 2) + footprint_geometry[i].start.x * mm2px_scale),
                    height: ((stage.height() / 2) + footprint_geometry[i].end.y * mm2px_scale) - ((stage.height() / 2) + footprint_geometry[i].start.y * mm2px_scale),
                });
                break;
            case "FP_Polyline":
                var points = []
                for (var j = 0; j < footprint_geometry[i].points.length; ++j) {
                    points.push((stage.width() / 2) + footprint_geometry[i].points[j].x * mm2px_scale);
                    points.push((stage.height() / 2) + footprint_geometry[i].points[j].y * mm2px_scale);
                }
                newKonvaNode = new Konva.Line({
                    points: points,
                    fillAfterStrokeEnabled: true,
                });
                break;
            case "FP_Circle":
                newKonvaNode = new Konva.Circle({
                    x: (stage.width() / 2) + footprint_geometry[i].center.x * mm2px_scale,
                    y: (stage.height() / 2) + footprint_geometry[i].center.y * mm2px_scale,
                    radius: footprint_geometry[i].radius * mm2px_scale,
                });
                break;
            case "FP_Arc":
                var konvaParams = arcToKonvaProps(footprint_geometry[i].start, footprint_geometry[i].mid, footprint_geometry[i].end, thickness = 0);
                newKonvaNode = new Konva.Arc({
                    x: (stage.width() / 2) + konvaParams.x * mm2px_scale,
                    y: (stage.height() / 2) + konvaParams.y * mm2px_scale,
                    rotation: konvaParams.rotation,
                    innerRadius: konvaParams.innerRadius * mm2px_scale,
                    outerRadius: konvaParams.outerRadius * mm2px_scale,
                    angle: konvaParams.angle,
                    clockwise: true,
                });
                break;
            case "FP_Pad":
                var newKonvaNode = new Konva.Group();
                switch (footprint_geometry[i].padType) {
                    case "THT":
                        if (footprint_geometry[i].padGeometry == "PadRect"
                            || footprint_geometry[i].padGeometry == "PadRoundRect"
                            || footprint_geometry[i].padGeometry == "PadOval") {
                            var pad = new Konva.Rect({
                                x: (stage.width() / 2) + (footprint_geometry[i].position.x * mm2px_scale - footprint_geometry[i].size.x / 2 * mm2px_scale),
                                y: (stage.height() / 2) + (footprint_geometry[i].position.y * mm2px_scale - footprint_geometry[i].size.y / 2 * mm2px_scale),
                                width: footprint_geometry[i].size.x * mm2px_scale,
                                height: footprint_geometry[i].size.y * mm2px_scale,
                                stroke: fp_THTcontactColor,
                                fill: fp_THTcontactColor,
                                //strokeWidth: fp_strokeWidth
                            });
                            if (footprint_geometry[i].padGeometry == "PadRoundRect") {
                                var radiusRatio = footprint_geometry[i].roundrect_rratio
                                pad.cornerRadius(pad.width() < pad.height() ? pad.width() * radiusRatio : pad.height() * radiusRatio);
                            }
                            if (footprint_geometry[i].padGeometry == "PadOval") {
                                pad.cornerRadius((pad.width() < pad.height() ? pad.width() : pad.height()) / 2);
                            }
                        }
                        if (footprint_geometry[i].padGeometry == "PadCircle") {
                            var pad = new Konva.Circle({
                                x: (stage.width() / 2) + footprint_geometry[i].position.x * mm2px_scale,
                                y: (stage.height() / 2) + footprint_geometry[i].position.y * mm2px_scale,
                                radius: footprint_geometry[i].size.x / 2 * mm2px_scale,
                                stroke: fp_THTcontactColor,
                                fill: fp_THTcontactColor,
                                strokeWidth: fp_strokeWidth
                            });
                        }
                        newKonvaNode.add(pad);
                        var drillHole = new Konva.Rect({
                            x: (stage.width() / 2) + (footprint_geometry[i].position.x * mm2px_scale - footprint_geometry[i].drill.x / 2 * mm2px_scale),
                            y: (stage.height() / 2) + (footprint_geometry[i].position.y * mm2px_scale - footprint_geometry[i].drill.y / 2 * mm2px_scale),
                            width: footprint_geometry[i].drill.x * mm2px_scale,
                            height: footprint_geometry[i].drill.y * mm2px_scale,
                            stroke: fp_bgColor,
                            fill: fp_bgColor,
                            //strokeWidth: fp_strokeWidth
                        });
                        drillHole.cornerRadius((drillHole.width() < drillHole.height() ? drillHole.width() : drillHole.height()) / 2);
                        newKonvaNode.add(drillHole);
                        break;
                    case "SMD":
                        if (footprint_geometry[i].padGeometry == "PadRect"
                            || footprint_geometry[i].padGeometry == "PadRoundRect") {
                            var pad = new Konva.Rect({
                                x: (stage.width() / 2) + (footprint_geometry[i].position.x * mm2px_scale - footprint_geometry[i].size.x / 2 * mm2px_scale),
                                y: (stage.height() / 2) + (footprint_geometry[i].position.y * mm2px_scale - footprint_geometry[i].size.y / 2 * mm2px_scale),
                                width: footprint_geometry[i].size.x * mm2px_scale,
                                height: footprint_geometry[i].size.y * mm2px_scale,
                                stroke: fp_SMDpadColor,
                                fill: fp_SMDpadColor,
                                //strokeWidth: fp_strokeWidth
                            });
                            if (footprint_geometry[i].padGeometry == "PadRoundRect") {
                                var radiusRatio = footprint_geometry[i].roundrect_rratio
                                pad.cornerRadius(pad.width() < pad.height() ? pad.width() * radiusRatio : pad.height() * radiusRatio);
                            }
                            newKonvaNode.add(pad);
                        }
                        break;
                    case "NP_THT":
                        var drillHole = new Konva.Rect({
                            x: (stage.width() / 2) + (footprint_geometry[i].position.x * mm2px_scale - footprint_geometry[i].drill.x / 2 * mm2px_scale),
                            y: (stage.height() / 2) + (footprint_geometry[i].position.y * mm2px_scale - footprint_geometry[i].drill.y / 2 * mm2px_scale),
                            width: footprint_geometry[i].drill.x * mm2px_scale,
                            height: footprint_geometry[i].drill.y * mm2px_scale,
                            stroke: fp_NP_THT_Color,
                            fill: fp_NP_THT_Color,
                            //strokeWidth: fp_strokeWidth
                        });
                        drillHole.cornerRadius((drillHole.width() < drillHole.height() ? drillHole.width() : drillHole.height()) / 2);
                        newKonvaNode.add(drillHole);
                        break;
                    default:
                        console.log("ERROR: Undefined Pad Shape Type: " + footprint_geometry[i].padType)
                }
                let pin_string = footprint_geometry[i].number;
                if (footprint_geometry[i].name != '') {
                    pin_string += ' (' + footprint_geometry[i].name + ')';
                }
                // NP_THT doesnt have any text, and if it isnt checked for strlen = 0,
                // then the x coord of the Konva.Text will be -inf, which in turn makes
                // getClientRect() return NaN, and therefor scale the whole stage into the abyss ^^
                if (pin_string.length != 0) {
                    if (newKonvaNode.getClientRect().width >= newKonvaNode.getClientRect().height) {
                        if (pin_string.length == 1) {
                            var pin_fontSize = newKonvaNode.getClientRect().width / (2 * pin_string.length);
                        }
                        else {
                            var pin_fontSize = newKonvaNode.getClientRect().width / (0.7 * pin_string.length);
                        }
                        var pinText = new Konva.Text({
                            x: newKonvaNode.getClientRect().x,
                            y: newKonvaNode.getClientRect().y + (newKonvaNode.getClientRect().height - pin_fontSize) / 2,
                            width: newKonvaNode.getClientRect().width,
                            align: 'center',
                            fill: fp_pinTextColor,
                            text: pin_string,
                            fontSize: pin_fontSize,
                        });
                    }
                    else {
                        if (pin_string.length == 1) {
                            var pin_fontSize = newKonvaNode.getClientRect().height / (2 * pin_string.length);
                        }
                        else {
                            var pin_fontSize = newKonvaNode.getClientRect().height / (0.7 * pin_string.length);
                        }
                        var pinText = new Konva.Text({
                            x: newKonvaNode.getClientRect().x + (newKonvaNode.getClientRect().width - pin_fontSize) / 2,
                            y: newKonvaNode.getClientRect().y + newKonvaNode.getClientRect().height,
                            width: newKonvaNode.getClientRect().height,
                            align: 'center',
                            text: pin_string,
                            fontSize: pin_fontSize,
                            rotation: -90
                        });
                    }
                    newKonvaNode.add(pinText);
                }
                break;
            default:
                console.log("ERROR: Undefined Footprint Shape Type: " + footprint_geometry[i].type)
        }
        if (footprint_geometry[i].type != 'FP_Pad') {
            newKonvaNode.stroke(fp_strokeColor_default);
            newKonvaNode.strokeWidth(fp_strokeWidth);
            if (footprint_geometry[i].layer.split(".").length > 1) {
                if (footprint_geometry[i].layer.split(".")[1] == "SilkS") {
                    newKonvaNode.stroke(fp_strokeColor_SilkS);
                    if (footprint_geometry[i].fill_type == "solid") {
                        newKonvaNode.fill(fp_strokeColor_SilkS);
                        if (newKonvaNode.getClassName() === 'Line') {
                            newKonvaNode.closed(true);
                        }
                    }
                }
                if (footprint_geometry[i].layer.split(".")[1] == "Fab") {
                    newKonvaNode.stroke(fp_strokeColor_Fab);
                    if (footprint_geometry[i].fill_type == "solid") {
                        newKonvaNode.fill(fp_strokeColor_Fab);
                        if (newKonvaNode.getClassName() === 'Line') {
                            newKonvaNode.closed(true);
                        }
                    }
                }
                if (footprint_geometry[i].layer.split(".")[1] == "CrtYd") {
                    newKonvaNode.stroke(fp_strokeColor_CrtYd);
                    if (footprint_geometry[i].fill_type == "solid") {
                        newKonvaNode.fill(fp_strokeColor_CrtYd);
                        if (newKonvaNode.getClassName() === 'Line') {
                            newKonvaNode.closed(true);
                        }
                    }
                }
            }
        }
        layer.add(newKonvaNode);
    }
}

function buildSnapGrid(snapPoints, cellSize) {
    const grid = {};

    snapPoints.forEach(p => {
        const cellX = Math.floor(p.x / cellSize);
        const cellY = Math.floor(p.y / cellSize);
        const key = `${cellX},${cellY}`;

        if (!grid[key]) grid[key] = [];
        grid[key].push(p);
    });

    return grid;
}

function findSnapPoint(cursorPos, grid, cellSize, threshold) {
    const cellX = Math.floor(cursorPos.x / cellSize);
    const cellY = Math.floor(cursorPos.y / cellSize);

    let nearest = null;
    let nearestDist = Infinity;

    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            const key = `${cellX + dx},${cellY + dy}`;
            const cell = grid[key];
            if (!cell) continue;

            cell.forEach(p => {
                const ddx = p.x - cursorPos.x;
                const ddy = p.y - cursorPos.y;
                const dist = Math.sqrt(ddx * ddx + ddy * ddy);
                if (dist < threshold && dist < nearestDist) {
                    nearest = p;
                    nearestDist = dist;
                }
            });
        }
    }

    return nearest;
}

function calcSnapPoints(layer) {
    var snapPoints = [];
    for (node of layer.getChildren()) {
        switch (node.getClassName()) {
            case 'Line':
                for (let i = 0; i < node.points().length; i += 2) {
                    snapPoints.push({
                        x: node.points()[i],
                        y: node.points()[i + 1]
                    });
                }
                break;
            case 'Rect':
                snapPoints.push({
                    x: node.x(),
                    y: node.y()
                });
                snapPoints.push({
                    x: node.x() + node.width(),
                    y: node.y()
                });
                snapPoints.push({
                    x: node.x(),
                    y: node.y() + node.height()
                });
                snapPoints.push({
                    x: node.x() + node.width(),
                    y: node.y() + node.height()
                });
                snapPoints.push({
                    x: node.x() + node.width() / 2,
                    y: node.y() + node.height() / 2
                });
                snapPoints.push({
                    x: node.x() + node.width() / 2,
                    y: node.y()
                });
                snapPoints.push({
                    x: node.x(),
                    y: node.y() + node.height() / 2
                });
                snapPoints.push({
                    x: node.x() + node.width() / 2,
                    y: node.y() + node.height()
                });
                snapPoints.push({
                    x: node.x() + node.width(),
                    y: node.y() + node.height() / 2
                });
                break;
            case 'Circle':
                snapPoints.push({
                    x: node.x(),
                    y: node.y()
                });
                snapPoints.push({
                    x: node.x() + node.radius(),
                    y: node.y()
                });
                snapPoints.push({
                    x: node.x() - node.radius(),
                    y: node.y()
                });
                snapPoints.push({
                    x: node.x(),
                    y: node.y() + node.radius()
                });
                snapPoints.push({
                    x: node.x(),
                    y: node.y() - node.radius()
                });
                break;
            case 'Group':
                snapPoints = snapPoints.concat(calcSnapPoints(node));
                break;
            case 'Text':
                // Just adding this so default doesnt log an error!
                break;
            default:
                console.log('Error: Unknown Konva Class Type at calcSnapPoints(): ' + node.getClassName());
                break;
        }
    }
    return snapPoints;
}

function scaleStage_init(stage) {
    var bounding_box = stage.getClientRect({ skipTransform: true });
    var scaleX = stage.width() / bounding_box.width;
    var scaleY = stage.height() / bounding_box.height;

    // scale stage to fit whole drawing in it
    stage.scaleX(scaleX < scaleY ? scaleX : scaleY);
    stage.scaleY(scaleX < scaleY ? scaleX : scaleY);

    // reposition stage so that drawing is centered
    stage.position({
        x: Math.abs(bounding_box.x * stage.scaleX()) + ((stage.width() - (bounding_box.width * stage.scaleX())) / 2),
        y: Math.abs(bounding_box.y * stage.scaleY()) + ((stage.height() - (bounding_box.height * stage.scaleY())) / 2),
    });

}

for (var i = 0; i < components.length; ++i) {
    var component_unique_id = components[i].lib_id + "_" + components[i].val + "_" + components[i].footprint;

    // Create Component Div
    var component_div = document.createElement("div");
    component_div.setAttribute("class", "component");
    component_div.id = component_unique_id + "_div";
    document.getElementById("components").appendChild(component_div);

    // Create Component Title            
    var component_title = document.createElement("p");
    component_title.setAttribute("class", "component_title");
    component_title.innerHTML = components[i].lib_id + " : " + components[i].val
    document.getElementById(component_div.id).appendChild(component_title);

    // Create Symbol Canvas
    const canvas_sym_div = document.createElement("div");
    canvas_sym_div.setAttribute("class", "component_canvas_sym");
    canvas_sym_div.id = component_unique_id + "_canvas_sym_div";
    document.getElementById(component_div.id).appendChild(canvas_sym_div);

    const sym_stage = new Konva.Stage({
        container: canvas_sym_div,
        width: canvas_sym_div.clientWidth,
        height: canvas_sym_div.clientHeight
    });

    const sym_layer = new Konva.Layer();
    sym_stage.add(sym_layer);
    drawSymbol(sym_stage, sym_layer, components[i].symbol_geometry);

    scaleStage_init(sym_stage);

    sym_stage.on('wheel', (e) => {
        // stop default scrolling
        e.evt.preventDefault();
        const oldScale = sym_stage.scaleX();
        const pointer = sym_stage.getPointerPosition();
        const mousePointTo = {
            x: (pointer.x - sym_stage.x()) / oldScale,
            y: (pointer.y - sym_stage.y()) / oldScale,
        };
        // how to scale? Zoom in? Or zoom out?
        let direction = e.evt.deltaY > 0 ? 1 : -1;
        // when we zoom on trackpad, e.evt.ctrlKey is true
        // in that case lets revert direction
        if (e.evt.ctrlKey) {
            direction = -direction;
        }
        const newScale = direction > 0 ? oldScale * KonvaScaleBy : oldScale / KonvaScaleBy;
        sym_stage.scale({ x: newScale, y: newScale });
        const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        };
        sym_stage.position(newPos);
    });

    var isMouseClick = false;

    sym_stage.on('mousedown', (e) => {
        if (!isMouseClick) {
            isMouseClick = true;
        }
    });
    sym_stage.on('mouseup', (e) => {
        if (isMouseClick) {
            isMouseClick = false;
            e.target.getStage().container().style.cursor = 'default';
        }
    });
    sym_stage.on('mouseleave', (e) => {
        if (isMouseClick) {
            isMouseClick = false;
            e.target.getStage().container().style.cursor = 'default';
        }
    });

    sym_stage.on('mousemove', (e) => {
        if (isMouseClick) {
            e.target.getStage().container().style.cursor = 'move'
            sym_stage.position({
                x: sym_stage.position().x + e.evt.movementX,
                y: sym_stage.position().y + e.evt.movementY
            });
        }
    });


    // Create Footprint Canvas
    const canvas_fp_div = document.createElement("div");
    canvas_fp_div.setAttribute("class", "component_canvas_fp");
    canvas_fp_div.id = component_unique_id + "_canvas_fp_div";
    document.getElementById(component_div.id).appendChild(canvas_fp_div);

    const fp_stage = new Konva.Stage({
        container: canvas_fp_div,
        width: canvas_fp_div.clientWidth,
        height: canvas_fp_div.clientHeight
    });

    const fp_layer = new Konva.Layer();
    fp_stage.add(fp_layer);
    drawFootprint(fp_stage, fp_layer, components[i].footprint_geometry);
    const snapPoints = calcSnapPoints(fp_layer);
    const snapGrid = buildSnapGrid(snapPoints, snapPoints_cellSize);
    scaleStage_init(fp_stage);

    fp_stage.on('wheel', (e) => {
        // stop default scrolling
        e.evt.preventDefault();
        const oldScale = fp_stage.scaleX();
        const pointer = fp_stage.getPointerPosition();
        const mousePointTo = {
            x: (pointer.x - fp_stage.x()) / oldScale,
            y: (pointer.y - fp_stage.y()) / oldScale,
        };
        // how to scale? Zoom in? Or zoom out?
        let direction = e.evt.deltaY > 0 ? 1 : -1;
        // when we zoom on trackpad, e.evt.ctrlKey is true
        // in that case lets revert direction
        if (e.evt.ctrlKey) {
            direction = -direction;
        }
        const newScale = direction > 0 ? oldScale * KonvaScaleBy : oldScale / KonvaScaleBy;
        fp_stage.scale({ x: newScale, y: newScale });
        const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        };
        fp_stage.position(newPos);
    });

    var isMouseClick = false;
    var isMeasurement = false;
    var measPointerStart;

    fp_stage.on('mousedown', (e) => {
        if (!isMouseClick) {
            isMouseClick = true;
        }
    });

    fp_stage.on('mouseup', (e) => {
        if (isMouseClick) {
            isMouseClick = false;
            e.target.getStage().container().style.cursor = 'default';
        }
    });

    fp_stage.on('mouseleave', (e) => {
        if (isMouseClick) {
            isMouseClick = false;
            e.target.getStage().container().style.cursor = 'default';
        }

        if (isMeasurement) {
            isMeasurement = false;
            e.target.getStage().container().style.cursor = 'default';
            var measurement_line = fp_layer.find('#' + measurement_line_id);
            measurement_line[0].destroy();
            var measurement_value = fp_layer.find('#' + measurement_value_id);
            measurement_value[0].destroy();
        }
    });

    fp_stage.on('mousemove', (e) => {
        if (isMouseClick) {
            e.target.getStage().container().style.cursor = 'move';
            fp_stage.position({
                x: fp_stage.position().x + e.evt.movementX,
                y: fp_stage.position().y + e.evt.movementY
            });
        }
        if (isMeasurement) {
            e.target.getStage().container().style.cursor = 'crosshair';

            var currentPos = fp_stage.getRelativePointerPosition()

            // snap to a snap point if some point is in proximity
            nearestSnapPoint = findSnapPoint(currentPos, snapGrid, snapPoints_cellSize, snapPoints_proximityThreshold);
            if (nearestSnapPoint != null) {
                currentPos = nearestSnapPoint;
            }
            var measurementX = (currentPos.x - measPointerStart.x);
            var measurementY = (currentPos.y - measPointerStart.y);
            var measurement = Math.sqrt((measurementX * measurementX) + (measurementY * measurementY)) / mm2px_scale;
            var measurement_line = fp_layer.find('#' + measurement_line_id);
            measurement_line[0].attrs.points[2] = currentPos.x;
            measurement_line[0].attrs.points[3] = currentPos.y;
            measurement_line[0].strokeWidth(measurement * mm2px_scale / 50);
            var measurement_value = fp_layer.find('#' + measurement_value_id);
            measurement_value[0].width(measurement * mm2px_scale);
            measurement_value[0].fontSize(measurement_value[0].width() / 3);
            measurement_value[0].text(measurement.toFixed(3));
            measurement_value[0].rotation(Math.atan2(measurementY, measurementX) * (180 / Math.PI));
            fp_layer.batchDraw();
        }
    });

    fp_stage.on('dblclick', (e) => {
        if (isMeasurement) {
            e.target.getStage().container().style.cursor = 'default';
            isMeasurement = false;
            var measurement_line = fp_layer.find('#' + measurement_line_id);
            measurement_line[0].destroy();
            var measurement_value = fp_layer.find('#' + measurement_value_id);
            measurement_value[0].destroy();
        } else {
            e.target.getStage().container().style.cursor = 'crosshair';
            isMeasurement = !isMeasurement;
            measPointerStart = fp_stage.getRelativePointerPosition();

            // snap to a snap point if some point is in proximity
            nearestSnapPoint = findSnapPoint(measPointerStart, snapGrid, snapPoints_cellSize, snapPoints_proximityThreshold);
            if (nearestSnapPoint != null) {
                measPointerStart = nearestSnapPoint;
            }

            var measurement_line = new Konva.Line({
                points: [
                    measPointerStart.x,
                    measPointerStart.y,
                    measPointerStart.x,
                    measPointerStart.y
                ],
                stroke: measurement_line_strokeColor,
                strokeWidth: 0,
                id: measurement_line_id
            });
            fp_layer.add(measurement_line);
            var measurement_value = new Konva.Text({
                x: measPointerStart.x,
                y: measPointerStart.y,
                text: '0',
                width: 0,
                height: 0,
                fontSize: 0,
                fill: measurement_line_strokeColor,
                align: 'center',
                id: measurement_value_id
            });
            fp_layer.add(measurement_value);
        }
    });


    // Create Symbol Image 
    var image_sym_div = document.createElement("div");
    image_sym_div.setAttribute("class", "component_image");
    image_sym_div.id = component_unique_id + "_image_sym_div";
    document.getElementById(component_div.id).appendChild(image_sym_div);

    var newImage = document.createElement('img');
    newImage.src = components[i].ds_image_sym;
    newImage.alt = "img could not be loaded!";
    newImage.style = "width:100%; height:auto; object-fit:contain;"

    document.getElementById(image_sym_div.id).appendChild(newImage);

    
    // Create Footprint Image 
    var image_fp_div = document.createElement("div");
    image_fp_div.setAttribute("class", "component_image");
    image_fp_div.id = component_unique_id + "_image_fp_div";
    document.getElementById(component_div.id).appendChild(image_fp_div);

    var newImage = document.createElement('img');
    newImage.src = components[i].ds_image_fp;
    newImage.alt = "img could not be loaded!";
    newImage.style = "width:100%; height:auto; object-fit:contain;"
    document.getElementById(image_fp_div.id).appendChild(newImage);


    // Add Linebreak and Spacer
    var linebreak = document.createElement("br");
    document.getElementById("components").appendChild(linebreak);


    var spacer = document.createElement("div");
    spacer.setAttribute("class", "spacer");
    document.getElementById("components").appendChild(spacer);
}