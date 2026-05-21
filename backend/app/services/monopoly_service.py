from app.db.connection import get_connection

class MonopolyService:
    @staticmethod
    async def check_monopoly(player_id: int) -> bool:
        async with get_connection() as conn:
            row = await conn.fetchrow(
                """
                SELECT COUNT(DISTINCT commodity_id) AS controlled
                FROM (
                    SELECT commodity_id, SUM(quantity) AS total
                    FROM player_cargo
                    WHERE player_id = $1
                    GROUP BY commodity_id
                    HAVING SUM(quantity) > (
                        SELECT threshold FROM monopoly_thresholds WHERE commodity_id = player_cargo.commodity_id
                    )
                ) sub
                """,
                player_id,
            )
            controlled = row["controlled"] if row else 0
            return controlled >= 3  # 示例：控制3种以上商品即垄断

    @staticmethod
    async def run_scheduled_check() -> None:
        async with get_connection() as conn:
            await conn.execute(
                """
                UPDATE players
                SET monopoly_victory = TRUE
                WHERE id IN (
                    SELECT player_id FROM (
                        SELECT player_id, COUNT(DISTINCT commodity_id) AS c
                        FROM player_cargo
                        GROUP BY player_id
                        HAVING COUNT(DISTINCT commodity_id) >= 3
                    ) sub
                )
                """
            )
