from sqlmodel import Field, SQLModel


class UserToFriend(SQLModel, table=True):
    id: int = Field(primary_key=True)
    username: str = Field()
    friend_username: str = Field()
