from typing import List, Optional
from sqlmodel import Session, select
import models, database


def get_user(db: Session, user_id: int) -> Optional[models.User]:
    return db.get(models.User, user_id)


def get_user_by_username(db: Session, username: str) -> Optional[models.User]:
    statement = select(models.User).where(models.User.username == username)
    return db.exec(statement).first()


def create_user(db: Session, user: models.User) -> models.User:
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def list_users(db: Session, limit: int = 100, offset: int = 0) -> List[models.User]:
    statement = select(models.User).offset(offset).limit(limit)
    return db.exec(statement).all()


def delete_user(db: Session, user_id: int) -> bool:
    user = get_user(db, user_id)
    if not user:
        return False
    db.delete(user)
    db.commit()
    return True

# Artworks

def get_artwork(db: Session, artwork_id: int) -> Optional[models.Artwork]:
    return db.get(models.Artwork, artwork_id)


def list_artworks(db: Session, owner_id: Optional[int] = None, limit: int = 100, offset: int = 0) -> List[models.Artwork]:
    statement = select(models.Artwork)
    if owner_id is not None:
        statement = statement.where(models.Artwork.owner_id == owner_id)
    statement = statement.offset(offset).limit(limit)
    return db.exec(statement).all()


def create_artwork(db: Session, artwork: models.Artwork) -> models.Artwork:
    db.add(artwork)
    db.commit()
    db.refresh(artwork)
    return artwork


def update_artwork(db: Session, artwork_id: int, **kwargs) -> Optional[models.Artwork]:
    artwork = get_artwork(db, artwork_id)
    if not artwork:
        return None
    for k, v in kwargs.items():
        if hasattr(artwork, k) and v is not None:
            setattr(artwork, k, v)
    db.add(artwork)
    db.commit()
    db.refresh(artwork)
    return artwork


def delete_artwork(db: Session, artwork_id: int) -> bool:
    artwork = get_artwork(db, artwork_id)
    if not artwork:
        return False
    db.delete(artwork)
    db.commit()
    return True
