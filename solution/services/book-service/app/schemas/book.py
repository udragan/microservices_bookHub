from pydantic import BaseModel

# this represents input json 
class BookRequestBody(BaseModel):
    title: str
    author: str

# this is sent message to broker
class BookSchema(BaseModel):
    id: int
    title: str
    author: str

    model_config = {
        "from_attributes": True
    }
