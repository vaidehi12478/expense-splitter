from fastapi import APIRouter, HTTPException, Depends
from app.models.group import GroupCreate, GroupBase, AddMembersPayload
from app.models.user import UserBase
from app.services import group_service  # <-- your file with the logic you pasted
from typing import List
from app.deps.current_user import get_current_user  # to protect routes

router = APIRouter(
    prefix="/groups",
    tags=["Groups"]
)


@router.post("/", response_model=GroupBase)
def create_group(payload: GroupCreate, current_user: UserBase = Depends(get_current_user)):
    """
    Create a new group. The logged-in user will be the creator.
    """
    payload.createdBy = current_user.email
    payload.members = [current_user.email]  # creator auto added
    new_group = group_service.create_group(payload)
    return new_group


@router.get("/", response_model=List[GroupBase])
def get_user_groups(current_user: UserBase = Depends(get_current_user)):
    """
    Fetch all groups the current user is a member of.
    """
    groups = group_service.get_user_groups(current_user.email)
    return groups


@router.post("/{group_id}/add-member")
def add_member(group_id: str, member_email: str, current_user: UserBase = Depends(get_current_user)):
    """
    Add a new member to a group.
    """
    success = group_service.add_member_to_group(group_id, member_email)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to add member (maybe already in group)")
    return {"message": f"{member_email} added successfully"}


@router.post("/{group_id}/add-members")
def add_multiple_members(group_id: str, payload: AddMembersPayload, current_user: UserBase = Depends(get_current_user)):
    """
    Add multiple members to a group at once.
    """
    success = group_service.add_multiple_members_to_group(group_id, payload.member_emails)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to add members (maybe already in group)")
    return {"message": f"{len(payload.member_emails)} member(s) added successfully"}


@router.post("/{group_id}/remove-member")
def remove_member(group_id: str, member_email: str, current_user: UserBase = Depends(get_current_user)):
    """
    Remove a member from a group.
    """
    success = group_service.remove_member_from_group(group_id, member_email)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to remove member")
    return {"message": f"{member_email} removed successfully"}
