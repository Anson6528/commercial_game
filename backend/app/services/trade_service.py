from app.db.connection import transaction
from app.schemas import TradeRequest, TradeResult

class TradeService:
    @staticmethod
    async def execute_trade(req: TradeRequest) -> TradeResult:
        async with transaction() as conn:
            # 调用数据库存储过程或执行事务内的SQL
            # 这里为框架示例，v0.1 迭代将填充具体SQL
            row = await conn.fetchrow(
                """
                SELECT credits, planet_id FROM players WHERE id = $1
                """,
                req.playerId,
            )
            if not row:
                raise ValueError("Player not found")

            # 占位：实际应调用数据库事务完成买卖、更新库存、触发涟漪
            new_credits = row["credits"] - 100
            new_planet = row["planet_id"]

            # 模拟更新
            await conn.execute(
                """
                UPDATE players SET credits = $1 WHERE id = $2
                """,
                new_credits,
                req.playerId,
            )

            return TradeResult(
                success=True,
                newCredits=new_credits,
                newCargo=[],
                transactionLogId=0,
            )
