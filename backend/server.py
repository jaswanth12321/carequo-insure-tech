from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# JWT configuration
SECRET_KEY = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Helper functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    password: str
    name: str
    role: str  # super_admin, company_admin, hr_manager, employee
    company_id: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str
    company_id: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    company_id: Optional[str] = None
    created_at: str

class Company(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    industry: str
    employee_count: int
    contact_email: EmailStr
    contact_phone: str
    address: str
    plan_type: str  # basic, premium, enterprise
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class CompanyCreate(BaseModel):
    name: str
    industry: str
    employee_count: int
    contact_email: EmailStr
    contact_phone: str
    address: str
    plan_type: str

class Employee(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    company_id: str
    employee_id: str
    department: str
    designation: str
    date_of_joining: str
    date_of_birth: str
    phone: str
    emergency_contact: str
    status: str  # active, inactive
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class EmployeeCreate(BaseModel):
    user_id: str
    employee_id: str
    department: str
    designation: str
    date_of_joining: str
    date_of_birth: str
    phone: str
    emergency_contact: str

class Claim(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    employee_id: str
    company_id: str
    claim_type: str  # medical, dental, vision, wellness
    amount: float
    description: str
    status: str  # submitted, under_review, approved, rejected
    documents: List[str] = []
    submission_date: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    review_date: Optional[str] = None
    reviewer_notes: Optional[str] = None
    reviewed_by: Optional[str] = None

class ClaimCreate(BaseModel):
    claim_type: str
    amount: float
    description: str
    documents: List[str] = []

class ClaimUpdate(BaseModel):
    status: str
    reviewer_notes: Optional[str] = None

class WellnessPartner(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    service_type: str  # video_consultation, elder_care, gym, mental_health
    description: str
    contact_email: EmailStr
    contact_phone: str
    availability: str
    pricing: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class WellnessPartnerCreate(BaseModel):
    name: str
    service_type: str
    description: str
    contact_email: EmailStr
    contact_phone: str
    availability: str
    pricing: str

class Booking(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    employee_id: str
    partner_id: str
    service_type: str
    booking_date: str
    booking_time: str
    status: str  # scheduled, completed, cancelled
    notes: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class BookingCreate(BaseModel):
    partner_id: str
    service_type: str
    booking_date: str
    booking_time: str
    notes: Optional[str] = None

class Financial(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_id: str
    transaction_type: str  # premium_payment, claim_payout
    amount: float
    description: str
    transaction_date: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    reference_id: Optional[str] = None

class FinancialCreate(BaseModel):
    transaction_type: str
    amount: float
    description: str
    reference_id: Optional[str] = None

# Authentication endpoints
@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    hashed_password = hash_password(user_data.password)
    
    # Create user
    user = User(
        email=user_data.email,
        password=hashed_password,
        name=user_data.name,
        role=user_data.role,
        company_id=user_data.company_id
    )
    
    await db.users.insert_one(user.model_dump())
    
    # Auto-create employee profile for employee role users
    if user_data.role == "employee" and user_data.company_id:
        employee = Employee(
            user_id=user.id,
            company_id=user_data.company_id,
            employee_id=f"EMP-{str(uuid.uuid4())[:8].upper()}",
            department="General",
            designation="Employee",
            date_of_joining=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            date_of_birth="1990-01-01",
            phone="0000000000",
            emergency_contact="0000000000",
            status="active"
        )
        await db.employees.insert_one(employee.model_dump())
    
    # Create access token
    access_token = create_access_token({"sub": user.id, "role": user.role})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(**user.model_dump())
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token({"sub": user["id"], "role": user["role"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(**user)
    }

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(**current_user)

# Company endpoints
@api_router.post("/companies", response_model=Company)
async def create_company(company_data: CompanyCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["super_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    company = Company(**company_data.model_dump())
    await db.companies.insert_one(company.model_dump())
    return company

@api_router.get("/companies", response_model=List[Company])
async def get_companies(current_user: dict = Depends(get_current_user)):
    if current_user["role"] == "super_admin":
        companies = await db.companies.find({}, {"_id": 0}).to_list(1000)
    else:
        companies = await db.companies.find({"id": current_user["company_id"]}, {"_id": 0}).to_list(1000)
    return companies

@api_router.get("/companies/{company_id}", response_model=Company)
async def get_company(company_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["super_admin", "company_admin"] and current_user["company_id"] != company_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    company = await db.companies.find_one({"id": company_id}, {"_id": 0})
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company

# Employee endpoints
@api_router.post("/employees", response_model=Employee)
async def create_employee(employee_data: EmployeeCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["company_admin", "hr_manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    employee = Employee(
        **employee_data.model_dump(),
        company_id=current_user["company_id"],
        status="active"
    )
    await db.employees.insert_one(employee.model_dump())
    return employee

@api_router.get("/employees", response_model=List[Employee])
async def get_employees(current_user: dict = Depends(get_current_user)):
    query = {"company_id": current_user["company_id"]}
    employees = await db.employees.find(query, {"_id": 0}).to_list(1000)
    return employees

@api_router.get("/employees/{employee_id}", response_model=Employee)
async def get_employee(employee_id: str, current_user: dict = Depends(get_current_user)):
    employee = await db.employees.find_one({"id": employee_id}, {"_id": 0})
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    if current_user["role"] == "employee" and employee["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return employee

@api_router.put("/employees/{employee_id}", response_model=Employee)
async def update_employee(employee_id: str, employee_data: EmployeeCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["company_admin", "hr_manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = await db.employees.update_one(
        {"id": employee_id},
        {"$set": employee_data.model_dump()}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    employee = await db.employees.find_one({"id": employee_id}, {"_id": 0})
    return employee

@api_router.delete("/employees/{employee_id}")
async def delete_employee(employee_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["company_admin", "hr_manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = await db.employees.delete_one({"id": employee_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    return {"message": "Employee deleted successfully"}

# Claims endpoints
@api_router.post("/claims", response_model=Claim)
async def create_claim(claim_data: ClaimCreate, current_user: dict = Depends(get_current_user)):
    # Get employee data
    employee = await db.employees.find_one({"user_id": current_user["id"]}, {"_id": 0})
    if not employee:
        raise HTTPException(status_code=404, detail="Employee profile not found")
    
    claim = Claim(
        **claim_data.model_dump(),
        employee_id=employee["id"],
        company_id=employee["company_id"],
        status="submitted"
    )
    await db.claims.insert_one(claim.model_dump())
    return claim

@api_router.get("/claims", response_model=List[Claim])
async def get_claims(current_user: dict = Depends(get_current_user)):
    if current_user["role"] == "employee":
        employee = await db.employees.find_one({"user_id": current_user["id"]}, {"_id": 0})
        if not employee:
            return []
        query = {"employee_id": employee["id"]}
    else:
        query = {"company_id": current_user["company_id"]}
    
    claims = await db.claims.find(query, {"_id": 0}).to_list(1000)
    return claims

@api_router.get("/claims/{claim_id}", response_model=Claim)
async def get_claim(claim_id: str, current_user: dict = Depends(get_current_user)):
    claim = await db.claims.find_one({"id": claim_id}, {"_id": 0})
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return claim

@api_router.put("/claims/{claim_id}", response_model=Claim)
async def update_claim(claim_id: str, claim_update: ClaimUpdate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["company_admin", "hr_manager"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = claim_update.model_dump()
    update_data["review_date"] = datetime.now(timezone.utc).isoformat()
    update_data["reviewed_by"] = current_user["id"]
    
    result = await db.claims.update_one(
        {"id": claim_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    claim = await db.claims.find_one({"id": claim_id}, {"_id": 0})
    return claim

# Wellness Partners endpoints
@api_router.post("/wellness-partners", response_model=WellnessPartner)
async def create_wellness_partner(partner_data: WellnessPartnerCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["super_admin", "company_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    partner = WellnessPartner(**partner_data.model_dump())
    await db.wellness_partners.insert_one(partner.model_dump())
    return partner

@api_router.get("/wellness-partners", response_model=List[WellnessPartner])
async def get_wellness_partners():
    partners = await db.wellness_partners.find({}, {"_id": 0}).to_list(1000)
    return partners

@api_router.get("/wellness-partners/{partner_id}", response_model=WellnessPartner)
async def get_wellness_partner(partner_id: str):
    partner = await db.wellness_partners.find_one({"id": partner_id}, {"_id": 0})
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    return partner

# Booking endpoints
@api_router.post("/bookings", response_model=Booking)
async def create_booking(booking_data: BookingCreate, current_user: dict = Depends(get_current_user)):
    employee = await db.employees.find_one({"user_id": current_user["id"]}, {"_id": 0})
    if not employee:
        raise HTTPException(status_code=404, detail="Employee profile not found")
    
    booking = Booking(
        **booking_data.model_dump(),
        employee_id=employee["id"],
        status="scheduled"
    )
    await db.bookings.insert_one(booking.model_dump())
    return booking

@api_router.get("/bookings", response_model=List[Booking])
async def get_bookings(current_user: dict = Depends(get_current_user)):
    employee = await db.employees.find_one({"user_id": current_user["id"]}, {"_id": 0})
    if not employee:
        return []
    
    bookings = await db.bookings.find({"employee_id": employee["id"]}, {"_id": 0}).to_list(1000)
    return bookings

# Financial endpoints
@api_router.post("/financials", response_model=Financial)
async def create_financial(financial_data: FinancialCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["super_admin", "company_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    financial = Financial(
        **financial_data.model_dump(),
        company_id=current_user["company_id"]
    )
    await db.financials.insert_one(financial.model_dump())
    return financial

@api_router.get("/financials", response_model=List[Financial])
async def get_financials(current_user: dict = Depends(get_current_user)):
    query = {"company_id": current_user["company_id"]}
    financials = await db.financials.find(query, {"_id": 0}).to_list(1000)
    return financials

# Dashboard statistics
@api_router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    company_id = current_user["company_id"]
    
    # Employee count
    employee_count = await db.employees.count_documents({"company_id": company_id, "status": "active"})
    
    # Claims statistics
    claims = await db.claims.find({"company_id": company_id}, {"_id": 0}).to_list(1000)
    total_claims = len(claims)
    pending_claims = len([c for c in claims if c["status"] == "submitted"])
    approved_claims = len([c for c in claims if c["status"] == "approved"])
    rejected_claims = len([c for c in claims if c["status"] == "rejected"])
    total_claim_amount = sum([c["amount"] for c in claims])
    approved_claim_amount = sum([c["amount"] for c in claims if c["status"] == "approved"])
    
    # Financial data
    financials = await db.financials.find({"company_id": company_id}, {"_id": 0}).to_list(1000)
    total_premiums = sum([f["amount"] for f in financials if f["transaction_type"] == "premium_payment"])
    total_payouts = sum([f["amount"] for f in financials if f["transaction_type"] == "claim_payout"])
    
    return {
        "employee_count": employee_count,
        "total_claims": total_claims,
        "pending_claims": pending_claims,
        "approved_claims": approved_claims,
        "rejected_claims": rejected_claims,
        "total_claim_amount": total_claim_amount,
        "approved_claim_amount": approved_claim_amount,
        "total_premiums": total_premiums,
        "total_payouts": total_payouts,
        "net_balance": total_premiums - total_payouts
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
