from sqlmodel import Field, SQLModel


class Room(SQLModel, table=True):
    id: int = Field(primary_key=True)
    game_id: int = Field()
