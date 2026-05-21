from pydantic import BaseModel

class MoveRequest(BaseModel):
    playerId: int
    targetPlanetId: int

class MoveResult(BaseModel):
    success: bool
    newPlanetId: int
    travelCost: int
