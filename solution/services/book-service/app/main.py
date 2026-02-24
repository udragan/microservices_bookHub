import app.env

import logging
import asyncio
from fastapi import FastAPI, Depends, status
from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.authorization import JwtUser, get_current_user, get_service_auth
from app.db.migrate import run_migrations
from app.db.database import AsyncSessionLocal
from app.models.book import BookRequestBody
from app.pubsub.heartbeat_publisher import HeartbeatPublisher
from app.route_handlers import create_book, delete_book, get_all_books, internal_get_books_snapshot

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Alembic is sync, so run it in a thread pool
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, run_migrations)
    logging.info("✅ Server listening on port 8003")
    heartbeat = HeartbeatPublisher()
    heartbeat.start()
    yield
    logging.info("👋 Server shutdown.")

app = FastAPI(lifespan=lifespan)


# Dependency to get DB session
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

# endpoints ###########################

@app.post("/", status_code=status.HTTP_201_CREATED)
async def create(book: BookRequestBody,
        jwt: JwtUser = Depends(get_current_user),  
        db: AsyncSession = Depends(get_db)):
    return await create_book(book, jwt, db)

@app.get("/", status_code=status.HTTP_200_OK)
async def get_all(db_sesison: AsyncSession = Depends(get_db)):
    return await get_all_books(db_sesison)

@app.delete("/{bookId}", status_code=status.HTTP_204_NO_CONTENT)
async def delete(bookId: int,
        jwt: JwtUser = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)):    
    return await delete_book(bookId, jwt, db)


@app.get("/internal/snapshot", status_code=status.HTTP_200_OK)
async def internal_get_snapshot(jwt = Depends(get_service_auth),
        db: AsyncSession = Depends(get_db)):
    return await internal_get_books_snapshot(db)

#######################################

