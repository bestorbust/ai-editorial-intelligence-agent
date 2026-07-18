from fastapi import APIRouter,Depends

from backend.services.container import intelligence_service

router = APIRouter(
    prefix="/opportunities",
    tags=["Opportunities"]
)


@router.get("/")
def discover():
    print("Starting")
    # return intelligence_service.discover()