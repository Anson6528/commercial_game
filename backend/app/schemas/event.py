from pydantic import BaseModel
from typing import List

class EventChoice(BaseModel):
    id: int
    label: str

class GameEvent(BaseModel):
    id: int
    type: str
    title: str
    description: str
    choices: List[EventChoice]
    timestamp: str

class EventChoicePayload(BaseModel):
    playerId: int
    eventId: int
    choiceId: int

class EventChoiceResult(BaseModel):
    success: bool
    outcomeDescription: str
