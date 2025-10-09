import app.env

import logging
from fastapi import FastAPI, Depends, File, UploadFile
from contextlib import asynccontextmanager

from app.auth.authorization import JwtUser, get_current_user
from app.route_handlers import upload_avatar, get_avatar

@asynccontextmanager
async def lifespan(app: FastAPI):
    logging.info("✅ Server listening on port 8010")
    yield
    logging.info("👋 Server shutdown.")

app = FastAPI(lifespan=lifespan, title="Media service")

# endpoints ###########################

@app.get("/")
def root():
    return {"message": "Media Service is running"}

@app.post("/avatar")
async def upload_file(jwt: JwtUser = Depends(get_current_user),
        file: UploadFile = File(...)):
    return await upload_avatar(file, jwt)

@app.get("/avatar")
async def get_file(jwt: JwtUser = Depends(get_current_user)):
    return await get_avatar(jwt)

#######################################
