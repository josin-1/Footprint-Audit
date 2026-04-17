            var mm2px_scale = 8;
            var fill_background_color = "lightyellow";
            var fill_outline_color = "brown";
            var symbol_strokeWidth = 2;

            var fp_strokeWidth = 2;
            var fp_strokeColor = "violet";


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
                const endAngle   = Math.atan2(E.y - C.y, E.x - C.x);
                const midAngle   = Math.atan2(M.y - C.y, M.x - C.x);

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

            function drawSymbol(stage, layer, symbol_geometry){
                for (var i = 0; i < symbol_geometry.length; ++i){
                    switch(symbol_geometry[i].type){
                        case "SymbolRectangle":
                            var rect = new Konva.Rect({
                                x: (stage.width() / 2) + symbol_geometry[i].start.x * mm2px_scale,
                                y: (stage.height() / 2) - symbol_geometry[i].start.y * mm2px_scale,
                                width: ((stage.width() / 2) + symbol_geometry[i].end.x * mm2px_scale) - ((stage.width() / 2) + symbol_geometry[i].start.x * mm2px_scale),
                                height: ((stage.height() / 2) - symbol_geometry[i].end.y * mm2px_scale) - ((stage.height() / 2) - symbol_geometry[i].start.y * mm2px_scale),
                                stroke: fill_outline_color,
                                strokeWidth: symbol_strokeWidth
                            });
                            if (symbol_geometry[i].fill_type == "background"){
                                rect.fill(fill_background_color);
                            }
                            if (symbol_geometry[i].fill_type == "outline"){
                                rect.fill(fill_outline_color);
                            }
                            layer.add(rect);
                            break;
                        case "SymbolPolyline":
                            var points = []
                            for (var j = 0; j < symbol_geometry[i].points.length; ++j){
                                points.push((stage.width() / 2) + symbol_geometry[i].points[j].x * mm2px_scale);
                                points.push((stage.height() / 2) - symbol_geometry[i].points[j].y * mm2px_scale);
                            }
                            var line = new Konva.Line({
                                points: points,
                                fillAfterStrokeEnabled: true,
                                stroke: fill_outline_color,
                                strokeWidth: symbol_strokeWidth
                            });
                            if (symbol_geometry[i].fill_type == "background"){
                                line.fill(fill_background_color);
                            }
                            if (symbol_geometry[i].fill_type == "outline"){
                                line.fill(fill_outline_color);
                            }
                            layer.add(line);
                            break;
                        case "SymbolCircle":
                            var circ = new Konva.Circle({
                                x: (stage.width() / 2) + symbol_geometry[i].center.x * mm2px_scale,
                                y: (stage.height() / 2) - symbol_geometry[i].center.y * mm2px_scale,
                                radius: symbol_geometry[i].radius * mm2px_scale,
                                stroke: fill_outline_color,
                                strokeWidth: symbol_strokeWidth
                            });
                            if (symbol_geometry[i].fill_type == "background"){
                                circ.fill(fill_background_color);
                            }
                            if (symbol_geometry[i].fill_type == "outline"){
                                circ.fill(fill_outline_color);
                            }
                            layer.add(circ);
                            break;
                        case "SymbolArc":
                            var konvaParams = arcToKonvaProps(symbol_geometry[i].start, symbol_geometry[i].mid, symbol_geometry[i].end, thickness = 0);                          
                            var arc = new Konva.Arc({
                                x: (stage.width() / 2) + konvaParams.x * mm2px_scale,
                                y: (stage.height() / 2) - konvaParams.y * mm2px_scale,
                                rotation: konvaParams.rotation,
                                innerRadius: konvaParams.innerRadius * mm2px_scale,
                                outerRadius: konvaParams.outerRadius * mm2px_scale,
                                angle: konvaParams.angle,
                                clockwise: true,
                                stroke: fill_outline_color,
                                strokeWidth: symbol_strokeWidth
                            });
                            if (symbol_geometry[i].fill_type == "background"){
                                arc.fill(fill_background_color);
                            }
                            if (symbol_geometry[i].fill_type == "outline"){
                                arc.fill(fill_outline_color);
                            }
                            layer.add(arc);
                            
                            break;
                        case "SymbolPin":
                            var points = [
                                (stage.width() / 2) + symbol_geometry[i].position.x * mm2px_scale,
                                (stage.height() / 2) - symbol_geometry[i].position.y * mm2px_scale
                            ];
                            switch (symbol_geometry[i].rotation){
                                case 0:
                                    points.push(points[0] + symbol_geometry[i].length * mm2px_scale);
                                    points.push(points[1]);
                                    break;
                                case 90:
                                    points.push(points[0]);
                                    points.push(points[1] - symbol_geometry[i].length * mm2px_scale);
                                    break;
                                case 180:
                                    points.push(points[0] - symbol_geometry[i].length * mm2px_scale);
                                    points.push(points[1]);
                                    break;
                                case 270:
                                    points.push(points[0]);
                                    points.push(points[1] + symbol_geometry[i].length * mm2px_scale);
                                    break;
                            }
                            var line = new Konva.Line({
                                points: points,
                                fillAfterStrokeEnabled: true,
                                stroke: fill_outline_color,
                                strokeWidth: symbol_strokeWidth
                            });
                            layer.add(line);
                            break;
                        default:
                            console.log("ERROR: Undefined Symbol Shape Type: " + symbol_geometry[i].type)
                    }
                }
            }

            function drawFootprint(stage, layer, footprint_geometry){
                for (var i = 0; i < footprint_geometry.length; ++i){
                    switch(footprint_geometry[i].type){                     
                        case "FP_Rectangle":
                            var rect = new Konva.Rect({
                                x: (stage.width() / 2) + footprint_geometry[i].start.x * mm2px_scale,
                                y: (stage.height() / 2) - footprint_geometry[i].start.y * mm2px_scale,
                                width: ((stage.width() / 2) + footprint_geometry[i].end.x * mm2px_scale) - ((stage.width() / 2) + footprint_geometry[i].start.x * mm2px_scale),
                                height: ((stage.height() / 2) - footprint_geometry[i].end.y * mm2px_scale) - ((stage.height() / 2) - footprint_geometry[i].start.y * mm2px_scale),
                                stroke: fp_strokeColor,
                                strokeWidth: fp_strokeWidth
                            });
                            if (footprint_geometry[i].fill_type == "background"){
                                rect.fill(fill_background_color);
                            }
                            if (footprint_geometry[i].fill_type == "outline"){
                                rect.fill(fill_outline_color);
                            }
                            layer.add(rect);
                            break;
                        case "FP_Polyline":
                            var points = []
                            for (var j = 0; j < footprint_geometry[i].points.length; ++j){
                                points.push((stage.width() / 2) + footprint_geometry[i].points[j].x * mm2px_scale);
                                points.push((stage.height() / 2) - footprint_geometry[i].points[j].y * mm2px_scale);
                            }
                            var line = new Konva.Line({
                                points: points,
                                fillAfterStrokeEnabled: true,
                                stroke: fp_strokeColor,
                                strokeWidth: fp_strokeWidth
                            });
                            if (footprint_geometry[i].fill_type == "background"){
                                line.fill(fill_background_color);
                            }
                            if (footprint_geometry[i].fill_type == "outline"){
                                line.fill(fill_outline_color);
                            }
                            layer.add(line);
                            break;
                        case "FP_Circle":
                            var circ = new Konva.Circle({
                                x: (stage.width() / 2) + footprint_geometry[i].center.x * mm2px_scale,
                                y: (stage.height() / 2) - footprint_geometry[i].center.y * mm2px_scale,
                                radius: footprint_geometry[i].radius * mm2px_scale,
                                stroke: fp_strokeColor,
                                strokeWidth: fp_strokeWidth
                            });
                            if (footprint_geometry[i].fill_type == "background"){
                                circ.fill(fill_background_color);
                            }
                            if (footprint_geometry[i].fill_type == "outline"){
                                circ.fill(fill_outline_color);
                            }
                            layer.add(circ);
                            break;
                        case "FP_Arc":
                            var konvaParams = arcToKonvaProps(footprint_geometry[i].start, footprint_geometry[i].mid, footprint_geometry[i].end, thickness = 0);                          
                            var arc = new Konva.Arc({
                                x: (stage.width() / 2) + konvaParams.x * mm2px_scale,
                                y: (stage.height() / 2) - konvaParams.y * mm2px_scale,
                                rotation: konvaParams.rotation,
                                innerRadius: konvaParams.innerRadius * mm2px_scale,
                                outerRadius: konvaParams.outerRadius * mm2px_scale,
                                angle: konvaParams.angle,
                                clockwise: true,
                                stroke: fp_strokeColor,
                                strokeWidth: fp_strokeWidth
                            });
                            if (footprint_geometry[i].fill_type == "background"){
                                arc.fill(fill_background_color);
                            }
                            if (footprint_geometry[i].fill_type == "outline"){
                                arc.fill(fill_outline_color);
                            }
                            layer.add(arc);
                            break;
                        case "FP_Pad":
                            switch(footprint_geometry[i].padType){                            
                                case "THT":
                                    
                                    break;
                                case "SMD":
                                    if (footprint_geometry[i].padGeometry == "PadRoundRect"){
                                        var rect = new Konva.Rect({
                                            x: (stage.width() / 2) + footprint_geometry[i].position.x * mm2px_scale,
                                            y: (stage.height() / 2) - footprint_geometry[i].position.y * mm2px_scale,
                                            width: ((stage.width() / 2) + footprint_geometry[i].size.x * mm2px_scale) - ((stage.width() / 2) + footprint_geometry[i].start.x * mm2px_scale),
                                            height: ((stage.height() / 2) - footprint_geometry[i].size.y * mm2px_scale) - ((stage.height() / 2) - footprint_geometry[i].start.y * mm2px_scale),
                                            stroke: fp_strokeColor,
                                            strokeWidth: fp_strokeWidth
                                        });


                                        layer.add(rect);
                                    }
                                    break;
                                case "NP_THT":   
                                    
                                    break;
                                default:
                                    console.log("ERROR: Undefined Pad Shape Type: " + footprint_geometry[i].padType)
                            }
                            break;
                        default:
                            console.log("ERROR: Undefined Footprint Shape Type: " + footprint_geometry[i].type)
                    }
                }
            }

			for (var i = 0; i < components.length; ++i){
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
                var canvas_sym_div = document.createElement("div");
                canvas_sym_div.setAttribute("class", "component_canvas");
                canvas_sym_div.id = component_unique_id + "_canvas_sym_div";
                document.getElementById(component_div.id).appendChild(canvas_sym_div);
                
                var sym_stage = new Konva.Stage({
                    container: canvas_sym_div,
                    width: canvas_sym_div.clientWidth,
                    height: canvas_sym_div.clientHeight
                });
                var sym_layer = new Konva.Layer();
                sym_stage.add(sym_layer);
                drawSymbol(sym_stage, sym_layer, components[i].symbol_geometry);


                // Create Footprint Canvas
                var canvas_fp_div = document.createElement("div");
                canvas_fp_div.setAttribute("class", "component_canvas");
                canvas_fp_div.id = component_unique_id + "_canvas_fp_div";
                document.getElementById(component_div.id).appendChild(canvas_fp_div);

                var fp_stage = new Konva.Stage({
                    container: canvas_fp_div,
                    width: canvas_fp_div.clientWidth,
                    height: canvas_fp_div.clientHeight
                });
                var fp_layer = new Konva.Layer();
                fp_stage.add(fp_layer);
                drawFootprint(fp_stage, fp_layer, components[i].footprint_geometry)
                /*
                fp_layer.add(new Konva.Circle({
                    x: sym_stage.width() / 2,
                    y: sym_stage.height() / 2,
                    radius: 70,
                    fill: 'blue',
                    stroke: 'black',
                    strokeWidth: 4
                }));
                */


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