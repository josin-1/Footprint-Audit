# KiCAD Footprint-Audit
An automatic KiCAD Footprint and Symbol Audit Creator

The plan for this project is to have a KiCAD Plugin that creates an interactive HTML file (maybe even having a built in measurement tool), that includes the footprint, symbol and pictures of the datasheet, for every component on the pcb, so they can be crosschecked, before sending the pcb to production.
This should make it easier to audit the correctness of the used footprints, and make mistakes easier to spot.
Necessary pictures from the datasheed would need to be provided manually, and linked in the KiCAD symbol with specific fields.

The HTML generation is probably going to be inspired by the [Interactive HTML BOM](https://github.com/openscopeproject/InteractiveHtmlBom/tree/master/InteractiveHtmlBom) plugin

## What's been accomplished:
### First Parsing Tests
Right now I've written a file parser in python, that takes the kicad_sch and kicad_pcb file, and returns a list of all Components, with the necessary data in them.
Usage is too call parse_all_schematics() from schematic_parser.py, which traverses through all hierarchical schematics and collects every component and saves them as ComponentEntry.
Afterwards the filename of the root schematic path is taken to open the .kicad_pcb file, where the footprint geometry is saved from.
At the end duplicate Components will be merged together automatically, preserving each reference value in a string list.  

### TestProject_KiCAD/Footprint_Audit
Extended the Parser to output the read KiCAD data into a output.js file. Also written an HTML file, that reads the js file, iterates over all Components, and visualizes them. Currently made the image view work (image data is baked into the js file with base64 encoding), and created Konva Stages for each component, and made it visualize the Symbol (very basic tho) for now. 
