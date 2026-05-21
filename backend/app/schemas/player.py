from pydantic import BaseModel
from typing import List

class CargoItem(BaseModel):
    commodityId: int
    commodityName: str
    quantity: int

class PlayerStatus(BaseModel):
    id: int
    name: str
    credits: int
    currentPlanetId: int
    cargo: List[CargoItem]
    wantedLevel: int
