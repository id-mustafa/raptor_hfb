from sqlmodel import Field, SQLModel


class Request(SQLModel, table=True):
    id: int = Field(primary_key=True)
    username1: str = Field()
    username2: str = Field()
