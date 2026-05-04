import os 
import argparse
from cad.kicad import parse_all_schematics
from web.generate_html import generateHTML


def footprint_audit(root_sch_path, img_path, sym_img_fieldName, fp_img_fieldName, exclude_symbols, exclude_libraries):
    try:
        root_sch_path = os.path.abspath(root_sch_path)
    except FileNotFoundError:
        return
    
    # Read out all Components from KiCAD files
    comps = parse_all_schematics(root_sch_path, img_path, sym_img_fieldName, fp_img_fieldName, exclude_symbols, exclude_libraries)

    # Generate JS object string from components
    compsJS = "components = [\n"
    for comp in comps:
        compsJS += comp.toJSON(4) + ",\n"
    compsJS += "]"

    generateHTML(compsJS, os.path.dirname(root_sch_path))


if __name__ == "__main__":
    footprint_audit('./TestProject_KiCAD/TestProj.kicad_sch', './TestProject_KiCAD', 'ds_image_sym', 'ds_image_fp', ['R', 'C'],  ['power'])