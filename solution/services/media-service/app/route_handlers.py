import glob
import os
from fastapi import UploadFile, HTTPException, status
from fastapi.responses import FileResponse

from app.auth.authorization import JwtUser, is_admin

MEDIA_DIR = os.getenv("MEDIA_STORAGE_PATH")
AVATARS_PATH = os.path.join(MEDIA_DIR, "avatars")
os.makedirs(AVATARS_PATH, exist_ok=True)

async def upload_avatar(file: UploadFile,
            jwt: JwtUser) -> str | HTTPException:
    if not await remove_avatar(jwt):
        return
    file_ext = os.path.splitext(file.filename)[1]
    filename = f"{jwt.id}{file_ext}"
    file_path = os.path.join(AVATARS_PATH, filename)
    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
    except:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="Unable to save media file")
    return {"avatar_path": filename}

async def get_avatar(jwt: JwtUser) -> FileResponse | HTTPException:
    filename = jwt.id
    file_path = os.path.join(AVATARS_PATH, filename)
    matching_files = glob.glob(f"{file_path}.*")
    if not matching_files:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    return FileResponse(matching_files[0])

async def remove_avatar(jwt: JwtUser) -> bool | HTTPException:
    filename = jwt.id
    file_path = os.path.join(AVATARS_PATH, filename)
    matching_files = glob.glob(f"{file_path}.*")
    if not matching_files:
        return True
    try:
        os.remove(matching_files[0])
    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Remove avatar for user {jwt.email} failed")
    return True
