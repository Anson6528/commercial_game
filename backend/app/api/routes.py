from fastapi import APIRouter, HTTPException
from app.schemas import (
    PlayerStatus,
    CargoItem,
    TradeRequest,
    TradeResult,
    MoveRequest,
    MoveResult,
    EventChoicePayload,
    EventChoiceResult,
)
from app.services import TradeService, WantedService, EventService
from app.db.connection import get_connection

router = APIRouter()

@router.get("/players/{player_id}/status", response_model=PlayerStatus)
async def get_player_status(player_id: int):
    async with get_connection() as conn:
        row = await conn.fetchrow(
            "SELECT id, name, credits, planet_id, wanted_level FROM players WHERE id = $1",
            player_id,
        )
        if not row:
            raise HTTPException(status_code=404, detail="Player not found")
        cargo_rows = await conn.fetch(
            "SELECT commodity_id, quantity FROM player_cargo WHERE player_id = $1",
            player_id,
        )
        cargo = [
            CargoItem(
                commodityId=c["commodity_id"],
                commodityName=f"Commodity-{c['commodity_id']}",
                quantity=c["quantity"],
            )
            for c in cargo_rows
        ]
        return PlayerStatus(
            id=row["id"],
            name=row["name"],
            credits=row["credits"],
            currentPlanetId=row["planet_id"],
            cargo=cargo,
            wantedLevel=row["wanted_level"],
        )

@router.post("/trade", response_model=TradeResult)
async def trade(req: TradeRequest):
    try:
        result = await TradeService.execute_trade(req)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/move", response_model=MoveResult)
async def move(req: MoveRequest):
    async with get_connection() as conn:
        # 简单校验并更新位置
        row = await conn.fetchrow(
            "SELECT planet_id FROM players WHERE id = $1", req.playerId
        )
        if not row:
            raise HTTPException(status_code=404, detail="Player not found")
        await conn.execute(
            "UPDATE players SET planet_id = $1 WHERE id = $2",
            req.targetPlanetId,
            req.playerId,
        )
        return MoveResult(
            success=True,
            newPlanetId=req.targetPlanetId,
            travelCost=0,
        )

@router.post("/event/choice", response_model=EventChoiceResult)
async def event_choice(payload: EventChoicePayload):
    try:
        return await EventService.apply_choice(payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/players/{player_id}/wanted")
async def get_wanted_level(player_id: int):
    level = await WantedService.recalculate_wanted_level(player_id)
    return {"playerId": player_id, "wantedLevel": level}
