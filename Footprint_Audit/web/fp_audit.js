const KonvaScaleBy = 1.1;
const stdFontSize = 12;

const sym_fill_background_color = 'lightyellow';
const sym_fill_outline_color = 'brown';
const sym_strokeWidth = 0.1;
const sym_pinNameColor = '#9A4499';
const sym_pinNumColor = 'black'


var fp_bgColor = '#778899';
const fp_strokeWidth = 0.02;
const fp_strokeColor_default = 'yellow';
const fp_strokeColor_SilkS = 'white';
const fp_strokeColor_Fab = 'darkgrey';
const fp_strokeColor_CrtYd = 'violet';
const fp_pinTextColor = 'black';
const fp_SMDpadColor = 'red';
const fp_THTcontactColor = 'gold';
const fp_NP_THT_Color = 'blue';

const measurementLine_strokeColor = 'white';
const measurementLine_ID = 'MeasurementLine';
const measurementValue_ID = 'MeasurementValue';

const measurementLine_axis_strokeColor = 'lightgrey';
const measurementLine_axisX_ID = 'MeasurementLineX';
const measurementValue_axisX_ID = 'MeasurementValueX';
const measurementLine_axisY_ID = 'MeasurementLineY';
const measurementValue_axisY_ID = 'MeasurementValueY';

const snapPoints_cellSize = 0.075;
const snapPoints_proximityThreshold = 0.075;

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

function drawSymbol(stage, symbol_geometry) {
    const sym_layer = new Konva.Layer();
    sym_layer.name('content_Sym');

    stage.add(sym_layer);

    for (geometry of symbol_geometry) {
        var newKonvaNode;
        switch (geometry.type) {
            case "SymbolRectangle":
                newKonvaNode = new Konva.Rect({
                    x: (stage.width() / 2) + geometry.start.x,
                    y: (stage.height() / 2) - geometry.start.y,
                    width: ((stage.width() / 2) + geometry.end.x) - ((stage.width() / 2) + geometry.start.x),
                    height: ((stage.height() / 2) - geometry.end.y) - ((stage.height() / 2) - geometry.start.y),
                });
                break;
            case "SymbolPolyline":
                var points = []
                for (var j = 0; j < geometry.points.length; ++j) {
                    points.push((stage.width() / 2) + geometry.points[j].x);
                    points.push((stage.height() / 2) - geometry.points[j].y);
                }
                newKonvaNode = new Konva.Line({
                    points: points,
                    fillAfterStrokeEnabled: true
                });
                break;
            case "SymbolCircle":
                newKonvaNode = new Konva.Circle({
                    x: (stage.width() / 2) + geometry.center.x,
                    y: (stage.height() / 2) - geometry.center.y,
                    radius: geometry.radius,
                });
                break;
            case "SymbolArc":
                var konvaParams = arcToKonvaProps(geometry.start, geometry.mid, geometry.end, thickness = 0);
                newKonvaNode = new Konva.Arc({
                    x: (stage.width() / 2) + konvaParams.x,
                    y: (stage.height() / 2) - konvaParams.y,
                    rotation: konvaParams.rotation,
                    innerRadius: konvaParams.innerRadius,
                    outerRadius: konvaParams.outerRadius,
                    angle: konvaParams.angle,
                    clockwise: true,
                });
                break;
            case "SymbolPin":
                var points = [
                    (stage.width() / 2) + geometry.position.x,
                    (stage.height() / 2) - geometry.position.y
                ];
                newKonvaNode = new Konva.Line({
                    fillAfterStrokeEnabled: true,
                });
                var pinNum = new Konva.Text({
                    //width: geometry.length,
                    //height: geometry.length / 2.5,
                    fontSize: stdFontSize,
                    text: geometry.number,
                    align: 'center',
                    fill: sym_pinNumColor,
                });
                pinNum.scale({ x: geometry.length / pinNum.width() / 3, y: geometry.length / pinNum.width() / 3 });
                var pinName = new Konva.Text({
                    //width: geometry.name.length * geometry.length / 3,
                    //height: pinNum.height(),
                    fontSize: stdFontSize,
                    text: ' ' + geometry.name + ' ',
                    align: 'center',
                    fill: sym_pinNameColor,
                });
                pinName.scale({ x: geometry.length / pinName.width(), y: geometry.length / pinName.width() });
                switch (geometry.rotation) {
                    case 0: // left
                        points.push(points[0] + geometry.length);
                        points.push(points[1]);
                        pinNum.x(stage.width() / 2 + geometry.position.x + pinNum.getClientRect().width);
                        pinNum.y(stage.height() / 2 - geometry.position.y - pinNum.getClientRect().height);
                        pinName.x(stage.width() / 2 + geometry.position.x - pinName.getClientRect().width);
                        pinName.y(stage.height() / 2 - geometry.position.y - pinName.getClientRect().height / 2);
                        break;
                    case 90: // down 
                        points.push(points[0]);
                        points.push(points[1] - geometry.length);
                        pinNum.x((stage.width() / 2) + geometry.position.x - pinNum.getClientRect().height);
                        pinNum.y((stage.height() / 2) - geometry.position.y - pinNum.getClientRect().width);
                        pinNum.rotation(270);
                        pinName.x(stage.width() / 2 + geometry.position.x - pinName.getClientRect().height / 2);
                        pinName.y(stage.height() / 2 - geometry.position.y + pinName.getClientRect().width);
                        pinName.rotation(270);
                        break;
                    case 180: // right
                        points.push(points[0] - geometry.length);
                        points.push(points[1]);
                        pinNum.x((stage.width() / 2) + geometry.position.x - geometry.length + pinNum.getClientRect().width);
                        pinNum.y((stage.height() / 2) - geometry.position.y );
                        pinName.x(stage.width() / 2 + geometry.position.x);
                        pinName.y(stage.height() / 2 - geometry.position.y - pinName.getClientRect().height / 2);
                        break;
                    case 270: // up
                        points.push(points[0]);
                        points.push(points[1] + geometry.length);
                        pinNum.x((stage.width() / 2) + geometry.position.x);
                        pinNum.y((stage.height() / 2) - geometry.position.y + pinNum.getClientRect().height);
                        pinNum.rotation(270);
                        pinName.x(stage.width() / 2 + geometry.position.x - pinName.getClientRect().height / 2);
                        pinName.y(stage.height() / 2 - geometry.position.y);
                        pinName.rotation(270);
                        break;
                }
                newKonvaNode.points(points);
                sym_layer.add(pinNum);
                sym_layer.add(pinName);
                break;
            default:
                console.log("ERROR: Undefined Symbol Shape Type: " + geometry.type)
        }
        newKonvaNode.stroke(sym_fill_outline_color);
        newKonvaNode.strokeWidth(sym_strokeWidth);
        if (geometry.fill_type == "background") {
            newKonvaNode.fill(sym_fill_background_color);
        }
        if (geometry.fill_type == "outline") {
            newKonvaNode.fill(sym_fill_outline_color);
        }
        sym_layer.add(newKonvaNode);
    }
}

