from dataclasses import dataclass, field
from enum import Enum
from .Vec2D import Vec2D

class GeometryShapeType(Enum):
    Undefined       = 0
    SymbolRectangle = 1
    SymbolPolyline  = 2
    SymbolCircle    = 3
    SymbolArc       = 4
    SymbolPin       = 5
    FP_Rectangle    = 6
    FP_Polyline     = 7
    FP_Circle       = 8
    FP_Arc          = 9
    FP_Pad          = 10

class PadType(Enum):
    Undefined = 0
    THT       = 1
    SMD       = 2
    NP_THT    = 3


class PadGeometry(Enum):
    Undefined    = 0
    PadCircle    = 1
    PadOval      = 2
    PadRect      = 3
    PadTrapezoid = 4
    PadRoundRect = 5
    PadCustom    = 6 #NOT IMPLEMENTED YET

@dataclass
class GeometryShape:
   
    type: GeometryShapeType = GeometryShapeType.Undefined

    # Symbol Rectangle, fp_rect and fp_line
    start: Vec2D = field(default_factory=lambda: Vec2D(0,0))
    end: Vec2D = field(default_factory=lambda: Vec2D(0,0))

    # Symbol Polyline and fp_poly
    points: list[Vec2D] = field(default_factory=list)

    # Symbol Circle and fp_circle
    # fp_circle uses a center coord, and for some weird reasons 
    # an "end" coordinate, while parsing the data the "end" field
    # gets recalculated to radius and saved, but end is still 
    # saved too. Basically the end coordinate is the point on the
    # diameter set during drawing
    center: Vec2D = field(default_factory=lambda: Vec2D(0,0))
    radius: float = 0.0

    # Symbol Arc and fp_arc (uses start and end too)
    mid: float = 0.0

    # all except pin, pad fp_line and fp_arc
    stroke_width: float = 0.0
    stroke_type: str = ""
    fill_type: str = ""

    # for fp geometry and pads
    layer: str = ""

    # Pin and Pad
    name: str = ""
    number: str = ""
    position: Vec2D = field(default_factory=lambda: Vec2D(0,0))
    rotation: float = 0.0

    # Pin
    length: float = 0.0

    # all Pads
    padType: PadType = PadType.Undefined
    padGeometry: PadGeometry = PadGeometry.Undefined
    size: Vec2D = field(default_factory=lambda: Vec2D(0,0))
    pad_layer: list[str] = field(default_factory=list)

    # Pad (NP_)THT
    drill: Vec2D = field(default_factory=lambda: Vec2D(0,0))

    # Pad Trapezoid
    rect_delta: Vec2D = field(default_factory=lambda: Vec2D(0,0))

    # Pad RoundRect
    roundrect_rratio: float = 0.0

    # Chamfered Corners at for RoundRect
    chamfer_ratio: float = 0.0
    chamfer: list[str] = field(default_factory=list)

    def toDict(self):
        return {
            "type":             self.type.name,
            "start":            self.start,
            "end":              self.end,
            "points":           self.points,
            "center":           self.center,
            "radius":           self.radius,
            "mid":              self.mid,
            "stroke_width":     self.stroke_width,
            "stroke_type":      self.stroke_type,
            "fill_type":        self.fill_type,
            "layer":            self.layer,
            "name":             self.name,
            "number":           self.number,
            "position":         self.position,
            "rotation":         self.rotation,
            "length":           self.length,
            "padType":          self.padType.name,
            "padGeometry":      self.padGeometry.name,
            "size":             self.size,
            "pad_layer":        self.pad_layer,
            "drill":            self.drill,
            "rect_delta":       self.rect_delta,
            "roundrect_rratio": self.roundrect_rratio,
            "chamfer_ratio":    self.chamfer_ratio,
            "chamfer":          self.chamfer
        }