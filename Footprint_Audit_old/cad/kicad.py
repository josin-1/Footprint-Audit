from sexpdata import loads, Symbol
import os 

from core.Component import ComponentEntry
from core.GeometryShape import GeometryShapeType, PadType, PadGeometry, GeometryShape
from core.Vec2D import Vec2D


def merge_components(all_components):
    merged = {}

    for component in all_components:
        if component in merged:
            merged[component].refs.extend(component.refs)
        else:
            merged[component] = component

    return list(merged.values())

def parse_symbol_geometry(elements):
    geometry = []

    key = elements[1]

    for lib_elements in elements:
        if lib_elements[0] == Symbol('symbol'):
            for geometry_elements in lib_elements:             
                newShape = GeometryShape()

                if geometry_elements[0] == Symbol('rectangle'):
                    newShape.type = GeometryShapeType.SymbolRectangle
                    for item in geometry_elements:
                        if item[0] == Symbol('start'):
                            newShape.start = Vec2D(x=item[1], y=item[2])
                        
                        if item[0] == Symbol('end'):
                            newShape.end = Vec2D(x=item[1], y=item[2])
                        
                        if item[0] == Symbol('stroke'):
                            for stroke in item:
                                if stroke[0] == Symbol('width'):
                                    newShape.stroke_width = stroke[1]
                                if stroke[0] == Symbol('type'):
                                    newShape.stroke_type = str(stroke[1])

                        if item[0] == Symbol('fill'):
                            for fill in item:
                                if fill[0] == Symbol('type'):
                                    newShape.fill_type = str(fill[1])
                    geometry.append(newShape)
                
                if geometry_elements[0] == Symbol('polyline'):
                    newShape.type = GeometryShapeType.SymbolPolyline

                    for item in geometry_elements:
                        if item[0] == Symbol('pts'):
                            for point in item:
                                if point[0] == Symbol('xy'):
                                    newShape.points.append(Vec2D(x=point[1], y= point[2]))
                        
                        if item[0] == Symbol('stroke'):
                            for stroke in item:
                                if stroke[0] == Symbol('width'):
                                    newShape.stroke_width = stroke[1]
                                if stroke[0] == Symbol('type'):
                                    newShape.stroke_type = str(stroke[1])

                        if item[0] == Symbol('fill'):
                            for fill in item:
                                if fill[0] == Symbol('type'):
                                    newShape.fill_type = str(fill[1])
                    geometry.append(newShape)

                if geometry_elements[0] == Symbol('circle'):
                    newShape.type = GeometryShapeType.SymbolCircle

                    for item in geometry_elements:
                        if item[0] == Symbol('center'):
                            newShape.center = Vec2D(x=item[1], y=item[2])

                        if item[0] == Symbol('radius'):
                            newShape.radius = item[1]

                        if item[0] == Symbol('stroke'):
                            for stroke in item:
                                if stroke[0] == Symbol('width'):
                                    newShape.stroke_width = stroke[1]
                                if stroke[0] == Symbol('type'):
                                    newShape.stroke_type = str(stroke[1])

                        if item[0] == Symbol('fill'):
                            for fill in item:
                                if fill[0] == Symbol('type'):
                                    newShape.fill_type = str(fill[1])
                    geometry.append(newShape)

                if geometry_elements[0] == Symbol('arc'):
                    newShape.type = GeometryShapeType.SymbolArc

                    for item in geometry_elements:
                        if item[0] == Symbol('start'):
                            newShape.start = Vec2D(x=item[1], y=item[2])

                        if item[0] == Symbol('mid'):
                            newShape.mid = Vec2D(x=item[1], y=item[2])

                        if item[0] == Symbol('end'):
                            newShape.end = Vec2D(x=item[1], y=item[2])

                        if item[0] == Symbol('stroke'):
                            for stroke in item:
                                if stroke[0] == Symbol('width'):
                                    newShape.stroke_width = stroke[1]
                                if stroke[0] == Symbol('type'):
                                    newShape.stroke_type = str(stroke[1])

                        if item[0] == Symbol('fill'):
                            for fill in item:
                                if fill[0] == Symbol('type'):
                                    newShape.fill_type = str(fill[1])
                    geometry.append(newShape)

                if geometry_elements[0] == Symbol('pin'):
                    newShape.type = GeometryShapeType.SymbolPin

                    for item in geometry_elements:
                        if item[0] == Symbol('at'):
                            newShape.position = Vec2D(x=item[1], y=item[2])
                            newShape.rotation = item[3]
                        
                        if item[0] == Symbol('length'):
                            newShape.length = item[1]

                        if item[0] == Symbol('name'):
                            newShape.name = item[1]

                        if item[0] == Symbol('number'):
                            newShape.number = item[1]
                    geometry.append(newShape)

    return {key: geometry}
 

