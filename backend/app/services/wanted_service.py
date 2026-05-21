from app.db.connection import get_connection

class WantedService:
    @staticmethod
    async def get_suspicion(player_id: int) -> float:
        async with get_connection() as conn:
            row = await conn.fetchrow(
                """
                SELECT COALESCE(AVG(suspicion_score), 0) AS avg_score
                FROM player_transactions
                WHERE player_id = $1
                """,
                player_id,
            )
            return float(row["avg_score"]) if row else 0.0

    @staticmethod
    async def recalculate_wanted_level(player_id: int) -> int:
        async with get_connection() as conn:
            # 窗口函数或聚合查询计算可疑度，映射到通缉等级
            row = await conn.fetchrow(
                """
                SELECT
                    COUNT(*) AS total_tx,
                    SUM(CASE WHEN commodity_id IN (SELECT id FROM illegal_commodities) THEN quantity ELSE 0 END) AS illegal_qty
                FROM transaction_log
                WHERE player_id = $1
                  AND created_at > NOW() - INTERVAL '7 days'
                """,
                player_id,
            )
            total = row["total_tx"] if row else 0
            illegal = row["illegal_qty"] if row else 0
            level = min(10, int(illegal / max(total, 1) * 10))
            await conn.execute(
                "UPDATE players SET wanted_level = $1 WHERE id = $2",
                level,
                player_id,
            )
            return level
