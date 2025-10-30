from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    email: str = Field(index=True, unique=True)
    display_name: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    artworks: List["Artwork"] = Relationship(back_populates="owner")


class Artwork(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    price_cents: Optional[int] = None
    is_published: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    owner_id: Optional[int] = Field(default=None, foreign_key="user.id")
    owner: Optional[User] = Relationship(back_populates="artworks")
