#!/usr/bin/env python3
"""
数据库一键初始化脚本
用法:
    cd backend
    python scripts/init_database.py

功能:
    1. 读取 app/db/init_db.sql
    2. 按分号分割 SQL 语句并逐条执行
    3. 自动跳过已存在的表（DROP TABLE IF EXISTS 已处理）
    4. 输出执行结果与数据汇总

环境要求:
    - OpenGauss / PostgreSQL 已启动
    - .env 文件已配置正确的 DATABASE_URL
    - 数据库用户拥有 public schema 的 CREATE 权限
"""

import asyncio
import os
import sys

# 将 backend 目录加入路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.connection import get_connection, init_pool, close_pool

SQL_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "app", "db", "init_db.sql")


async def execute_sql_file():
    """读取 SQL 文件并逐条执行"""
    if not os.path.exists(SQL_FILE):
        print(f"[ERROR] SQL 文件不存在: {SQL_FILE}")
        sys.exit(1)

    with open(SQL_FILE, "r", encoding="utf-8") as f:
        sql_content = f.read()

    # 按分号分割语句，过滤纯注释和空行
    raw_statements = [s.strip() for s in sql_content.split(";") if s.strip()]
    statements = []
    for stmt in raw_statements:
        # 跳过纯注释块
        lines = [ln for ln in stmt.splitlines() if ln.strip() and not ln.strip().startswith("--")]
        if lines:
            statements.append(stmt)

    print(f"[INFO] 共解析出 {len(statements)} 条 SQL 语句")

    await init_pool()
    try:
        async with get_connection() as conn:
            success = 0
            skipped = 0
            for i, stmt in enumerate(statements, 1):
                try:
                    await conn.execute(stmt)
                    success += 1
                except Exception as e:
                    err_msg = str(e).lower()
                    # 忽略 "already exists" 和 "does not exist" 类错误
                    if "already exists" in err_msg or "does not exist" in err_msg:
                        skipped += 1
                    else:
                        print(f"[WARN] 第 {i} 条语句执行失败: {e}")
                        skipped += 1

            print(f"[INFO] 执行成功: {success} 条, 跳过/已存在: {skipped} 条")

            # 数据汇总
            tables = [
                "space_stations", "goods", "players", "trade_routes",
                "station_inventory", "player_cargo", "warehouse_inventory",
                "transaction_logs", "galaxy_events", "event_effects",
                "event_choices", "player_encounters", "wanted_list"
            ]
            print("\n[INFO] ===== 数据表状态 =====")
            for table in tables:
                try:
                    count = await conn.fetchval(f"SELECT COUNT(*) FROM {table}")
                    print(f"  {table:<30} {count:>6} 行")
                except Exception:
                    print(f"  {table:<30}  [未创建]")
            print("[INFO] =====================\n")

        print("[OK] 数据库初始化完成！")
    finally:
        await close_pool()


if __name__ == "__main__":
    print("[INFO] 开始初始化数据库...")
    print(f"[INFO] SQL 文件: {SQL_FILE}")
    asyncio.run(execute_sql_file())
