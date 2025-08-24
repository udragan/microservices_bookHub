from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.authorization import JwtUser, is_admin
from app.db.modelsdb.book import Book
from app.pubsub.publisher import publish_message
from app.schemas.book import BookRequestBody, BookSchema


async def create_book(book: BookRequestBody,
        jwt: JwtUser,  
        db: AsyncSession):
    if not is_admin(jwt):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions!")
    
    new_book = Book(title=book.title, author=book.author)
    db.add(new_book)
    await db.commit()
    await db.refresh(new_book)

    brokerBook = BookSchema.model_validate(new_book)
    publish_message("book.created", brokerBook.model_dump_json())
    
    return new_book

async def get_all_books(db_session: AsyncSession):
    result = await db_session.execute(select(Book))
    return result.scalars().all()

async def delete_book(bookId: int,
        jwt: JwtUser ,
        db: AsyncSession):
    if not is_admin(jwt):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions!")    
    item = await db.get(Book, bookId)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Entity with id: {bookId} not found!")
    await db.delete(item)
    await db.commit()
