from app.db.connection import get_connection, transaction
from app.schemas import EventChoicePayload, EventChoiceResult
import random

class EventService:
    @staticmethod
    async def generate_event(player_id: int) -> dict | None:
        async with get_connection() as conn:
            # 从事件池中随机选取事件
            rows = await conn.fetch(
                "SELECT id, type, title, description FROM event_templates WHERE active = TRUE"
            )
            if not rows:
                return None
            tpl = random.choice(rows)
            choices = await conn.fetch(
                "SELECT id, label FROM event_choices WHERE event_template_id = $1",
                tpl["id"],
            )
            return {
                "id": random.randint(1, 1_000_000),
                "type": tpl["type"],
                "title": tpl["title"],
                "description": tpl["description"],
                "choices": [{"id": c["id"], "label": c["label"]} for c in choices],
                "timestamp": "",
            }

    @staticmethod
    async def apply_choice(payload: EventChoicePayload) -> EventChoiceResult:
        async with transaction() as conn:
            # 根据 choiceId 查找结果并应用
            row = await conn.fetchrow(
                "SELECT outcome_description, effect_sql FROM event_choices WHERE id = $1",
                payload.choiceId,
            )
            if not row:
                raise ValueError("Invalid choice")
            # 占位：实际应执行 effect_sql 或调用存储过程
            return EventChoiceResult(
                success=True,
                outcomeDescription=row["outcome_description"] or "Event resolved",
            )
