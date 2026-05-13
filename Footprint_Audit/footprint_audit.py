import os 
import logging
import pprint

from cad.kicad import parse_all_schematics
from web.generate_html import generateHTML

logger = logging.getLogger(__name__)


def footprint_audit(root_sch_path, img_path, sym_img_fieldName, fp_img_fieldName, exclude_symbols, exclude_libraries, saveLogFile=True, extendedLog=False):
    projectDir_KiCAD = os.path.dirname(root_sch_path)
    outputDir = os.path.abspath(projectDir_KiCAD + '/FP_Audit')

    if not os.path.exists(outputDir):
        os.mkdir(outputDir)

    # if not called from GUI, then config logging rn
    logging.basicConfig(level=logging.INFO,
                        format='%(levelname)s in %(name)s @ %(asctime)s : %(message)s')
    if saveLogFile:
        logFileHandler = logging.FileHandler(filename=f'{outputDir}/fp_audit.log')
        logFileHandler.setFormatter(logging.Formatter('%(levelname)s in %(name)s @ %(asctime)s : %(message)s'))
        if extendedLog:
            logFileHandler.setLevel(logging.DEBUG)
            logging.getLogger('').setLevel(logging.DEBUG)
        else:
            logFileHandler.setLevel(logging.INFO)
            logging.getLogger('').setLevel(logging.INFO)
        
        logging.getLogger('').addHandler(logFileHandler)
    
    print(logging.getLogger('standalone_gui_start'))
    guiLogHandlers = logging.getLogger('standalone_gui_start').handlers
    print(guiLogHandlers)
    #logger.addHandler(guiLogHandlers)
    logger.info('Start FP-Audit!')

    logger.debug(f'Root Schematic Path: {root_sch_path}')
    logger.debug(f'sym_img_fieldName: {sym_img_fieldName}')
    logger.debug(f'fp_img_fieldName: {fp_img_fieldName}')
    logger.debug(f'exclude_symbols: {exclude_symbols}')
    logger.debug(f'exclude_libraries: {exclude_libraries}')
    try:
        root_sch_path = os.path.abspath(root_sch_path)
    except FileNotFoundError:
        return
    
    # Read out all Components from KiCAD files
    try:
        comps = parse_all_schematics(root_sch_path, img_path, sym_img_fieldName, fp_img_fieldName, exclude_symbols, exclude_libraries)
    except:
        logger.exception('Aborting generating FP-Audit')
        return
    
    logger.debug(f'Merged Components:\n{pprint.pformat(comps)}')
    
    # Generate JS object string from components
    compsJS = "components = [\n"
    for comp in comps:
        compsJS += comp.toJSON(4) + ",\n"
    compsJS += "]"

    if generateHTML(compsJS, outputDir):
        logger.info('Finished FP-Audit!')
    else:
        logger.critical('FP-Audit Generation Failed!')

    
if __name__ == "__main__":
    footprint_audit('./TestProject_KiCAD/TestProj.kicad_sch', './TestProject_KiCAD', 'ds_image_sym', 'ds_image_fp', ['R', 'C'],  ['power'])