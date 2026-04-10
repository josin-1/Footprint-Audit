import pprint
import os 
import argparse
from cad.kicad import parse_all_schematics


def main():
    root_sch_path = os.path.abspath("TestProj.kicad_sch")

    comps = parse_all_schematics(root_sch_path, ['R', 'C'],  ['power'])

    with open("./Footprint_Audit/output.js", "w") as f:
        f.write("components = [\n")
        for comp in comps:
            f.write(comp.toJSON(4) + ",\n")
        f.write("]")

    


if __name__ == "__main__":
    main()