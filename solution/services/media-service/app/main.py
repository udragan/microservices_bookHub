import app.env

import logging
from fastapi import FastAPI, Depends, File, UploadFile
from contextlib import asynccontextmanager

from app.auth.authorization import JwtUser, get_current_user
from app.route_handlers import upload_avatar, get_avatar, remove_avatar

@asynccontextmanager
async def lifespan(app: FastAPI):
    logging.info("✅ Server listening on port 8011")
    yield
    logging.info("👋 Server shutdown.")

app = FastAPI(lifespan=lifespan, title="Media service")

# endpoints ###########################

@app.get("/")
def root():
    return {"message": "Media Service is running"}

@app.post("/avatar")
async def upload(file: UploadFile,
        jwt: JwtUser = Depends(get_current_user)):
    return await upload_avatar(file, jwt)

@app.get("/avatar")
async def get(jwt: JwtUser = Depends(get_current_user)):
    return await get_avatar(jwt)

@app.delete("/avatar")
async def remove(jwt: JwtUser = Depends(get_current_user)):
    return await remove_avatar(jwt)

#######################################
