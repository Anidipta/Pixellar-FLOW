from typing import List, Optional, Union
from sqlmodel import Session, select
import models, database


def get_user(db: Session, user_id: int) -> Optional[models.User]:
    return db.get(models.User, user_id)


def get_user_by_username(db: Session, username: str) -> Optional[models.User]:
    statement = select(models.User).where(models.User.username == username)
    return db.exec(statement).first()


def get_user_by_wallet(db: Session, wallet_address: str) -> Optional[models.User]:
    statement = select(models.User).where(models.User.wallet_address == wallet_address)
    return db.exec(statement).first()


def _generate_profile_url(db: Session, base: str | None = None) -> str:
    import random, string

    attempts = 0
    base_chars = (base or "").replace("0x", "")
    while attempts < 100:
        rnd = ''.join(random.choices(string.ascii_letters + string.digits, k=9))
        candidate = (base_chars[:3] + rnd[3:])[:9] if base_chars else rnd
        # ensure uniqueness
        stmt = select(models.User).where(models.User.profile_url == candidate)
        existing = db.exec(stmt).first()
        if not existing:
            return candidate
        attempts += 1
    # fallback: timestamp-based
    from time import time
    return f'p{int(time()) % 100000000:08d}'[:9]


def create_user(db: Session, user: Union[models.User, dict]) -> models.User:
    """Create or return an existing user. If multiple users exist with the same wallet_address,
    keep the oldest (smallest created_at) and delete the others.
    """
    # Normalize incoming data
    data = {}
    if isinstance(user, models.User):
        data = user.dict()
    else:
        data = dict(user or {})

    wallet = data.get('wallet_address')
    if wallet:
        wallet = wallet.lower()
        data['wallet_address'] = wallet

    # If wallet provided, check for existing users with this wallet
    if wallet:
        stmt = select(models.User).where(models.User.wallet_address == wallet).order_by(models.User.created_at)
        rows = db.exec(stmt).all()
        if rows:
            # Keep the oldest, delete duplicates
            oldest = rows[0]
            duplicates = rows[1:]
            for dup in duplicates:
                try:
                    db.delete(dup)
                except Exception:
                    pass
            db.commit()
            db.refresh(oldest)
            return oldest

    # Prepare fields for new user
    # Ensure profile_url exists
    if 'profile_url' not in data or not data.get('profile_url'):
        base = data.get('username') or data.get('wallet_address')
        # generate unique profile_url
        data['profile_url'] = _generate_profile_url(db, base)

    # Fill created_at if missing
    if 'created_at' not in data or data.get('created_at') is None:
        data['created_at'] = None

    # Build model instance
    allowed_keys = {k for k in models.User.__fields__.keys()}
    model_kwargs = {k: v for k, v in data.items() if k in allowed_keys}
    u = models.User(**model_kwargs)
    db.add(u)
    db.commit()
    db.refresh(u)
    return u


def list_users(db: Session, limit: int = 100, offset: int = 0) -> List[models.User]:
    statement = select(models.User).offset(offset).limit(limit)
    return db.exec(statement).all()


def get_user_by_profile(db: Session, profile_url: str) -> Optional[models.User]:
    statement = select(models.User).where(models.User.profile_url == profile_url)
    return db.exec(statement).first()


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
        statement = statement.where(models.Artwork.creator_id == owner_id)
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