def parse_symbol(element):
    newCompEntry = ComponentEntry()
    for symbol_element in element:
        if symbol_element[0] == Symbol('lib_name'):
            newCompEntry.lib_name = symbol_element[1]

        if symbol_element[0] == Symbol('lib_id'):
            newCompEntry.lib_id = symbol_element[1]
        
        if symbol_element[0] == Symbol('property'):
            if symbol_element[1] == 'Value':
                newCompEntry.val = symbol_element[2]
            
            if symbol_element[1] == 'Footprint':
                if symbol_element[2] != '':
                    newCompEntry.footprint = symbol_element[2]

            if symbol_element[1] == 'ds_image_sym':
                if symbol_element[2] != '':
                    newCompEntry.ds_image_sym = os.path.abspath(symbol_element[2])

            if symbol_element[1] == 'ds_image_fp':
                if symbol_element[2] != '':
                    newCompEntry.ds_image_fp = os.path.abspath(symbol_element[2])

        if symbol_element[0] == Symbol('instances'):
            for instances in symbol_element:
                for instance_data in instances:
                    for singleInstance in instance_data:
                        if singleInstance[0] == Symbol('reference'):
                            newCompEntry.refs.append(singleInstance[1])
    return newCompEntry


def parse_schematic(sch_path, exclude_symbols, exclude_libs, components, symbol_geometry):
    print("Parsing Schematic at: " + sch_path)
    
    with open(sch_path) as f:
        sexpData = loads(f.read())

    sub_circuits = []

    for element in sexpData: 
        if element[0] == Symbol('lib_symbols'):            
            for symbols in element:
                if symbols[0] == Symbol('symbol'): 
                    symbol_geometry.update(parse_symbol_geometry(symbols))
            
        if element[0] == Symbol('symbol'):
            newSymbol = parse_symbol(element)
            if (newSymbol.getName() not in exclude_symbols and
                newSymbol.getLib() not in exclude_libs):
                components.append(newSymbol)
                              
        if element[0] == Symbol('sheet'):
            for sheet_element in element:
                if sheet_element[0] == Symbol('property') and sheet_element[1] == "Sheetfile":
                    sub_circuits.append(sheet_element[2])
    return sub_circuits


