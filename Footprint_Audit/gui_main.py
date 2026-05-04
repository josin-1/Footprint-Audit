# -*- coding: utf-8 -*- 

###########################################################################
## Python code generated with wxFormBuilder (version Jun 17 2015)
## http://www.wxformbuilder.org/
##
## PLEASE DO "NOT" EDIT THIS FILE!
###########################################################################

import wx
import wx.xrc

###########################################################################
## Class frameMain
###########################################################################

class frameMain ( wx.Frame ):
	
	def __init__( self, parent ):
		wx.Frame.__init__ ( self, parent, id = wx.ID_ANY, title = u"Footprint Audit Generator", pos = wx.DefaultPosition, size = wx.Size( 350,600 ), style = wx.DEFAULT_FRAME_STYLE|wx.TAB_TRAVERSAL )
		
		self.SetSizeHintsSz( wx.DefaultSize, wx.DefaultSize )
		
		bSizerFrameMain = wx.BoxSizer( wx.VERTICAL )
		
		bSizerMainFrame = wx.BoxSizer( wx.VERTICAL )
		
		self.m_panelMain = wx.Panel( self, wx.ID_ANY, wx.DefaultPosition, wx.DefaultSize, wx.TAB_TRAVERSAL )
		bSizer1 = wx.BoxSizer( wx.VERTICAL )
		
		self.m_staticText1 = wx.StaticText( self.m_panelMain, wx.ID_ANY, u"KiCAD Main Schematic:", wx.DefaultPosition, wx.DefaultSize, 0 )
		self.m_staticText1.Wrap( -1 )
		bSizer1.Add( self.m_staticText1, 0, wx.ALL|wx.ALIGN_CENTER_HORIZONTAL, 5 )
		
		self.m_KiCAD_proj_picker = wx.FilePickerCtrl( self.m_panelMain, wx.ID_ANY, wx.EmptyString, u"Select a file", u"*.*", wx.DefaultPosition, wx.DefaultSize, wx.FLP_DEFAULT_STYLE )
		bSizer1.Add( self.m_KiCAD_proj_picker, 0, wx.ALL|wx.EXPAND, 10 )
		
		self.m_staticText2 = wx.StaticText( self.m_panelMain, wx.ID_ANY, u"Datasheet Images:", wx.DefaultPosition, wx.DefaultSize, 0 )
		self.m_staticText2.Wrap( -1 )
		bSizer1.Add( self.m_staticText2, 0, wx.ALL|wx.ALIGN_CENTER_HORIZONTAL, 5 )
		
		self.m_ds_imgDir_picker = wx.DirPickerCtrl( self.m_panelMain, wx.ID_ANY, wx.EmptyString, u"Select a folder", wx.DefaultPosition, wx.DefaultSize, wx.DIRP_DEFAULT_STYLE )
		bSizer1.Add( self.m_ds_imgDir_picker, 0, wx.ALL|wx.EXPAND, 10 )
		
		self.m_staticText3 = wx.StaticText( self.m_panelMain, wx.ID_ANY, u"Symbol Datasheet Image Field Entry:", wx.DefaultPosition, wx.DefaultSize, 0 )
		self.m_staticText3.Wrap( -1 )
		bSizer1.Add( self.m_staticText3, 0, wx.ALL|wx.ALIGN_CENTER_HORIZONTAL, 5 )
		
		self.m_fieldSymImgDS = wx.TextCtrl( self.m_panelMain, wx.ID_ANY, u"ds_image_sym", wx.DefaultPosition, wx.DefaultSize, 0 )
		bSizer1.Add( self.m_fieldSymImgDS, 0, wx.ALL|wx.EXPAND, 10 )
		
		self.m_staticText4 = wx.StaticText( self.m_panelMain, wx.ID_ANY, u"Footprint Datasheet Image Field Entry:", wx.DefaultPosition, wx.DefaultSize, 0 )
		self.m_staticText4.Wrap( -1 )
		bSizer1.Add( self.m_staticText4, 0, wx.ALL|wx.ALIGN_CENTER_HORIZONTAL, 5 )
		
		self.m_fieldFpImgDS = wx.TextCtrl( self.m_panelMain, wx.ID_ANY, u"ds_image_fp", wx.DefaultPosition, wx.DefaultSize, 0 )
		bSizer1.Add( self.m_fieldFpImgDS, 0, wx.ALL|wx.EXPAND, 10 )
		
		self.m_staticText5 = wx.StaticText( self.m_panelMain, wx.ID_ANY, u"Symbols to exclude:", wx.DefaultPosition, wx.DefaultSize, 0 )
		self.m_staticText5.Wrap( -1 )
		bSizer1.Add( self.m_staticText5, 0, wx.ALL|wx.ALIGN_CENTER_HORIZONTAL, 5 )
		
		self.m_excludeSyms = wx.TextCtrl( self.m_panelMain, wx.ID_ANY, u"R, C", wx.DefaultPosition, wx.DefaultSize, 0 )
		bSizer1.Add( self.m_excludeSyms, 0, wx.ALL|wx.EXPAND, 10 )
		
		self.m_staticText6 = wx.StaticText( self.m_panelMain, wx.ID_ANY, u"Libraries to exclude", wx.DefaultPosition, wx.DefaultSize, 0 )
		self.m_staticText6.Wrap( -1 )
		bSizer1.Add( self.m_staticText6, 0, wx.ALL|wx.ALIGN_CENTER_HORIZONTAL, 5 )
		
		self.m_excludeLibs = wx.TextCtrl( self.m_panelMain, wx.ID_ANY, u"power", wx.DefaultPosition, wx.DefaultSize, 0 )
		bSizer1.Add( self.m_excludeLibs, 0, wx.ALL|wx.EXPAND, 5 )
		
		self.b_generateHTML = wx.Button( self.m_panelMain, wx.ID_ANY, u"Generate HTML", wx.DefaultPosition, wx.Size( 200,40 ), 0 )
		self.b_generateHTML.SetFont( wx.Font( 13, 70, 90, 90, False, wx.EmptyString ) )
		
		bSizer1.Add( self.b_generateHTML, 0, wx.ALL|wx.ALIGN_CENTER_HORIZONTAL, 5 )
		
		self.m_htmlGenerated = wx.StaticText( self.m_panelMain, wx.ID_ANY, wx.EmptyString, wx.DefaultPosition, wx.DefaultSize, 0 )
		self.m_htmlGenerated.Wrap( -1 )
		self.m_htmlGenerated.SetFont( wx.Font( 15, 70, 90, 92, False, wx.EmptyString ) )
		self.m_htmlGenerated.SetForegroundColour( wx.Colour( 0, 255, 0 ) )
		
		bSizer1.Add( self.m_htmlGenerated, 0, wx.ALL|wx.EXPAND, 5 )
		
		
		self.m_panelMain.SetSizer( bSizer1 )
		self.m_panelMain.Layout()
		bSizer1.Fit( self.m_panelMain )
		bSizerMainFrame.Add( self.m_panelMain, 1, wx.EXPAND |wx.ALL, 0 )
		
		
		bSizerFrameMain.Add( bSizerMainFrame, 1, wx.ALL|wx.EXPAND, 0 )
		
		
		self.SetSizer( bSizerFrameMain )
		self.Layout()
		
		self.Centre( wx.BOTH )
		
		# Connect Events
		self.b_generateHTML.Bind( wx.EVT_BUTTON, self.gui_generateHTML )
	
	def __del__( self ):
		pass
	
	
	# Virtual event handlers, overide them in your derived class
	def gui_generateHTML( self, event ):
		event.Skip()
	

