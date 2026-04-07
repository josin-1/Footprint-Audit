from dataclasses import dataclass, field
from GeometryShape import GeometryShape

@dataclass
class ComponentEntry:
    refs: list = field(default_factory=list)
    val: str = ""
    lib_name: str = ""
    lib_id: str = ""
    footprint: str = ""
    layer: str = ""
    ds_image_sym: str = ""
    ds_image_fp: str = ""
    symbol_geometry: list[GeometryShape] = field(default_factory=list)
    footprint_geometry: list[GeometryShape] = field(default_factory=list)


    def __eq__(self, a):
        return (self.val         == a.val       and
                (self.lib_id   == a.lib_id or 
                 self.lib_name == a.lib_name)   and
                self.footprint   == a.footprint
                )
    
    def __hash__(self):
        return hash((self.val, self.getLib(), self.getName(),
                     self.getFP_lib(), self.getFP_name()))
    
    def getLib(self):
        return self.lib_id.split(':')[0]

    def getName(self):
        return self.lib_id.split(':')[1]
    
    def getFP_lib(self):
        return self.footprint.split(':')[0]

    def getFP_name(self):
        if len(self.footprint.split(':')) > 1:
            return self.footprint.split(':')[1]
        else:
            return self.getFP_lib