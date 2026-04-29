import os 
import argparse
from cad.kicad import parse_all_schematics
from generate_html import generateHTML


def main():
    try:
        root_sch_path = os.path.abspath("TestProj.kicad_sch")
    except FileNotFoundError:
        return
    
    # Read out all Components from KiCAD files
    comps = parse_all_schematics(root_sch_path, ['R', 'C'],  ['power'])

    # Generate JS object string from components
    compsJS = "components = [\n"
    for comp in comps:
        compsJS += comp.toJSON(4) + ",\n"
    compsJS += "]"

    #generateHTML(compsJS)


    with open("./Footprint_Audit/output.js", "w") as f:
        f.write("components = [\n")
        for comp in comps:
            f.write(comp.toJSON(4) + ",\n")
        f.write("]")

    


if __name__ == "__main__":
    main()