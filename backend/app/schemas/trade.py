from pydantic import BaseModel
from typing import List

class TradeRequest(BaseModel):
    playerId: int
    planetId: int
    commodityId: int
    quantity: int
    tradeType: str  # 'buy' or 'sell'

class CargoItem(BaseModel):
    commodityId: int
    commodityName: str
    quantity: int

class TradeResult(BaseModel):
    success: bool
    newCredits: int
    newCargo: List[CargoItem]
    transactionLogId: int
