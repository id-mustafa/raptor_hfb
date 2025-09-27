from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    username: str = Field(primary_key=True)
    room_id: int = Field(default=None)
    token: str = Field(default=0)
