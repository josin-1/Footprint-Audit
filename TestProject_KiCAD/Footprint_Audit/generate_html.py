import os

def generateHTML(componentsJS):
    with open("./Footprint_Audit/web/fp_audit.html", "r") as f:
        htmlBase = f.read()
    
    with open("./Footprint_Audit/web/Konva_min.js", "r") as f:
        konvaJS = f.read()

    with open("./Footprint_Audit/web/fp_audit.js", "r") as f:
        fpAuditJS = f.read()

    with open("./Footprint_Audit/web/fp_audit_style.css", "r") as f:
        fpAuditCSS = f.read()

    # Create new File
    with open("./FP_AUDIT/fp_audit.html", "w") as f:
        htmlBase.replace("/// COMPONENT DATA ///", componentsJS)
        htmlBase.replace("/// KONVA ///", konvaJS)
        htmlBase.replace("/// FP AUDIT CSS ///", fpAuditCSS)
        htmlBase.replace("/// FP AUDIT JS ///", fpAuditJS)
