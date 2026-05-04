import os
import pprint

def generateHTML(componentsJS, kicad_proj_dir):

    dir_path = os.path.dirname(os.path.realpath(__file__))

    with open(os.path.join(dir_path, 'fp_audit.html'), 'r') as f:
        htmlBase = f.read()
    
    with open(os.path.join(dir_path, 'Konva_min.js'), 'r') as f:
        konvaJS = f.read()

    with open(os.path.join(dir_path, 'fp_audit.js'), 'r') as f:
        fpAuditJS = f.read()

    with open(os.path.join(dir_path, 'fp_audit_style.css'), "r") as f:
        fpAuditCSS = f.read()

    # Create new File
    if not os.path.exists(os.path.abspath(kicad_proj_dir + '/FP_Audit')):
        os.mkdir(os.path.abspath(kicad_proj_dir + '/FP_Audit'))
    
    with open(os.path.abspath(kicad_proj_dir + '/FP_Audit/fp_audit.html'), 'w') as f:
        htmlBase = htmlBase.replace('///COMPONENT_DATA///', componentsJS)
        htmlBase = htmlBase.replace('///KONVAJS///', konvaJS)
        htmlBase = htmlBase.replace('///FP_AUDIT_CSS///', fpAuditCSS)
        htmlBase = htmlBase.replace('///FP_AUDIT_JS///', fpAuditJS)
        f.write(htmlBase)