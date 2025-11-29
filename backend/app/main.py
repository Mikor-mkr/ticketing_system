from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import tickets, auth
from app.models import user, ticket 
app = FastAPI()
app.include_router(tickets.router)
app.include_router(auth.router)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],  # Allows GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],  # Allows all headers
)

@app.get("/")
def read_root():
    return {"message": "Hello World"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}