def parse_footprints(pcb_path):
    print("Parsing PCB at: " + pcb_path)

    layers = {}
    footprint_geometries = {}

    with open(pcb_path) as f:
        sexpData = loads(f.read())

    for element in sexpData: 
        geometry = []
        if element[0] == Symbol('footprint'):            
            key = element[1]
            for fp_data in element:
                newShape = GeometryShape()

                if fp_data[0] == Symbol('layer'):
                    layers.update({key : fp_data[1]})

                if fp_data[0] == Symbol('fp_rect'):
                    newShape.type = GeometryShapeType.FP_Rectangle

                    for shape_data in fp_data:
                        if shape_data[0] == Symbol('start'):
                            newShape.start = Vec2D(x=shape_data[1], y=shape_data[2])
                        if shape_data[0] == Symbol('end'):
                            newShape.end = Vec2D(x=shape_data[1], y=shape_data[2])
                        if shape_data[0] == Symbol('stroke'):
                            for stroke in shape_data:
                                if stroke[0] == Symbol('width'):
                                    newShape.stroke_width = stroke[1]
                                if stroke[0] == Symbol('type'):
                                    newShape.stroke_type = str(stroke[1])
                        if shape_data[0] == Symbol('fill'):
                            newShape.fill_type = shape_data[1]
                        if shape_data[0] == Symbol('layer'):
                            newShape.layer = shape_data[1]

                    geometry.append(newShape)

                if fp_data[0] == Symbol('fp_poly'):
                    newShape.type = GeometryShapeType.FP_Polyline

                    for shape_data in fp_data:
                        if shape_data[0] == Symbol('pts'):
                            for point in shape_data:
                                if point[0] == Symbol('xy'):
                                    #pprint.pp(point)
                                    newShape.points.append(Vec2D(x=point[1], y= point[2]))
                        
                        if shape_data[0] == Symbol('end'):
                            newShape.end = Vec2D(x=shape_data[1], y=shape_data[2])
                        if shape_data[0] == Symbol('stroke'):
                            for stroke in shape_data:
                                if stroke[0] == Symbol('width'):
                                    newShape.stroke_width = stroke[1]
                                if stroke[0] == Symbol('type'):
                                    newShape.stroke_type = str(stroke[1])
                        if shape_data[0] == Symbol('fill'):
                            newShape.fill_type = shape_data[1]
                        if shape_data[0] == Symbol('layer'):
                            newShape.layer = shape_data[1]

                    geometry.append(newShape)

                if fp_data[0] == Symbol('fp_circle'):
                    newShape.type = GeometryShapeType.FP_Circle

                    for shape_data in fp_data:
                        if shape_data[0] == Symbol('center'):
                            newShape.center = Vec2D(x=shape_data[1], y=shape_data[2])
                        if shape_data[0] == Symbol('end'):
                            newShape.end = Vec2D(x=shape_data[1], y=shape_data[2])
                            newShape.radius = abs(newShape.center - newShape.end)
                        if shape_data[0] == Symbol('stroke'):
                            for stroke in shape_data:
                                if stroke[0] == Symbol('width'):
                                    newShape.stroke_width = stroke[1]
                                if stroke[0] == Symbol('type'):
                                    newShape.stroke_type = str(stroke[1])
                        if shape_data[0] == Symbol('fill'):
                            newShape.fill_type = shape_data[1]
                        if shape_data[0] == Symbol('layer'):
                            newShape.layer = shape_data[1]

                    geometry.append(newShape)

                if fp_data[0] == Symbol('fp_arc'):
                    newShape.type = GeometryShapeType.FP_Arc

                    for shape_data in fp_data:
                        if shape_data[0] == Symbol('start'):
                            newShape.start = Vec2D(x=shape_data[1], y=shape_data[2])
                        if shape_data[0] == Symbol('mid'):
                            newShape.mid = Vec2D(x=shape_data[1], y=shape_data[2])
                        if shape_data[0] == Symbol('end'):
                            newShape.end = Vec2D(x=shape_data[1], y=shape_data[2])
                        if shape_data[0] == Symbol('stroke'):
                            for stroke in shape_data:
                                if stroke[0] == Symbol('width'):
                                    newShape.stroke_width = stroke[1]
                                if stroke[0] == Symbol('type'):
                                    newShape.stroke_type = str(stroke[1])
                        if shape_data[0] == Symbol('fill'):
                            newShape.fill_type = shape_data[1]
                        if shape_data[0] == Symbol('layer'):
                            newShape.layer = shape_data[1]

                    geometry.append(newShape)

                if fp_data[0] == Symbol('pad'):
                    newShape.type = GeometryShapeType.FP_Pad
                    
                    newShape.number = fp_data[1]
                    if fp_data[2] == Symbol('thru_hole'):
                        newShape.padType = PadType.THT
                    if fp_data[2] == Symbol('smd'):
                        newShape.padType = PadType.SMD
                    if fp_data[2] == Symbol('np_thru_hole'):
                        newShape.padType = PadType.NP_THT
                    
                    if fp_data[3] == Symbol('circle'):
                        newShape.padGeometry = PadGeometry.PadCircle
                    if fp_data[3] == Symbol('oval'):
                        newShape.padGeometry = PadGeometry.PadOval
                    if fp_data[3] == Symbol('rect'):
                        newShape.padGeometry = PadGeometry.PadRect
                    if fp_data[3] == Symbol('trapezoid'):
                        newShape.padGeometry = PadGeometry.PadTrapezoid
                    if fp_data[3] == Symbol('roundrect'):
                        newShape.padGeometry = PadGeometry.PadRoundRect
                    if fp_data[3] == Symbol('custom'):
                        newShape.padGeometry = PadGeometry.PadCustom

                    for shape_data in fp_data:

                        # Continue if there is no pad number
                        # avoiding an error for shape_data[0]
                        if shape_data == '':
                            continue

                        if shape_data[0] == Symbol('at'):
                            newShape.position = Vec2D(x=shape_data[1], y=shape_data[2])
                            # Sometimes no rotation is present for whatever reason -.-
                            if len(shape_data) == 4:
                                newShape.rotation = shape_data[3]
                        if shape_data[0] == Symbol('size'):
                            newShape.size = Vec2D(x=shape_data[1], y=shape_data[2])
                        if shape_data[0] == Symbol('drill'):
                            # For whatever reason sometimes there is only one value!!
                            if len(shape_data) == 2:
                                newShape.drill = Vec2D(x=shape_data[1], y=shape_data[1])
                            else:
                                newShape.drill = Vec2D(x=shape_data[1], y=shape_data[2])
                        if shape_data[0] == Symbol('roundrect_rratio'):
                            newShape.roundrect_rratio = shape_data[1]
                        if shape_data[0] == Symbol('pinfunction'):
                            newShape.name = shape_data[1]
                        if shape_data[0] == Symbol('rect_delta'):
                            newShape.rect_delta == shape_data[1]
                        if shape_data[0] == Symbol('chamfer_ratio'):
                            newShape.chamfer_ratio == shape_data[1]
                        if shape_data[0] == Symbol('chamfer'):
                            for strings in shape_data:
                                if strings != Symbol('chamfer'):
                                    newShape.chamfer.append(str(strings))

                    geometry.append(newShape)

            footprint_geometries.update({key : geometry})

    return (layers, footprint_geometries)
        

