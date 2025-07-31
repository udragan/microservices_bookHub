# this represents input json 
from pydantic import BaseModel

class BookBody(BaseModel):
    name: str
    author: str