function drawFootprint(stage, footprint_geometry) {
    const pad_layer = new Konva.Layer();
    pad_layer.name('content_Pad');
    const silkS_layer = new Konva.Layer();
    silkS_layer.name('content_SilkS');
    const crtYd_layer = new Konva.Layer();
    crtYd_layer.name('content_CrtYd');
    const fab_layer = new Konva.Layer();
    fab_layer.name('content_Fab');

    // order in array is important for which layer gets printed over the other
    // from top to back: pad, silkS, crtYd, fab
    const layers = [fab_layer, crtYd_layer, silkS_layer, pad_layer];

    layers.forEach(e => stage.add(e));

    for (geometry of footprint_geometry) {
        var newKonvaNode;
        switch (geometry.type) {
            case "FP_Rectangle":
                newKonvaNode = new Konva.Rect({
                    x: (stage.width() / 2) + geometry.start.x,
                    y: (stage.height() / 2) + geometry.start.y,
                    width: ((stage.width() / 2) + geometry.end.x) - ((stage.width() / 2) + geometry.start.x),
                    height: ((stage.height() / 2) + geometry.end.y) - ((stage.height() / 2) + geometry.start.y),
                });
                break;
            case "FP_Polyline":
                var points = []
                for (var j = 0; j < geometry.points.length; ++j) {
                    points.push((stage.width() / 2) + geometry.points[j].x);
                    points.push((stage.height() / 2) + geometry.points[j].y);
                }
                newKonvaNode = new Konva.Line({
                    points: points,
                    fillAfterStrokeEnabled: true,
                });
                break;
            case "FP_Circle":
                newKonvaNode = new Konva.Circle({
                    x: (stage.width() / 2) + geometry.center.x,
                    y: (stage.height() / 2) + geometry.center.y,
                    radius: geometry.radius,
                });
                break;
            case "FP_Arc":
                var konvaParams = arcToKonvaProps(geometry.start, geometry.mid, geometry.end, thickness = 0);
                newKonvaNode = new Konva.Arc({
                    x: (stage.width() / 2) + konvaParams.x,
                    y: (stage.height() / 2) + konvaParams.y,
                    rotation: konvaParams.rotation,
                    innerRadius: konvaParams.innerRadius,
                    outerRadius: konvaParams.outerRadius,
                    angle: konvaParams.angle,
                    clockwise: true,
                });
                break;
            case "FP_Pad":
                var newKonvaNode = new Konva.Group();
                pad_layer.add(newKonvaNode);
                
                switch (geometry.padType) {
                    case "THT":
                        if (geometry.padGeometry == "PadRect"
                            || geometry.padGeometry == "PadRoundRect"
                            || geometry.padGeometry == "PadOval") {
                            var pad = new Konva.Rect({
                                x: (stage.width() / 2) + (geometry.position.x - geometry.size.x / 2),
                                y: (stage.height() / 2) + (geometry.position.y - geometry.size.y / 2),
                                width: geometry.size.x,
                                height: geometry.size.y,
                                fill: fp_THTcontactColor,
                            });
                            if (geometry.padGeometry == "PadRoundRect") {
                                var radiusRatio = geometry.roundrect_rratio
                                pad.cornerRadius(pad.width() < pad.height() ? pad.width() * radiusRatio : pad.height() * radiusRatio);
                            }
                            if (geometry.padGeometry == "PadOval") {
                                pad.cornerRadius((pad.width() < pad.height() ? pad.width() : pad.height()) / 2);
                            }
                        }
                        if (geometry.padGeometry == "PadCircle") {
                            var pad = new Konva.Circle({
                                x: (stage.width() / 2) + geometry.position.x,
                                y: (stage.height() / 2) + geometry.position.y,
                                radius: geometry.size.x / 2,
                                fill: fp_THTcontactColor,
                            });
                        }
                        newKonvaNode.add(pad);
                        var drillHole = new Konva.Rect({
                            x: (stage.width() / 2) + (geometry.position.x - geometry.drill.x / 2),
                            y: (stage.height() / 2) + (geometry.position.y - geometry.drill.y / 2),
                            width: geometry.drill.x,
                            height: geometry.drill.y,
                            fill: fp_bgColor,
                        });
                        drillHole.cornerRadius((drillHole.width() < drillHole.height() ? drillHole.width() : drillHole.height()) / 2);
                        newKonvaNode.add(drillHole);
                        break;
                    case "SMD":
                        if (geometry.padGeometry == "PadRect"
                            || geometry.padGeometry == "PadRoundRect") {
                            var pad = new Konva.Rect({
                                x: (stage.width() / 2) + (geometry.position.x - geometry.size.x / 2),
                                y: (stage.height() / 2) + (geometry.position.y - geometry.size.y / 2),
                                width: geometry.size.x,
                                height: geometry.size.y,
                                fill: fp_SMDpadColor,
                            });
                            if (geometry.padGeometry == "PadRoundRect") {
                                var radiusRatio = geometry.roundrect_rratio
                                pad.cornerRadius(pad.width() < pad.height() ? pad.width() * radiusRatio : pad.height() * radiusRatio);
                            }
                            newKonvaNode.add(pad);
                        }
                        break;
                    case "NP_THT":
                        var drillHole = new Konva.Rect({
                            x: (stage.width() / 2) + (geometry.position.x - geometry.drill.x / 2),
                            y: (stage.height() / 2) + (geometry.position.y - geometry.drill.y / 2),
                            width: geometry.drill.x,
                            height: geometry.drill.y,
                            fill: fp_NP_THT_Color,
                        });
                        drillHole.cornerRadius((drillHole.width() < drillHole.height() ? drillHole.width() : drillHole.height()) / 2);
                        newKonvaNode.add(drillHole);
                        break;
                    default:
                        console.log("ERROR: Undefined Pad Shape Type: " + geometry.padType)
                }
                let pin_string = '  ' + geometry.number + '  ';
                if (geometry.name != '') {
                    pin_string += '(' + geometry.name + ')  ';
                }
                // NP_THT doesnt have any text, and if it isnt checked for strlen = 0,
                // then the x coord of the Konva.Text will be -inf, which in turn makes
                // getClientRect() return NaN, and therefor scale the whole stage into the abyss ^^
                if (pin_string.length != 0) {
                    var pinText = new Konva.Text({
                        fontSize: stdFontSize,
                        align: 'center',
                        verticalAlign: 'middle',
                        fill: fp_pinTextColor,
                        text: pin_string,
                    })
                    if (newKonvaNode.getClientRect().width >= newKonvaNode.getClientRect().height) {
                        pinText.scaleX(newKonvaNode.getClientRect().width / pinText.width());
                        pinText.scaleY(newKonvaNode.getClientRect().width / pinText.width());
                        pinText.x(newKonvaNode.getClientRect().x);
                        pinText.y(newKonvaNode.getClientRect().y + (newKonvaNode.getClientRect().height - pinText.getClientRect().height) / 2 );
                    }
                    else {
                        pinText.scaleX(newKonvaNode.getClientRect().height / pinText.width());
                        pinText.scaleY(newKonvaNode.getClientRect().height / pinText.width());
                        pinText.x(newKonvaNode.getClientRect().x + (newKonvaNode.getClientRect().width - pinText.getClientRect().height) / 2);
                        pinText.y(newKonvaNode.getClientRect().y + newKonvaNode.getClientRect().height);
                        pinText.rotation(-90);
                    }
                    newKonvaNode.add(pinText);
                }
                break;
            default:
                console.log("ERROR: Undefined Footprint Shape Type: " + geometry.type)
        }
        if (geometry.type != 'FP_Pad') {
            newKonvaNode.stroke(fp_strokeColor_default);
            newKonvaNode.strokeWidth(fp_strokeWidth);
            if (geometry.layer.split(".").length > 1) {
                if (geometry.layer.split(".")[1] == "SilkS") {
                    silkS_layer.add(newKonvaNode);
                    newKonvaNode.stroke(fp_strokeColor_SilkS);
                    if (geometry.fill_type == "solid") {
                        newKonvaNode.fill(fp_strokeColor_SilkS);
                        if (newKonvaNode.getClassName() === 'Line') {
                            newKonvaNode.closed(true);
                        }
                    }
                }
                if (geometry.layer.split(".")[1] == "Fab") {
                    fab_layer.add(newKonvaNode);
                    newKonvaNode.stroke(fp_strokeColor_Fab);
                    if (geometry.fill_type == "solid") {
                        newKonvaNode.fill(fp_strokeColor_Fab);
                        if (newKonvaNode.getClassName() === 'Line') {
                            newKonvaNode.closed(true);
                        }
                    }
                }
                if (geometry.layer.split(".")[1] == "CrtYd") {
                    crtYd_layer.add(newKonvaNode);
                    newKonvaNode.stroke(fp_strokeColor_CrtYd);
                    if (geometry.fill_type == "solid") {
                        newKonvaNode.fill(fp_strokeColor_CrtYd);
                        if (newKonvaNode.getClassName() === 'Line') {
                            newKonvaNode.closed(true);
                        }
                    }
                }
            }
        }
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

    var bounding_box = stage.getClientRect();
    if (bounding_box.width == 0 || bounding_box.height == 0) return;
    var scaleX = stage.width() / bounding_box.width;
    var scaleY = stage.height() / bounding_box.height;
    
    const drawLayers = stage.getChildren().filter(el => el.name().includes('content'));
    const measLayer = stage.findOne('.measurement');

    // scale layers to fit whole drawing in it         
    // and reposition stage so that drawing is centered
    drawLayers.forEach(layer => {
        layer.scaleX(scaleX < scaleY ? scaleX : scaleY);
        layer.scaleY(scaleX < scaleY ? scaleX : scaleY);
        layer.position({
            x: -Math.abs(bounding_box.x * layer.scaleX()) + ((stage.width() - (bounding_box.width * layer.scaleX())) / 2),
            y: -Math.abs(bounding_box.y * layer.scaleY()) + ((stage.height() - (bounding_box.height * layer.scaleY())) / 2),
        });
    });
    
    // only fp stage has the measurement layer, sym and image stages return undefined
    if (measLayer != undefined){
        measLayer.scaleX(scaleX < scaleY ? scaleX : scaleY);
        measLayer.scaleY(scaleX < scaleY ? scaleX : scaleY);
        measLayer.position({
            x: -Math.abs(bounding_box.x * measLayer.scaleX()) + ((stage.width() - (bounding_box.width * measLayer.scaleX())) / 2),
            y: -Math.abs(bounding_box.y * measLayer.scaleY()) + ((stage.height() - (bounding_box.height * measLayer.scaleY())) / 2),
        });
    }
}

function generateCanvas(component_unique_id, component_div, component, type) {
    const canvas_div = document.createElement("div");
    canvas_div.setAttribute('class', 'component_canvas');
    canvas_div.id = component_unique_id + '_canvas_' + type + '_div';

    document.getElementById(component_div.id).appendChild(canvas_div);
    

    const stage = new Konva.Stage({
        container: canvas_div,
        width: canvas_div.offsetWidth,
        height: canvas_div.offsetWidth
    });
        
    var contentLayer = new Konva.Layer();
    
    switch(type){
        case 'sym_draw':
            drawSymbol(stage, component.symbol_geometry);
            break;
        case 'fp_draw':
            drawFootprint(stage, component.footprint_geometry);
            stage.add(new Konva.Layer({ name: 'measurement'}));
            // needs other class for dark background!
            canvas_div.setAttribute('class', 'component_canvas_fp');
            break;
        case 'sym_img':
            contentLayer.name('content');
            stage.add(contentLayer);  
            if (component.ds_image_sym == ''){
                contentLayer.add(new Konva.Text({
                    x: 0,
                    y: 0,
                    width: stage.width(),
                    height: stage.height(),
                    fontSize: 20,
                    text: 'Image could not be loaded!',
                    align: 'center',
                    verticalAlign: 'middle'
                }));
            }
            else {
                const symImgObj = new Image();
                symImgObj.onload = function () {
                    const symImg = new Konva.Image({
                        x: 0,
                        y: 0,
                        image: symImgObj,
                        width: symImgObj.width,
                        height: symImgObj.height
                    });

                    contentLayer.add(symImg);
                };
                symImgObj.src = component.ds_image_sym; 

                // Add a bounding rectangle
                contentLayer.add(new Konva.Rect({
                    x: 0,
                    y: 0,
                    width: symImgObj.width,
                    height: symImgObj.height,
                    strokeWidth: 1,
                    stroke: 'black'
                }));
            }
            break;
        case 'fp_img':
            contentLayer.name('content');
            stage.add(contentLayer);
            if (component.ds_image_fp == ''){
                contentLayer.add(new Konva.Text({
                    x: 0,
                    y: 0,
                    width: stage.width(),
                    height: stage.height(),
                    fontSize: 20,
                    text: 'Image could not be loaded!',
                    align: 'center',
                    verticalAlign: 'middle'
                }));
            }
            else {
                const fpImgObj = new Image();
                fpImgObj.onload = function () {
                    const fpImg = new Konva.Image({
                        x: 0,
                        y: 0,
                        image: fpImgObj,
                        width: fpImgObj.width,
                        height: fpImgObj.height
                    });

                    contentLayer.add(fpImg);
                };
                fpImgObj.src = component.ds_image_fp; 

                // Add a bounding rectangle
                contentLayer.add(new Konva.Rect({
                    x: 0,
                    y: 0,
                    width: fpImgObj.width,
                    height: fpImgObj.height,
                    strokeWidth: 1,
                    stroke: 'black'
                }));
            }
            break;
        default:
            console.log('Unknown type: ' + type + ' @generateCanvas()');
            break;
    }

    switch(type){
        case 'sym_draw':
            contentLayer = stage.getChildren().filter((el) => el.name().includes('content'))[0];
        case 'sym_img':
        case 'fp_img':
            var isMouseClick = false;

            stage.on('wheel', (e) => {
                if (e.evt.ctrlKey && e.evt.altKey) {
                    // stop default scrolling
                    e.evt.preventDefault();
                    const oldScale = contentLayer.scaleX();
                    const pointer = stage.getPointerPosition();
                    const mousePointTo = {
                        x: (pointer.x - contentLayer.x()) / oldScale,
                        y: (pointer.y - contentLayer.y()) / oldScale,
                    };
                    // how to scale? Zoom in? Or zoom out?
                    let direction = e.evt.deltaY > 0 ? 1 : -1;
                    // when we zoom on trackpad, e.evt.ctrlKey is true
                    // in that case lets revert direction
                    if (e.evt.ctrlKey) {
                        direction = -direction;
                    }
                    const newScale = direction > 0 ? oldScale * KonvaScaleBy : oldScale / KonvaScaleBy;
                    contentLayer.scale({ x: newScale, y: newScale });
                    const newPos = {
                        x: pointer.x - mousePointTo.x * newScale,
                        y: pointer.y - mousePointTo.y * newScale,
                    };
                    contentLayer.position(newPos);
                }
            });
        
            stage.on('mousedown', (e) => {
                if (!isMouseClick) {
                    isMouseClick = true;
                }
            });

            stage.on('mouseup', (e) => {
                if (isMouseClick) {
                    isMouseClick = false;
                    e.target.getStage().container().style.cursor = 'default';
                }
            });

            stage.on('mouseleave', (e) => {
                if (isMouseClick) {
                    isMouseClick = false;
                    e.target.getStage().container().style.cursor = 'default';
                }
            });
        
            stage.on('mousemove', (e) => {
                if (isMouseClick) {
                    e.target.getStage().container().style.cursor = 'move'
                    contentLayer.position({
                        x: contentLayer.position().x + e.evt.movementX,
                        y: contentLayer.position().y + e.evt.movementY
                    });
                }
            });

            break;
        case 'fp_draw':
            var isMouseClick = false;
            var isMeasurement = false;
            var measPointerStart;
            
            const contentLayers = stage.getChildren().filter((el) => el.name().includes('content'));
            const measLayer = stage.getChildren().filter((el) => el.name().includes('measurement'))[0];
            
            var snapPoints = [];
            contentLayers.forEach(layer => snapPoints = snapPoints.concat(calcSnapPoints(layer)));
            const snapGrid = buildSnapGrid(snapPoints, snapPoints_cellSize);
            
            stage.on('wheel', (e) => {
                if (e.evt.ctrlKey && e.evt.altKey){
                    // stop default scrolling
                    e.evt.preventDefault();
                    const oldScale = contentLayers[0].scaleX();
                    const pointer = stage.getPointerPosition();
                    const mousePointTo = {
                        x: (pointer.x - contentLayers[0].x()) / oldScale,
                        y: (pointer.y - contentLayers[0].y()) / oldScale,
                    };
                    // how to scale? Zoom in? Or zoom out?
                    let direction = e.evt.deltaY > 0 ? 1 : -1;
                    // when we zoom on trackpad, e.evt.ctrlKey is true
                    // in that case lets revert direction
                    if (e.evt.ctrlKey) {
                        direction = -direction;
                    }
                    const newScale = direction > 0 ? oldScale * KonvaScaleBy : oldScale / KonvaScaleBy;
                    contentLayers.forEach(layer => layer.scale({ x: newScale, y: newScale }));
                    const newPos = {
                        x: pointer.x - mousePointTo.x * newScale,
                        y: pointer.y - mousePointTo.y * newScale,
                    };
                    contentLayers.forEach(layer => {
                        layer.position(newPos);
                        layer.scale({ x: newScale, y: newScale });
                    });
                    measLayer.position(newPos);
                    measLayer.scale({ x: newScale, y: newScale });
                }
            });

            stage.on('mousedown', (e) => {
                if (!isMouseClick) {
                    isMouseClick = true;
                }
            });
        
            stage.on('mouseup', (e) => {
                if (isMouseClick) {
                    isMouseClick = false;
                    e.target.getStage().container().style.cursor = 'default';
                }
            });
        
            stage.on('mouseleave', (e) => {
                if (isMouseClick) {
                    isMouseClick = false;
                    e.target.getStage().container().style.cursor = 'default';
                }
            
                if (isMeasurement) {
                    e.target.getStage().container().style.cursor = 'default';
                    isMeasurement = false;
                    measLayer.findOne('#' + measurementLine_ID).destroy();
                    measLayer.findOne('#' + measurementValue_ID).destroy();
                    measLayer.findOne('#' + measurementLine_axisX_ID).destroy();
                    measLayer.findOne('#' + measurementValue_axisX_ID).destroy();
                    measLayer.findOne('#' + measurementLine_axisY_ID).destroy();
                    measLayer.findOne('#' + measurementValue_axisY_ID).destroy();
                }
            });
        
            stage.on('mousemove', (e) => {
                if (isMouseClick) {
                    e.target.getStage().container().style.cursor = 'move';
                    contentLayers.forEach(layer => {
                        layer.position({
                            x: layer.position().x + e.evt.movementX,
                            y: layer.position().y + e.evt.movementY
                        });
                    });
                    measLayer.position({
                        x: measLayer.position().x + e.evt.movementX,
                        y: measLayer.position().y + e.evt.movementY
                    });
                }
                if (isMeasurement) {
                    e.target.getStage().container().style.cursor = 'crosshair';
                
                    let currentPos = measLayer.getRelativePointerPosition()
                
                    // snap to a snap point if some point is in proximity
                    nearestSnapPoint = findSnapPoint(currentPos, snapGrid, snapPoints_cellSize, snapPoints_proximityThreshold);
                    if (nearestSnapPoint != null) {
                        currentPos = nearestSnapPoint;
                    }
                    let measurementX = (currentPos.x - measPointerStart.x);
                    let measurementY = (currentPos.y - measPointerStart.y);
                    let measurement = Math.sqrt((measurementX * measurementX) + (measurementY * measurementY));


                    let measurementLine = measLayer.findOne('#' + measurementLine_ID);
                    measurementLine.attrs.points[2] = currentPos.x;
                    measurementLine.attrs.points[3] = currentPos.y;
                    measurementLine.strokeWidth(Math.abs(measurement / 100));

                    let measurementAngle = Math.atan2(measurementY, measurementX);
                    
                    let measurementValue = measLayer.findOne('#' + measurementValue_ID);
                    measurementValue.text(measurement.toFixed(3));
                    measurementValue.x(measPointerStart.x + Math.cos(measurementAngle) * (measurement / 4));
                    measurementValue.y(measPointerStart.y + Math.sin(measurementAngle) * (measurement / 4));
                    measurementValue.scale({ x: measurement / measurementValue.width() / 2, y: measurement / measurementValue.width() / 2 });
                    measurementValue.rotation(measurementAngle * (180 / Math.PI));


                    let measurementLine_axisX = measLayer.findOne('#' + measurementLine_axisX_ID);
                    measurementLine_axisX.attrs.points[2] = currentPos.x;
                    measurementLine_axisX.strokeWidth(Math.abs(measurementX / 200));

                    let measurementValue_axisX = measLayer.findOne('#' + measurementValue_axisX_ID);
                    measurementValue_axisX.text(Math.abs(measurementX).toFixed(3));
                    if (measurementX > 0){
                        measurementValue_axisX.x(measPointerStart.x + Math.cos(measurementAngle) * (measurement / 4));
                    }
                    else {
                        measurementValue_axisX.x(currentPos.x - Math.cos(measurementAngle) * (measurement / 4));
                    }
                    measurementValue_axisX.scale({ x: Math.abs(measurementX) / measurementValue_axisX.width() / 2, y: Math.abs(measurementX)  / measurementValue_axisX.width() / 2 });


                    let measurementLine_axisY = measLayer.findOne('#' + measurementLine_axisY_ID);
                    measurementLine_axisY.attrs.points[0] = currentPos.x;
                    measurementLine_axisY.attrs.points[2] = currentPos.x;
                    measurementLine_axisY.attrs.points[3] = currentPos.y;
                    measurementLine_axisY.strokeWidth(Math.abs(measurementY / 200));

                    let measurementValue_axisY = measLayer.findOne('#' + measurementValue_axisY_ID);
                    measurementValue_axisY.text(Math.abs(measurementY).toFixed(3));
                    measurementValue_axisY.x(currentPos.x);
                    measurementValue_axisY.y(measPointerStart.y + Math.sin(measurementAngle) * (measurement / 4));
                    measurementValue_axisY.scale({ x: measurementY / measurementValue_axisY.width() / 2, y: measurementY / measurementValue_axisY.width() / 2 });
                    measurementValue_axisY.rotation(90);
                    
                    measLayer.batchDraw();
                }
            });
        
            stage.on('dblclick', (e) => {
                if (isMeasurement) {
                    e.target.getStage().container().style.cursor = 'default';
                    isMeasurement = false;
                    measLayer.findOne('#' + measurementLine_ID).destroy();
                    measLayer.findOne('#' + measurementValue_ID).destroy();
                    measLayer.findOne('#' + measurementLine_axisX_ID).destroy();
                    measLayer.findOne('#' + measurementValue_axisX_ID).destroy();
                    measLayer.findOne('#' + measurementLine_axisY_ID).destroy();
                    measLayer.findOne('#' + measurementValue_axisY_ID).destroy();
                } else {
                    e.target.getStage().container().style.cursor = 'crosshair';

                    isMeasurement = !isMeasurement;
                    measPointerStart = measLayer.getRelativePointerPosition();
                
                    // snap to a snap point if some point is in proximity
                    nearestSnapPoint = findSnapPoint(measPointerStart, snapGrid, snapPoints_cellSize, snapPoints_proximityThreshold);
                    if (nearestSnapPoint != null) {
                        measPointerStart = nearestSnapPoint;
                    }
                
                    measLayer.add(new Konva.Line({
                        points: [
                            measPointerStart.x,
                            measPointerStart.y,
                            measPointerStart.x,
                            measPointerStart.y
                        ],
                        stroke: measurementLine_axis_strokeColor,
                        strokeWidth: 0,
                        id: measurementLine_axisX_ID
                    }));
                    measLayer.add(new Konva.Text({
                        x: measPointerStart.x,
                        y: measPointerStart.y,
                        text: '0.000',
                        //width: 40,
                        fontSize: stdFontSize,
                        fill: measurementLine_axis_strokeColor,
                        align: 'center',
                        verticalAlign: 'middle',
                        scaleX: 0,
                        scaleY: 0,
                        id: measurementValue_axisX_ID
                    }));

                    measLayer.add(new Konva.Line({
                        points: [
                            measPointerStart.x,
                            measPointerStart.y,
                            measPointerStart.x,
                            measPointerStart.y
                        ],
                        stroke: measurementLine_axis_strokeColor,
                        strokeWidth: 0,
                        id: measurementLine_axisY_ID
                    }));
                    measLayer.add(new Konva.Text({
                        x: measPointerStart.x,
                        y: measPointerStart.y,
                        text: '0.000',
                        //width: 40,
                        fontSize: stdFontSize,
                        fill: measurementLine_axis_strokeColor,
                        align: 'center',
                        verticalAlign: 'middle',
                        scaleX: 0,
                        scaleY: 0,
                        id: measurementValue_axisY_ID
                    }));
                    
                    measLayer.add(new Konva.Line({
                        points: [
                            measPointerStart.x,
                            measPointerStart.y,
                            measPointerStart.x,
                            measPointerStart.y
                        ],
                        stroke: measurementLine_strokeColor,
                        strokeWidth: 0,
                        id: measurementLine_ID
                    }));
                    measLayer.add(new Konva.Text({
                        x: measPointerStart.x,
                        y: measPointerStart.y,
                        text: '0.000',
                        //width: 40,
                        fontSize: stdFontSize,
                        fill: measurementLine_strokeColor,
                        align: 'center',
                        verticalAlign: 'middle',
                        scaleX: 0,
                        scaleY: 0,
                        id: measurementValue_ID
                    }));
                }
            });

            break;
        default:
            console.log('Unknown type: ' + type + ' @generateCanvas()');
            break;
    }
       
    scaleStage_init(stage);
}

for (component of components) {
    var component_unique_id = component.lib_id + "_" + component.val + "_" + component.footprint;

    // Create Component Div
    var component_div = document.createElement('div');
    component_div.setAttribute('class', 'component');
    component_div.id = component_unique_id + '_div';
    document.getElementById('components').appendChild(component_div);

    // Create Component Title            
    var component_title = document.createElement('p');
    component_title.setAttribute('class', 'component_title');
    component_title.innerHTML = '<b>Symbol:</b>\n' +
                                '\t<b>Library</b>: ' + component.lib_id.split(':')[0] + '\n' +
                                '\t<b>Name: </b>' + component.lib_id.split(':')[1] + '\n' +
                                '<b>Footprint:</b>\n' +
                                '\t<b>Library: </b>' + component.footprint.split(':')[0] + '\n' +
                                '\t<b>Name: </b>' + component.footprint.split(':')[1] + '\n' +
                                '<b>Value: </b>' + component.val + '\n' +
                                '<b>References: </b>';
    // .replace(/[^0-9]+/g, '') gets rid of the chars, so it sorts only the numbers in the reference
    let sortedRefs = component.refs.toSorted((a, b) => Number(a.replace(/[^0-9]+/g, '')) - Number(b.replace(/[^0-9]+/g, '')));
    sortedRefs.forEach(n => {
        component_title.innerHTML += n;
        // place ', ' after every ref except last one
        if (sortedRefs.indexOf(n) != sortedRefs.length - 1) component_title.innerHTML += ', ';
    });
   
    document.getElementById(component_div.id).appendChild(component_title);

    // Create Symbol Canvas
    generateCanvas(component_unique_id, component_div, component, 'sym_draw');

    // Create Footprint Canvas
    generateCanvas(component_unique_id, component_div, component, 'fp_draw');
    
    // Create Symbol Image Canvas
    generateCanvas(component_unique_id, component_div, component, 'sym_img');
    
    // Create Footprint Image Canvas
    generateCanvas(component_unique_id, component_div, component, 'fp_img');

    // Add Linebreak and Spacer
    var linebreak = document.createElement("br");
    document.getElementById("components").appendChild(linebreak);


    var spacer = document.createElement("div");
    spacer.setAttribute("class", "spacer");
    document.getElementById("components").appendChild(spacer);
}