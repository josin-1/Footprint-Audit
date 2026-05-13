import os
import time

class Logger():
    def default(self, kicad_proj_dir, cli = True):
        self.cli = cli
        if not os.path.exists(os.path.abspath(kicad_proj_dir + '/FP_Audit')):
            os.mkdir(os.path.abspath(kicad_proj_dir + '/FP_Audit'))
    
        self.f = open(os.path.abspath(kicad_proj_dir + '/FP_Audit/log.txt'), 'a')
