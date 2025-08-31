from pydantic import BaseModel

class BookDto(BaseModel):
    id: int
    title: str
    author: str
    isDeleted: bool

    model_config = {
        "from_attributes": True
    }
