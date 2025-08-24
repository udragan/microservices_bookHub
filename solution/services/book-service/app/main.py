import app.env

import logging
import asyncio
from fastapi import FastAPI, Depends, HTTPException, status
from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.migrate import run_migrations
from app.db.database import AsyncSessionLocal
from app.db.models.book import Book
from app.auth.authorization import JwtUser, get_current_user, is_admin
from app.pubsub.publisher import publish_message
from app.schemas.book import BookRequestBody, BookSchema

@asynccontextmanager
async def lifespan(app: FastAPI):
    # log all env
    # Alembic is sync, so run it in a thread pool
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, run_migrations)
    logging.info("✅ Server listening on port 8003")
    yield
    logging.info("👋 Server shutdown.")

app = FastAPI(lifespan=lifespan)


# Dependency to get DB session
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

# endpoints ###########################

@app.post("/")
async def create_book(book: BookRequestBody,
        jwt: JwtUser = Depends(get_current_user),  
        db: AsyncSession = Depends(get_db)):
    if not is_admin(jwt):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have permission to perform this action.")
    
    new_book = Book(title=book.title, author=book.author)
    db.add(new_book)
    await db.commit()
    await db.refresh(new_book)

    brokerBook = BookSchema.model_validate(new_book)
    publish_message("book.created", brokerBook.model_dump_json())
    
    return new_book

@app.get("/")
async def list_books(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Book))
    return result.scalars().all()
