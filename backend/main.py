from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session
from typing import List
from pydantic import BaseModel

from contextlib import asynccontextmanager

import database, models, crud


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    database.init_db()
    try:
        yield
    finally:
        # Place for shutdown actions if needed in future
        pass


app = FastAPI(title="Pixellar-FLOW Backend", lifespan=lifespan)

# Allow local frontend (Next) to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Dependency
def get_db():
    with database.SessionLocal() as session:
        yield session


# Users
class UserCreate(BaseModel):
    username: str | None = None
    email: str | None = None
    display_name: str | None = None
    wallet_address: str | None = None


@app.post("/users/", response_model=models.User)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # prefer username lookup, else wallet lookup
    existing = None
    if user.username:
        existing = crud.get_user_by_username(db, user.username)
    if not existing and user.wallet_address:
        existing = crud.get_user_by_wallet(db, user.wallet_address)

    if existing:
        return existing

    # Build minimal user data for DB
    payload = {
        "username": user.username,
        "wallet_address": user.wallet_address or ("0x" + (user.username or "")).lower(),
        # profile_url will be generated in crud.create_user if missing
    }
    return crud.create_user(db, payload)


@app.get("/users/", response_model=List[models.User])
def read_users(limit: int = 100, offset: int = 0, db: Session = Depends(get_db)):
    return crud.list_users(db, limit=limit, offset=offset)


@app.get("/users/{user_id}", response_model=models.User)
def read_user(user_id: int, db: Session = Depends(get_db)):
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    success = crud.delete_user(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"ok": True}


# Artworks
@app.post("/artworks/", response_model=models.Artwork)
class ArtworkCreate(BaseModel):
    title: str
    description: str | None = None
    image_url: str | None = None
    price_cents: int | None = None
    is_published: bool = False
    owner_id: int | None = None


@app.post("/artworks/", response_model=models.Artwork)
def create_artwork(artwork: ArtworkCreate, db: Session = Depends(get_db)):
    # ensure owner exists if provided
    if artwork.owner_id is not None and not crud.get_user(db, artwork.owner_id):
        raise HTTPException(status_code=400, detail="Owner (user) not found")

    # map incoming payload to Artwork model fields; fill required defaults
    price_flow = None
    if artwork.price_cents is not None:
        price_flow = float(artwork.price_cents) / 100.0
    else:
        price_flow = 0.0

    art = models.Artwork(
        artwork_code=(artwork.title[:9] or "art") + "00001",
        creator_id=artwork.owner_id or 0,
        creator_wallet="",
        title=artwork.title,
        description=artwork.description or "",
        pixel_data="[]",
        width=64,
        height=64,
        unlock_password="000000",
        price_flow=price_flow,
        publish_fee=0.0,
        is_published=artwork.is_published,
        thumbnail_url=artwork.image_url or "",
    )
    return crud.create_artwork(db, art)


@app.get("/artworks/", response_model=List[models.Artwork])
def read_artworks(owner_id: int | None = None, limit: int = 100, offset: int = 0, db: Session = Depends(get_db)):
    return crud.list_artworks(db, owner_id=owner_id, limit=limit, offset=offset)


@app.get("/artworks/{artwork_id}", response_model=models.Artwork)
def read_artwork(artwork_id: int, db: Session = Depends(get_db)):
    artwork = crud.get_artwork(db, artwork_id)
    if not artwork:
        raise HTTPException(status_code=404, detail="Artwork not found")
    return artwork


@app.patch("/artworks/{artwork_id}", response_model=models.Artwork)
def patch_artwork(artwork_id: int, artwork: models.Artwork, db: Session = Depends(get_db)):
    updated = crud.update_artwork(db, artwork_id, **artwork.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Artwork not found")
    return updated


@app.delete("/artworks/{artwork_id}")
def delete_artwork(artwork_id: int, db: Session = Depends(get_db)):
    success = crud.delete_artwork(db, artwork_id)
    if not success:
        raise HTTPException(status_code=404, detail="Artwork not found")
    return {"ok": True}

@app.get("/")
def main():
    return {"message": "Welcome to the Pixellar-FLOW Backend API!",
            "endpoints": {
                "users": {
                    "create_user": "/users/ [POST]",
                    "list_users": "/users/ [GET]",
                    "get_user": "/users/{user_id} [GET]",
                    "delete_user": "/users/{user_id} [DELETE]"
                },
                "artworks": {
                    "create_artwork": "/artworks/ [POST]",
                    "list_artworks": "/artworks/ [GET]",
                    "get_artwork": "/artworks/{artwork_id} [GET]",
                    "update_artwork": "/artworks/{artwork_id} [PATCH]",
                    "delete_artwork": "/artworks/{artwork_id} [DELETE]"
                }
            }
            }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)