def parse_all_schematics(root_sch_path, exclude_symbols=[], exclude_libs=[]):
    
    symbol_geometries = {}
    footprint_geometries = {}
    layers = {}
    components = []
    visited = set()

    if not os.path.isfile(root_sch_path):
        print(f"Error: Schematic Path " + root_sch_path + " does not exist!")
        return

    # All hierarchical sheets are travered through to collect symbols
    def traverse(sch_path, exclude_symbols, exclude_libs, components, symbol_geometries):
        if sch_path in visited:
            return
        visited.add(sch_path)

        sub_circuits = parse_schematic(sch_path, exclude_symbols, exclude_libs, components, symbol_geometries)

        for sub_path in sub_circuits:
            abs_path = os.path.join(os.path.dirname(sch_path), sub_path)
            traverse(abs_path, exclude_symbols, exclude_libs, components, symbol_geometries)

    traverse(root_sch_path, exclude_symbols, exclude_libs, components, symbol_geometries)

    # Combine all found components with the symbol geometry
    for component in components:
        # Use lib_name if present, otherwise use lib_id:
        # Sometimes KiCAD saves the cached geometry as 'SymbolName_x', instead of 
        # 'SymbolLib:SymbolName', but then the symbol instance itself is referenced
        # with lib_name and lib_id, so lib_name is saved too to find the corresponding
        # geometry again right here. I think it's something weird with copy-paste handling.

        geometry_key = component.lib_name if component.lib_name != "" else component.lib_id
        shapes = symbol_geometries.get(geometry_key)

        if shapes is None:
            print(f"Warning: no symbol geometry found for {component.lib_id} (key: {geometry_key})")
        else:
            component.symbol_geometry = shapes
    
    # Parse PCB data to collect footprints. Path will be the
    # schematic filename with ".kicad_pcb". This works only for the
    # main schematic. Putting a subcircuit path in 
    # parse_all_schematics() will lead to an error and no
    # footprints beeing collected 
    filename = os.path.split(root_sch_path)[-1].split('.')[0]
    pcb_path = os.path.join(os.path.split(root_sch_path)[0], filename + '.kicad_pcb')

    if os.path.isfile(pcb_path):
        layers, footprint_geometries = parse_footprints(pcb_path)
    else:
        print(f"Error: PCB Path " + pcb_path + " does not exist!")

    # Combine components with the footprint geometry
    for component in components:
        shapes = footprint_geometries.get(component.footprint)
        layer = layers.get(component.footprint)

        if shapes is None:
            print(f"Warning: no footprint geometry found for {component.footprint}")
        else:
            component.footprint_geometry = shapes
            component.layer = layer

    return merge_components(components)