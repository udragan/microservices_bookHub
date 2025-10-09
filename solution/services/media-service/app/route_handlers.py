import os
from fastapi import UploadFile, HTTPException, status
from fastapi.responses import FileResponse

from app.auth.authorization import JwtUser, is_admin

MEDIA_DIR = os.getenv("MEDIA_STORAGE_PATH")
os.makedirs(MEDIA_DIR, exist_ok=True)

async def upload_avatar(file: UploadFile,
            jwt: JwtUser) -> str | HTTPException:
    saved_filename = f"avatar_{jwt.id}.png"
    file_path = os.path.join(MEDIA_DIR, saved_filename)
    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
    except:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="Unable to save media file")
    return {"avatar_path": saved_filename}

async def get_avatar(jwt: JwtUser) -> FileResponse | HTTPException:
    avatar_file_name = f"avatar_{jwt.id}.png"
    file_path = os.path.join(MEDIA_DIR, avatar_file_name)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    return FileResponse(file_path)
