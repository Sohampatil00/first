from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.db.session import get_db
from backend.models.db_models import Centre, Room, SanctionedInventory, Camera, ReportedAttendance
from datetime import datetime
from backend.models.schemas import (
    CentreCreate, CentreResponse, RoomCreate, RoomResponse, 
    InventoryCreate, InventoryResponse, RoomBase, InventoryBase, RoomUpdate
)

router = APIRouter(prefix="/api/centres", tags=["Centres"])

@router.get("", response_model=List[CentreResponse])
def list_centres(db: Session = Depends(get_db)):
    return db.query(Centre).all()

@router.post("", response_model=CentreResponse)
def create_centre(centre_in: CentreCreate, db: Session = Depends(get_db)):
    existing = db.query(Centre).filter(Centre.id == centre_in.id).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Centre {centre_in.id} already exists")
    centre = Centre(**centre_in.model_dump())
    db.add(centre)
    
    # Auto-seed initial official reported roster from sanctioned capacity
    cap = centre.sanctioned_capacity or 20
    rep = ReportedAttendance(
        centre_id=centre.id,
        session_date=datetime.now().strftime("%Y-%m-%d"),
        session_start="09:00",
        session_end="17:00",
        reported_count=cap
    )
    db.add(rep)
    db.commit()
    db.refresh(centre)
    return centre

@router.get("/{centre_id}")
def get_centre_detail(centre_id: str, db: Session = Depends(get_db)):
    centre = db.query(Centre).filter(Centre.id == centre_id).first()
    if not centre:
        raise HTTPException(status_code=404, detail="Centre not found")
    
    rooms = db.query(Room).filter(Room.centre_id == centre_id).all()
    cameras = db.query(Camera).filter(Camera.centre_id == centre_id).all()
    inventory = db.query(SanctionedInventory).filter(SanctionedInventory.centre_id == centre_id).all()

    return {
        "centre": CentreResponse.model_validate(centre),
        "rooms": [RoomResponse.model_validate(r) for r in rooms],
        "cameras": cameras,
        "inventory": [InventoryResponse.model_validate(i) for i in inventory]
    }

@router.post("/{centre_id}/rooms", response_model=RoomResponse)
def add_room(centre_id: str, room_in: RoomBase, db: Session = Depends(get_db)):
    data = room_in.model_dump()
    if not data.get("id"):
        data.pop("id", None)
    room = Room(centre_id=centre_id, **data)
    db.add(room)
    
    # Auto-seed initial official reported roster for this room
    room_cap = room.capacity or 20
    rep = ReportedAttendance(
        centre_id=centre_id,
        room_id=room.id,
        session_date=datetime.now().strftime("%Y-%m-%d"),
        session_start="09:00",
        session_end="17:00",
        reported_count=room_cap
    )
    db.add(rep)
    db.commit()
    db.refresh(room)
    return room

@router.patch("/{centre_id}/rooms/{room_id}", response_model=RoomResponse)
def update_room(centre_id: str, room_id: str, room_up: RoomUpdate, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.centre_id == centre_id, Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    if room_up.roi_polygon_json is not None:
        room.roi_polygon_json = room_up.roi_polygon_json
    if room_up.name is not None:
        room.name = room_up.name
    if room_up.capacity is not None:
        room.capacity = room_up.capacity
    db.commit()
    db.refresh(room)
    return room

@router.post("/{centre_id}/inventory", response_model=InventoryResponse)
def add_inventory(centre_id: str, inv_in: InventoryBase, db: Session = Depends(get_db)):
    data = inv_in.model_dump()
    data["item_type"] = data["item_type"].lower().strip()
    
    existing = db.query(SanctionedInventory).filter(
        SanctionedInventory.centre_id == centre_id,
        SanctionedInventory.item_type == data["item_type"],
        SanctionedInventory.room_id == data.get("room_id")
    ).first()
    
    if existing:
        existing.required_quantity = data["required_quantity"]
        existing.active = data.get("active", True)
        db.commit()
        db.refresh(existing)
        return existing
        
    inv = SanctionedInventory(centre_id=centre_id, **data)
    db.add(inv)
    db.commit()
    db.refresh(inv)
    return inv

@router.get("/{centre_id}/inventory", response_model=List[InventoryResponse])
def get_inventory(centre_id: str, db: Session = Depends(get_db)):
    return db.query(SanctionedInventory).filter(SanctionedInventory.centre_id == centre_id).all()
