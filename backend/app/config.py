from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = "postgresql://shu:database%40123@127.0.0.1:5432/opengauss_commercial_game"
    app_name: str = "星际贸易模拟游戏后端"
    debug: bool = True
    ws_url: str = "ws://localhost:8000/ws"

    class Config:
        env_file = ".env"

settings = Settings()
