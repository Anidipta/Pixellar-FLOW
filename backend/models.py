from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


class User(SQLModel, table=True):
    """Maps to users table in database.sql"""
    __tablename__ = "users"
    id: Optional[int] = Field(default=None, primary_key=True)
    wallet_address: str = Field(index=True, nullable=False, sa_column_kwargs={"unique": True})
    profile_url: str = Field(nullable=False, sa_column_kwargs={"unique": True}, max_length=9)
    username: Optional[str] = Field(default=None, index=True)
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

    artworks: List["Artwork"] = Relationship(back_populates="creator")


class Artwork(SQLModel, table=True):
    """Maps to artworks table in database.sql"""
    __tablename__ = "artworks"
    id: Optional[int] = Field(default=None, primary_key=True)
    artwork_code: str = Field(nullable=False, sa_column_kwargs={"unique": True}, max_length=14)
    creator_id: int = Field(foreign_key="users.id", nullable=False)
    creator_wallet: str = Field(nullable=False)
    title: str = Field(nullable=False)
    description: Optional[str] = None
    pixel_data: str = Field(nullable=False)
    width: int = Field(nullable=False)
    height: int = Field(nullable=False)
    unlock_password: str = Field(nullable=False, max_length=6)
    price_flow: Optional[float] = None
    publish_fee: Optional[float] = None
    is_published: Optional[bool] = Field(default=False)
    nft_id: Optional[int] = None
    thumbnail_url: Optional[str] = None
    views_count: Optional[int] = Field(default=0)
    likes_count: Optional[int] = Field(default=0)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    published_at: Optional[datetime] = None
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

    creator: Optional[User] = Relationship(back_populates="artworks")


class Purchase(SQLModel, table=True):
    __tablename__ = "purchases"
    id: Optional[int] = Field(default=None, primary_key=True)
    artwork_id: int = Field(foreign_key="artworks.id", nullable=False)
    buyer_id: int = Field(foreign_key="users.id", nullable=False)
    buyer_wallet: str = Field(nullable=False)
    seller_wallet: str = Field(nullable=False)
    price_flow: float = Field(nullable=False)
    transaction_hash: Optional[str] = None
    purchased_at: Optional[datetime] = Field(default_factory=datetime.utcnow)


class Like(SQLModel, table=True):
    __tablename__ = "likes"
    id: Optional[int] = Field(default=None, primary_key=True)
    artwork_id: int = Field(foreign_key="artworks.id", nullable=False)
    user_id: int = Field(foreign_key="users.id", nullable=False)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)


class Comment(SQLModel, table=True):
    __tablename__ = "comments"
    id: Optional[int] = Field(default=None, primary_key=True)
    artwork_id: int = Field(foreign_key="artworks.id", nullable=False)
    user_id: int = Field(foreign_key="users.id", nullable=False)
    comment_text: str = Field(nullable=False)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)


class PasswordUnlock(SQLModel, table=True):
    __tablename__ = "password_unlocks"
    id: Optional[int] = Field(default=None, primary_key=True)
    artwork_id: int = Field(foreign_key="artworks.id", nullable=False)
    user_id: int = Field(foreign_key="users.id", nullable=False)
    unlocked_at: Optional[datetime] = Field(default_factory=datetime.utcnow)


class SalesAnalytics(SQLModel, table=True):
    __tablename__ = "sales_analytics"
    id: Optional[int] = Field(default=None, primary_key=True)
    seller_id: int = Field(foreign_key="users.id", nullable=False)
    artwork_id: int = Field(foreign_key="artworks.id", nullable=False)
    total_sales: Optional[int] = Field(default=0)
    total_revenue_flow: Optional[float] = Field(default=0.0)
    last_sale_at: Optional[datetime] = None
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
