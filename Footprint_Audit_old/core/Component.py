import json
import base64
from dataclasses import dataclass, field, asdict
from .GeometryShape import GeometryShape
from .Vec2D import Vec2D


class ComponentEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, GeometryShape):
            return obj.toDict()
        if isinstance(obj, Vec2D):
            return obj.toDict()
        # Let the base class default method raise the TypeError
        return super().default(obj)

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

    def toJSON(self, indent=None):
        
        try:
            with open(self.ds_image_sym, "rb") as f:
                ds_image_sym_b64str = "data:image/png;base64," + base64.standard_b64encode(f.read()).decode("utf-8")
            with open(self.ds_image_fp, "rb") as f:
                ds_image_fp_b64str = "data:image/png;base64," + base64.standard_b64encode(f.read()).decode("utf-8")
        except FileNotFoundError: 
            ds_image_sym_b64str = ""
            ds_image_fp_b64str = ""
            
        return json.dumps({
            "refs":             self.refs,
            "val":              self.val,
            "lib_name":         self.lib_name,
            "lib_id":           self.lib_id,
            "footprint":        self.footprint,
            "layer":            self.layer,
            "ds_image_sym":     ds_image_sym_b64str,
            "ds_image_fp":      ds_image_fp_b64str,
            "symbol_geometry":  self.symbol_geometry
        },  indent=indent, cls=ComponentEncoder)


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
    
    def getSymImageBase64(self):
        print("Hello")