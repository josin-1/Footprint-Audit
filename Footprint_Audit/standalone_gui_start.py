import wx
import wx.stc
import logging

logger = logging.getLogger(__name__)


from gui_main import *
from footprint_audit import footprint_audit



class wxLogHandler(logging.Handler):
    def __init__(self, wxDest):
        logging.Handler.__init__(self)
        self.wxDest = wxDest

    def emit(self, record):
        s = self.format(record) + '\n'
        self.wxDest.SetReadOnly(False)

        # StyleSpec for INFO (Green Text)
        self.wxDest.StyleSetSpec(1, 'fore:#00ff00')
        # StyleSpec for ERROR (RED Text)
        self.wxDest.StyleSetSpec(2, 'fore:#ff0000')
        # StyleSpec for WARNING (YELLOW Text)
        self.wxDest.StyleSetSpec(3, 'fore:#00ffff')
        # StyleSpec for Finished FP-Audit (Green Text)
        self.wxDest.StyleSetSpec(10, 'fore:#000000,back:#22ff22')

        self.wxDest.AddText(s)
        if s.split(':')[0] == 'INFO':
            pos = self.wxDest.GetCurrentPos()
            self.wxDest.StartStyling(pos - len(s))
            self.wxDest.SetStyling(len('INFO'), 1)

        if s.split(':')[0] == 'ERROR':
            pos = self.wxDest.GetCurrentPos()
            self.wxDest.StartStyling(pos - len(s))
            self.wxDest.SetStyling(len('ERROR'), 2)

        if s.split(':')[0] == 'WARNING':
            pos = self.wxDest.GetCurrentPos()
            self.wxDest.StartStyling(pos - len(s))
            self.wxDest.SetStyling(len('WARNING'), 3)

        if s == 'INFO: Finished FP-Audit!\n':
            pos = self.wxDest.GetCurrentPos()
            self.wxDest.StartStyling(pos - len('Finished FP-Audit!\n'))
            self.wxDest.SetStyling(len('Finished FP-Audit!'), 10)         

        self.wxDest.ScrollToEnd()
        self.wxDest.SetReadOnly(True)

class MainApp(wx.App):
    def OnInit(self):
        return True
        
class MainFrame(frameMain):
    def __init__(self):
        super().__init__(None)

        self.m_logWindow = wx.stc.StyledTextCtrl(self.m_panelMain, wx.ID_ANY, wx.DefaultPosition, wx.Size(-1, -1))
        self.m_logWindow.SetReadOnly(True)
        bSizer = self.m_panelMain.GetSizer()
        bSizer.Add(self.m_logWindow, 0, wx.ALL|wx.EXPAND, 5)
        self.Show(True)

        logging.basicConfig(level=logging.INFO,
                            format='%(levelname)s in %(module)s @ %(asctime)s : %(message)s')

        logHandler = wxLogHandler(self.m_logWindow)
        logHandler.setFormatter(logging.Formatter('%(levelname)s: %(message)s'))

        if self.m_debugLog.GetValue():
            logHandler.setLevel(logging.DEBUG)
            logging.getLogger('').setLevel(logging.DEBUG)
        else:
            logHandler.setLevel(logging.INFO)
            logging.getLogger('').setLevel(logging.INFO)

        # Add Handler to root Logger (which is not logger!!)
        logging.getLogger('').addHandler(logHandler)
            
    def gui_generateHTML( self, event ):
        self.m_logWindow.SetReadOnly(False)
        self.m_logWindow.ClearAll()
        self.m_logWindow.SetReadOnly(True)

        kicad_sch_path = self.m_KiCAD_proj_picker.GetPath()
        img_path = self.m_ds_imgDir_picker.GetPath()
        sym_img_fieldName = self.m_fieldSymImgDS.GetValue()
        fp_img_fieldName = self.m_fieldFpImgDS.GetValue()

        excl_syms = self.m_excludeSyms.GetValue().split(',')
        excl_syms = [s.strip() for s in excl_syms]
        excl_libs = self.m_excludeLibs.GetValue().split(',')

        if kicad_sch_path == '':
            logger.error("No KiCAD Schematic Path entered")
            return
        
        footprint_audit(kicad_sch_path, img_path, sym_img_fieldName, fp_img_fieldName, excl_syms, excl_libs, self.m_saveLogFile.GetValue(), self.m_debugLog.GetValue())

        
if __name__ == '__main__':
    app = MainApp()
    mainFrame = MainFrame()
    app.MainLoop()