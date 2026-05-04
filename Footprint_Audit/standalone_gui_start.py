from gui_main import *
import wx
from footprint_audit import footprint_audit

class MainApp(wx.App):
    def OnInit(self):
        return True
        
class MainFrame(frameMain):
    def __init__(self):
        super().__init__(None)
        self.Show(True)
        self.m_htmlGenerated.SetWindowStyle(wx.ST_NO_AUTORESIZE | wx.ALIGN_CENTRE_HORIZONTAL)
    
    def gui_generateHTML( self, event ):
        self.m_htmlGenerated.SetLabelText('')
        kicad_sch_path = self.m_KiCAD_proj_picker.GetPath()
        img_path = self.m_ds_imgDir_picker.GetPath()
        sym_img_fieldName = self.m_fieldSymImgDS.GetValue()
        fp_img_fieldName = self.m_fieldFpImgDS.GetValue()

        excl_syms = self.m_excludeSyms.GetValue().split(',')
        excl_syms = [s.strip() for s in excl_syms]
        excl_libs = self.m_excludeLibs.GetValue().split(',')

        footprint_audit(kicad_sch_path, img_path, sym_img_fieldName, fp_img_fieldName, excl_syms, excl_libs)
        
        self.m_htmlGenerated.SetLabel('HTML Generated!')

        
if __name__ == '__main__':
    app = MainApp()
    mainFrame = MainFrame()
    app.MainLoop()