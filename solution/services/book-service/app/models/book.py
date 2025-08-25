from pydantic import BaseModel

# this represents input json 
class BookRequestBody(BaseModel):
    title: str
    author: str
