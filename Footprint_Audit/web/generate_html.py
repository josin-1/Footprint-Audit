import sys
import os
import logging

logger = logging.getLogger(__name__)

def generateHTML(componentsJS, outputDir):
    try:
        if hasattr(sys, '__MEIPASS'):
            # Running as PyInstaller bundle and templates are in temp folder
            dir_path = os.path.abspath(os.path.join(sys.__MEIPASS, '/web'))
        else:
            dir_path = os.path.dirname(os.path.realpath(__file__))

        logger.debug(f'Web Files Directory Path: {dir_path}')

        with open(os.path.join(dir_path, 'fp_audit.html'), 'r') as f:
            htmlBase = f.read()

        with open(os.path.join(dir_path, 'Konva_min.js'), 'r') as f:
            konvaJS = f.read()

        with open(os.path.join(dir_path, 'fp_audit.js'), 'r') as f:
            fpAuditJS = f.read()

        with open(os.path.join(dir_path, 'fp_audit_style.css'), "r") as f:
            fpAuditCSS = f.read()

        # Create new File
        if not os.path.exists(outputDir):
            os.mkdir(outputDir)

        logger.info('Creating output file')
        with open(os.path.abspath(outputDir + './fp_audit.html'), 'w') as f:
            htmlBase = htmlBase.replace('///COMPONENT_DATA///', componentsJS)
            htmlBase = htmlBase.replace('///KONVAJS///', konvaJS)
            htmlBase = htmlBase.replace('///FP_AUDIT_CSS///', fpAuditCSS)
            htmlBase = htmlBase.replace('///FP_AUDIT_JS///', fpAuditJS)
            f.write(htmlBase)
        return True
    except:
        logger.exception('Could not generate HTML file')
        return False