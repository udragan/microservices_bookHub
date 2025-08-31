from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.authorization import JwtUser, is_admin
from app.db.modelsdb.book import Book
from app.pubsub.publisher import publish_message
from app.models.book import BookRequestBody
from app.models.dtos.book_dto import BookDto

async def create_book(book: BookRequestBody,
        jwt: JwtUser,  
        db: AsyncSession):
    if not is_admin(jwt):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions!")
    
    result = Book(title=book.title, author=book.author)
    db.add(result)
    await db.commit()
    await db.refresh(result)
    publish_message("book.created", BookDto.model_validate(result).model_dump_json())    
    return result

async def get_all_books(db_session: AsyncSession):
    items = await db_session.execute(select(Book)
        .where(Book.isDeleted == False))
    result = [BookDto.model_validate(item) for item in items.scalars().all()]
    return result

async def delete_book(bookId: int,
        jwt: JwtUser ,
        db: AsyncSession):
    if not is_admin(jwt):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions!")    
    item = await db.get(Book, bookId)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Entity with id: {bookId} not found!")
    item.isDeleted = True
    await db.commit()

    brokerBook = BookDto.model_validate(item)
    publish_message("book.deleted", brokerBook.model_dump_json())

async def internal_get_books_snapshot(db_session: AsyncSession):
    # TODO_faja: create a slim dto for sync instead of entire Book
    items = await db_session.execute(select(Book))
    result = [BookDto.model_validate(item) for item in items.scalars().all()]
    return result
