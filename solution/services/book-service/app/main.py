# main.py
import app.env

from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.database import AsyncSessionLocal, engine, Base
from app.models.book import Book
from app.schemas.book import BookCreate

app = FastAPI()

# Create tables on startup (for dev/demo only)
@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Dependency to get DB session
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

@app.post("/books/")
async def create_book(book: BookCreate, db: AsyncSession = Depends(get_db)):
    new_book = Book(name=book.name, author=book.author)
    db.add(new_book)
    await db.commit()
    await db.refresh(new_book)
    return new_book

@app.get("/books/")
async def list_books(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Book))
    return result.scalars().all()
