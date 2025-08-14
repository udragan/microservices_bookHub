import app.env

import logging
import asyncio
from fastapi import FastAPI, Depends, HTTPException, status
from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.migrate import run_migrations
from app.auth.authorization import JwtUser, get_current_user, is_admin
from app.db.database import AsyncSessionLocal
from app.db.models.book import Book
from app.schemas.book import BookRequestBody, BookSchema
from app.pubsub.publisher import publish_message

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s:  %(name)s: %(message)s",
    handlers=[logging.StreamHandler()]
)

@asynccontextmanager
async def lifespan(app: FastAPI):
     # Alembic is sync, so run it in a thread pool
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, run_migrations)
    yield
    print("👋 App shutdown.")

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
    return new_book

@app.get("/")
async def list_books(db: AsyncSession = Depends(get_db)):
    # test publish
    book = BookSchema.model_validate(Book(id=1, title="testTopic", author='Someone'))
    publish_message("book.created", book.model_dump())
    result = await db.execute(select(Book))
    return result.scalars().all()
