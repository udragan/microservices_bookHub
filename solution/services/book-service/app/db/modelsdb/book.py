from sqlalchemy import Column, Integer, String, Boolean, text
from app.db.database import Base

class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    author = Column(String, nullable=False)
    isDeleted = Column(Boolean, nullable=False, server_default=text('false'))
