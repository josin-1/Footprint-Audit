# Footprint-Audit
Automatic (KiCAD) Footprint and Symbol Audit Creator

The plan for this project is too have a KiCAD Plugin, that creates an interactive HTML file, that includes the footprint, symbol and pictures of the datasheet, for every component on the pcb, so they can be crosschecked, before sending the pcb to production.
This should make it easier to audit the correctness of the used footprints, and make mistakes easier to spot.

Right now I've written a file parser in python, that takes the kicad_sch and kicad_pcb file, and returns a list of all Components, with all data in them
