from pydantic import BaseModel

class JwtUser(BaseModel):
    id: str
    name: str
    email: str
    role: str
