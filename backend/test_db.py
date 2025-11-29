from app.database import SessionLocal
from app.models.user import User
from app.models.ticket import Ticket

db = SessionLocal()
# Example hash -- in a real app, hash properly
new_user = User(username="testuser", hashed_password="fakehashed")
db.add(new_user)
db.commit()

new_ticket = Ticket(title="Sample Ticket", description="Issue description", user_id=new_user.id)
db.add(new_ticket)
db.commit()

user = db.query(User).first()
ticket = db.query(Ticket).first()
print(f"Inserted User: {user.username}, Ticket: {ticket.title}")
db.close()
