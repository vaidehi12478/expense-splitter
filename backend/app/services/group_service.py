from datetime import datetime, timedelta
from bson import ObjectId
from app.database import db
from app.models.group import GroupCreate, GroupBase
from app.models.user import UserBase
from typing import List

def create_group(payload: GroupCreate) -> GroupBase:
    group_doc = {
        "name": payload.name,
        "description": payload.description,
        "members": payload.members,
        "createdBy": payload.createdBy,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }

    result = db.groups.insert_one(group_doc)

    return GroupBase(
        id=str(result.inserted_id),
        name=payload.name,
        description=payload.description,
        members=payload.members,
        createdBy=payload.createdBy,
        createdAt=group_doc["createdAt"]
    )

def get_user_groups(user_email: str) -> List[GroupBase]:
    groups_cursor = db.groups.find({"members": user_email})
    groups = []
    for group in groups_cursor:
        groups.append(GroupBase(
            id=str(group["_id"]),
            name=group["name"],
            description=group.get("description"),
            members=group["members"],
            createdBy=group["createdBy"],
            createdAt=group["createdAt"]
        ))
    return groups

def add_member_to_group(group_id: str, member_email: str) -> bool:
    result = db.groups.update_one(
        {"_id": ObjectId(group_id)},
        {"$addToSet": {"members": member_email}, "$set": {"updatedAt": datetime.utcnow()}}
    )
    return result.modified_count > 0

def add_multiple_members_to_group(group_id: str, member_emails: List[str]) -> bool:
    """
    Add multiple members to a group at once.
    """
    result = db.groups.update_one(
        {"_id": ObjectId(group_id)},
        {"$addToSet": {"members": {"$each": member_emails}}, "$set": {"updatedAt": datetime.utcnow()}}
    )
    return result.modified_count > 0

def remove_member_from_group(group_id: str, member_email: str) -> bool:
    result = db.groups.update_one(
        {"_id": ObjectId(group_id)},
        {"$pull": {"members": member_email}, "$set": {"updatedAt": datetime.utcnow()}}
    )
    return result.modified_count > 0

